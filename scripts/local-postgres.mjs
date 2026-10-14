import { randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
const root=process.cwd();
const state=path.join(root,'.postgres');
const name='repairroom-postgres-local';
const image='postgres@sha256:3645570cccdfa447589da9f57dd740faa29b30938e861289a5574b6ca6b03826';
const label='repairroom.local=postgres-development';
const run=(args,options={})=>execFileSync('docker',args,{stdio:['pipe','pipe','pipe'],...options}).toString().trim();
async function config(existingContainer){
 await mkdir(state,{recursive:true,mode:0o700});
 try{return JSON.parse(await readFile(path.join(state,'local.json'),'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;if(existingContainer)throw Error('Lokale Zugangskonfiguration fehlt für vorhandenen Container; bestehende Daten bleiben unverändert.');}
 const value={host:'127.0.0.1',port:55432,user:'repairroom',password:randomBytes(32).toString('hex')};
 await writeFile(path.join(state,'local.json'),JSON.stringify(value),{mode:0o600,flag:'wx'});
 return value;
}
async function main(){
 const action=process.argv[2]||'up';
 const exists=run(['ps','-a','--filter',`name=^/${name}$`,'--format','{{.Names}}'])===name;
 if(exists && run(['inspect','--format','{{index .Config.Labels "repairroom.local"}}',name])!=='postgres-development')throw Error('Containername belegt; fremder Container wird nicht verändert.');
 if(action==='stop'){if(exists)run(['stop',name]);console.log('Lokales REPAIRROOM-PostgreSQL gestoppt. Daten bleiben erhalten.');return;}
 if(action!=='up')throw Error('Erlaubt: up oder stop. Keine automatische Datenlöschung.');
 const cfg=await config(exists);
 if(exists){if(run(['inspect','--format','{{.Config.Image}}',name])!==image)throw Error('Bestehendes Image weicht ab. Keine automatische Migration/Entfernung.');run(['start',name]);}
 else{
  // Local generated credential only; never print or commit this file.
  const envfile=path.join(state,'docker.env');
  await writeFile(envfile,`POSTGRES_USER=${cfg.user}\nPOSTGRES_PASSWORD=${cfg.password}\nPOSTGRES_DB=repairroom_demo\n`,{mode:0o600});
  run(['run','-d','--name',name,'--label',label,'--publish',`${cfg.host}:${cfg.port}:5432`,'--env-file',envfile,'--mount','type=volume,source=repairroom-postgres-local-data,target=/var/lib/postgresql/data',image]);
 }
 let ready=false;
 for(let i=0;i<40;i++){try{run(['exec',name,'pg_isready','-U',cfg.user,'-d','repairroom_demo']);ready=true;break;}catch{await new Promise(r=>setTimeout(r,250));}}
 if(!ready)throw Error('PostgreSQL wurde nicht bereit. Containerlog lokal prüfen; Zugangsdaten nicht ausgeben.');
 const sql="SELECT 1 FROM pg_database WHERE datname='repairroom_test'";
 if(run(['exec',name,'psql','-U',cfg.user,'-d','repairroom_demo','-tAc',sql])!=='1')run(['exec',name,'createdb','-U',cfg.user,'repairroom_test']);
 console.log('PostgreSQL bereit: repairroom_demo und repairroom_test, nur localhost:55432.');
}
main().catch(e=>{console.error(e instanceof Error?e.message:'PostgreSQL-Start fehlgeschlagen.');process.exitCode=1;});
