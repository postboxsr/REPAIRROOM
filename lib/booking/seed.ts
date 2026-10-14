import { randomUUID } from 'node:crypto';
import type { Pool } from 'pg';
const station='00000000-0000-4000-8000-000000000001';
export async function seedDemo(pool:Pool,kind:'demo'|'test'){
 const c=await pool.connect();
 try{
  await c.query('BEGIN');await c.query('SELECT pg_advisory_xact_lock(724519032)');
  const actual=await c.query('SELECT current_database() AS name');
  if(actual.rows[0].name!==(kind==='demo'?'repairroom_demo':'repairroom_test'))throw Error('Testdaten dürfen nur in der passenden REPAIRROOM-Datenbank erzeugt werden.');
  await c.query('INSERT INTO stations(id,name,data_kind) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[station,'Demo-Station (Testdaten)',kind]);
  for(const [id,name,price] of [['compact','Demo Kompakt · Benzin',12900],['touring','Demo Touring · Diesel',15900],['sport','Demo Sport · Benzin',18900]])await c.query('INSERT INTO service_offers(id,vehicle_name,amount_cents,duration_minutes,data_kind) VALUES($1,$2,$3,60,$4) ON CONFLICT DO NOTHING',[id,name,price,kind]);
  const now=Date.now();
  for(let day=0;day<7;day++)for(let hour=9;hour<17;hour++){
   const start=new Date(now+day*86400000);start.setUTCHours(hour,0,0,0);if(start.getTime()<=now)continue;
   const result=await c.query('INSERT INTO service_windows(id,station_id,starts_at,ends_at,data_kind) VALUES($1,$2,$3,$4,$5) ON CONFLICT(station_id,starts_at) DO UPDATE SET starts_at=EXCLUDED.starts_at RETURNING id',[randomUUID(),station,start,new Date(start.getTime()+3600000),kind]);
   for(const id of ['compact','touring','sport'])await c.query('INSERT INTO window_offers(window_id,offer_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[result.rows[0].id,id]);
  }
  await c.query('COMMIT');
 }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}
}
