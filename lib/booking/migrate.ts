import { createHash } from 'node:crypto';
import { readFile,readdir } from 'node:fs/promises';
import path from 'node:path';
import type { Pool } from 'pg';
export async function migrate(pool:Pool){
 const client=await pool.connect();
 try{
  await client.query('BEGIN');
  await client.query('SELECT pg_advisory_xact_lock(724519031)');
  await client.query('CREATE TABLE IF NOT EXISTS repairroom_migrations (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT clock_timestamp())');
  const dir=path.join(process.cwd(),'db/migrations');
  for(const name of (await readdir(dir)).filter(n=>/^\d+_[a-z_]+\.sql$/.test(n)).sort()){
   const sql=await readFile(path.join(dir,name),'utf8');const hash=createHash('sha256').update(sql).digest('hex');
   const existing=await client.query('SELECT checksum FROM repairroom_migrations WHERE name=$1',[name]);
   if(existing.rowCount){if(existing.rows[0].checksum!==hash)throw Error('Bereits angewandte Migration wurde verändert: '+name);continue;}
   await client.query(sql);await client.query('INSERT INTO repairroom_migrations(name,checksum) VALUES($1,$2)',[name,hash]);
  }
  await client.query('COMMIT');
 }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
}
