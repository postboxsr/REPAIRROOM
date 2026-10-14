import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { Pool, PoolClient } from 'pg';
export type BookingStatus='pending_payment'|'confirmed'|'cancelled'|'expired'|'completed';
export type StoredBooking={id:string;window_id:string;offer_id:string;status:BookingStatus;amount_cents:number;currency:'EUR';vehicle_snapshot:{name:string};hold_expires_at:Date;starts_at:Date;created_at:Date;data_kind:'demo'|'test'};
export class BookingError extends Error {
 constructor(public readonly code:string,message:string){super(message);this.name='BookingError';}
}
const hash=(token:string)=>createHash('sha256').update(token).digest('hex');
const validUuid=(s:string)=>typeof s==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
const projection="b.id,b.window_id,b.offer_id,CASE WHEN b.status='pending_payment' AND b.hold_expires_at <= clock_timestamp() THEN 'expired' ELSE b.status END AS status,b.amount_cents,b.currency,b.vehicle_snapshot,b.hold_expires_at,b.created_at,b.data_kind,w.starts_at";
export class BookingRepository {
 constructor(private readonly pool:Pool){}
 private async transaction<T>(fn:(client:PoolClient)=>Promise<T>):Promise<T>{
  const c=await this.pool.connect();try{await c.query('BEGIN');const result=await fn(c);await c.query('COMMIT');return result;}catch(e){await c.query('ROLLBACK');const error=e as {code?:string;constraint?:string};if(error.code==='23505'&&error.constraint==='simulated_payment_events_pkey')throw new BookingError('EVENT_CONFLICT','Dieses Test-Zahlungsereignis wurde bereits verwendet.');throw e;}finally{c.release();}
 }
 private async event(c:PoolClient,id:string,kind:string){await c.query('INSERT INTO booking_events(booking_id,kind) VALUES($1,$2)',[id,kind]);}
 private async row(c:PoolClient,id:string):Promise<StoredBooking>{const r=await c.query(`SELECT ${projection} FROM bookings b JOIN service_windows w ON w.id=b.window_id WHERE b.id=$1`,[id]);if(!r.rowCount)throw new BookingError('NOT_FOUND','Buchung nicht gefunden.');return r.rows[0];}
 // Same lock order everywhere: service window first, booking second.
 private async lockBooking(c:PoolClient,id:string){
  if(!validUuid(id))throw new BookingError('NOT_FOUND','Buchung nicht gefunden.');
  const found=await c.query('SELECT window_id FROM bookings WHERE id=$1',[id]);
  if(!found.rowCount)throw new BookingError('NOT_FOUND','Buchung nicht gefunden.');
  await c.query('SELECT id FROM service_windows WHERE id=$1 FOR UPDATE',[found.rows[0].window_id]);
  await c.query('SELECT id FROM bookings WHERE id=$1 FOR UPDATE',[id]);
 }
 async offers(){return (await this.pool.query('SELECT id,vehicle_name AS name,amount_cents AS price FROM service_offers ORDER BY amount_cents')).rows as {id:string;name:string;price:number}[];}
 async availability(offerId:string){
  const offer=await this.pool.query('SELECT amount_cents,currency FROM service_offers WHERE id=$1',[offerId]);
  if(!offer.rowCount)throw new BookingError('VEHICLE_UNSUPPORTED','Bitte ein unterstütztes Testfahrzeug wählen.');
  const windows=await this.pool.query(`SELECT w.id,w.starts_at,w.ends_at FROM service_windows w JOIN window_offers wo ON wo.window_id=w.id JOIN service_offers o ON o.id=wo.offer_id
   WHERE wo.offer_id=$1 AND w.data_kind=o.data_kind AND w.ends_at-w.starts_at >= make_interval(mins=>o.duration_minutes)
   AND w.starts_at > clock_timestamp()
   AND NOT EXISTS (SELECT 1 FROM bookings b WHERE b.window_id=w.id AND (b.status='confirmed' OR (b.status='pending_payment' AND b.hold_expires_at>clock_timestamp()))) ORDER BY w.starts_at`,[offerId]);
  return {price:offer.rows[0].amount_cents,currency:offer.rows[0].currency,windows:windows.rows as {id:string;starts_at:Date;ends_at:Date}[]};
 }
 async reserve(input:{offerId:string;windowId:string}){
  if(!validUuid(input.windowId))throw new BookingError('WINDOW_UNAVAILABLE','Dieses Testzeitfenster ist nicht verfügbar.');
  return this.transaction(async c=>{
   const window=await c.query('SELECT id FROM service_windows WHERE id=$1 FOR UPDATE',[input.windowId]);
   if(!window.rowCount)throw new BookingError('WINDOW_UNAVAILABLE','Dieses Testzeitfenster ist nicht verfügbar.');
   // Read authoritative offer and time AFTER acquiring the window lock.
   const matched=await c.query(`SELECT o.*,w.starts_at FROM service_windows w JOIN window_offers wo ON wo.window_id=w.id JOIN service_offers o ON o.id=wo.offer_id
    WHERE w.id=$1 AND o.id=$2 AND w.data_kind=o.data_kind AND w.starts_at>clock_timestamp() AND w.ends_at-w.starts_at>=make_interval(mins=>o.duration_minutes) FOR SHARE OF o`,[input.windowId,input.offerId]);
   if(!matched.rowCount)throw new BookingError('OFFER_UNAVAILABLE','Fahrzeug und Test-Servicefenster passen nicht zusammen.');
   const expired=await c.query("UPDATE bookings SET status='expired',updated_at=clock_timestamp() WHERE window_id=$1 AND status='pending_payment' AND hold_expires_at<=clock_timestamp() RETURNING id",[input.windowId]);
   for(const b of expired.rows)await this.event(c,b.id,'expired');
   const active=await c.query("SELECT id FROM bookings WHERE window_id=$1 AND status IN ('pending_payment','confirmed')",[input.windowId]);
   if(active.rowCount)throw new BookingError('SLOT_TAKEN','Dieses Testzeitfenster wurde bereits reserviert. Bitte neu wählen.');
   const offer=matched.rows[0];const id=randomUUID();const token=randomBytes(32).toString('base64url');
   const inserted=await c.query(`INSERT INTO bookings(id,window_id,offer_id,status,amount_cents,currency,vehicle_snapshot,management_token_hash,hold_expires_at,data_kind)
    SELECT $1,$2,$3,'pending_payment',$4,$5,$6,$7,LEAST(clock_timestamp()+interval '10 minutes',$9::timestamptz),$8 WHERE $9::timestamptz>clock_timestamp() RETURNING id`,[id,input.windowId,input.offerId,offer.amount_cents,offer.currency,JSON.stringify({name:offer.vehicle_name}),hash(token),offer.data_kind,offer.starts_at]);
   if(!inserted.rowCount)throw new BookingError('OFFER_UNAVAILABLE','Dieses Testzeitfenster hat bereits begonnen. Bitte neu wählen.');
   await this.event(c,id,'reserved');return {booking:await this.row(c,id),token};
  });
 }
 async getByToken(token:string):Promise<StoredBooking>{
  if(typeof token!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(token))throw new BookingError('NOT_FOUND','Buchung nicht gefunden.');
  const r=await this.pool.query(`SELECT ${projection} FROM bookings b JOIN service_windows w ON w.id=b.window_id WHERE management_token_hash=$1`,[hash(token)]);
  if(!r.rowCount)throw new BookingError('NOT_FOUND','Buchung nicht gefunden.');return r.rows[0];
 }
 // Simulation ONLY; a live adapter must verify provider signatures before confirmation.
 async confirmSimulatedPayment(input:{bookingId:string;eventId:string;amountCents:number;currency:string}):Promise<StoredBooking>{
  if(typeof input.eventId!=='string'||input.eventId.length<1||input.eventId.length>128)throw new BookingError('INVALID_EVENT','Ungültiges Test-Zahlungsereignis.');
  return this.transaction(async c=>{
   await this.lockBooking(c,input.bookingId);const b=await this.row(c,input.bookingId);
   if(input.amountCents!==b.amount_cents||input.currency!==b.currency)throw new BookingError('PAYMENT_MISMATCH','Zahlungsbetrag oder Währung stimmen nicht mit der Buchung überein.');
   const previous=await c.query('SELECT booking_id,amount_cents,currency FROM simulated_payment_events WHERE event_id=$1',[input.eventId]);
   if(previous.rowCount){const e=previous.rows[0];if(e.booking_id!==b.id||e.amount_cents!==input.amountCents||e.currency!==input.currency)throw new BookingError('EVENT_CONFLICT','Dieses Test-Zahlungsereignis gehört zu einer anderen Buchung.');return b;}
   if(b.status==='expired')throw new BookingError('HOLD_EXPIRED','Die Reservierungsfrist ist abgelaufen. Bitte neu buchen.');
   if(b.status!=='pending_payment')throw new BookingError('INVALID_STATE','Diese Buchung kann nicht mehr bestätigt werden.');
   // The DB clock is checked again in the mutation: expiry during this transaction cannot confirm.
   const updated=await c.query("UPDATE bookings SET status='confirmed',updated_at=clock_timestamp() WHERE id=$1 AND status='pending_payment' AND hold_expires_at>clock_timestamp() RETURNING id",[b.id]);
   if(!updated.rowCount)throw new BookingError('HOLD_EXPIRED','Die Reservierungsfrist ist abgelaufen. Bitte neu buchen.');
   await c.query('INSERT INTO simulated_payment_events(event_id,booking_id,amount_cents,currency) VALUES($1,$2,$3,$4)',[input.eventId,b.id,input.amountCents,input.currency]);
   await this.event(c,b.id,'payment_simulated');return this.row(c,b.id);
  });
 }
 async cancelByToken(token:string):Promise<StoredBooking>{
  const found=await this.getByToken(token);
  return this.transaction(async c=>{
   await this.lockBooking(c,found.id);const b=await this.row(c,found.id);
   if(b.status==='cancelled'||b.status==='expired'){
    if(b.status==='expired'){const changed=await c.query("UPDATE bookings SET status='expired',updated_at=clock_timestamp() WHERE id=$1 AND status='pending_payment' RETURNING id",[b.id]);if(changed.rowCount)await this.event(c,b.id,'expired');}
    return this.row(c,b.id);
   }
   if(b.status==='completed')throw new BookingError('INVALID_STATE','Abgeschlossener Service kann nicht storniert werden.');
   await c.query("UPDATE bookings SET status='cancelled',updated_at=clock_timestamp() WHERE id=$1",[b.id]);await this.event(c,b.id,'cancelled');return this.row(c,b.id);
  });
 }
}
