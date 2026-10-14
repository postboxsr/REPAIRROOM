import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Pool, type PoolConfig } from 'pg';
export type LocalDatabase = 'demo' | 'test';
export async function localPool(kind:LocalDatabase):Promise<Pool> {
 const database=kind==='test'?'repairroom_test':'repairroom_demo';
 const envName=kind==='test'?'REPAIRROOM_TEST_DATABASE_URL':'REPAIRROOM_DEMO_DATABASE_URL';
 let config:PoolConfig;
 if(process.env[envName]){
  const u=new URL(process.env[envName]!);
  // These paths are ONLY local demo/test infrastructure; never fall back to DATABASE_URL.
  if(!['postgres:','postgresql:'].includes(u.protocol)||!['127.0.0.1','localhost','[::1]'].includes(u.hostname)||decodeURIComponent(u.pathname)!=='/'+database)throw Error('Für Demo/Integrationstests ist ausschließlich die passende lokale REPAIRROOM-Datenbank erlaubt.');
  config={connectionString:process.env[envName]};
 }else{
  const c=JSON.parse(await readFile(path.join(process.cwd(),'.postgres/local.json'),'utf8'));
  if(c.host!=='127.0.0.1'||c.port!==55432||c.user!=='repairroom'||typeof c.password!=='string')throw Error('Ungültige lokale Datenbankkonfiguration.');
  config={host:c.host,port:c.port,user:c.user,password:c.password,database};
 }
 return new Pool({...config,max:20,connectionTimeoutMillis:5000,idleTimeoutMillis:10000,statement_timeout:10000});
}
