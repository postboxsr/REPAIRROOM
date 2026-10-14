import http from 'node:http';
import path from 'node:path';
import {readFile,stat,realpath} from 'node:fs/promises';
const root=path.resolve('.preview-output');
const prefix='/REPAIRROOM';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.json':'application/json','.txt':'text/plain; charset=utf-8','.woff2':'font/woff2','.ico':'image/x-icon'};
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname!==prefix && !url.pathname.startsWith(prefix+'/')){res.writeHead(404);res.end('Not found');return;}
  let target=path.resolve(root,'.'+decodeURIComponent(url.pathname.slice(prefix.length)||'/'));
  if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(404);res.end('Not found');return;}
  if((await stat(target)).isDirectory())target=path.join(target,'index.html');
  const resolved=await realpath(target);if(resolved!==root&&!resolved.startsWith(root+path.sep)){res.writeHead(404);res.end('Not found');return;}
  const body=await readFile(resolved);res.writeHead(200,{'Content-Type':types[path.extname(resolved)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);
 }catch{res.writeHead(404);res.end('Not found');}
});
server.listen(4173,'127.0.0.1',()=>console.log('Generated static preview test server ready on port 4173.'));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
