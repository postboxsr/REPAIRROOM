import { before, beforeEach, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import type { Pool, PoolClient } from 'pg';
import { localPool } from '../../lib/booking/connection';
import { migrate } from '../../lib/booking/migrate';
import { seedDemo } from '../../lib/booking/seed';
import { BookingRepository, BookingError } from '../../lib/booking/repository';
let pool:Pool;
let lock:PoolClient;
let repo:BookingRepository;
const station='00000000-0000-4000-8000-000000000001';
const hasCode=(code:string)=>(error:unknown)=>error instanceof BookingError && error.code===code;
async function firstWindow(){const q=await repo.availability('compact');const window=q.windows.find(w=>w.starts_at.getTime()>Date.now()+20*60000);assert.ok(window);return window.id;}
async function reserve(){return repo.reserve({offerId:'compact',windowId:await firstWindow()});}
function payment(b:{id:string;amount_cents:number},eventId='event-'+randomUUID()){return {bookingId:b.id,eventId,amountCents:b.amount_cents,currency:'EUR'};}
async function counts(){return (await pool.query('SELECT (SELECT count(*)::int FROM bookings) AS bookings,(SELECT count(*)::int FROM booking_events) AS events,(SELECT count(*)::int FROM simulated_payment_events) AS payments')).rows[0];}
before(async()=>{
 pool=await localPool('test');lock=await pool.connect();
 const actual=await lock.query('SELECT current_database() AS name');assert.equal(actual.rows[0].name,'repairroom_test');
 await lock.query('SELECT pg_advisory_lock(724519033)');await migrate(pool);repo=new BookingRepository(pool);
});
beforeEach(async()=>{
 const actual=await pool.query('SELECT current_database() AS name');assert.equal(actual.rows[0].name,'repairroom_test');
 await pool.query('TRUNCATE booking_events,simulated_payment_events,bookings,window_offers,service_windows,service_offers,stations RESTART IDENTITY CASCADE');
 await seedDemo(pool,'test');
});
after(async()=>{if(lock){await lock.query('SELECT pg_advisory_unlock(724519033)');lock.release();}if(pool)await pool.end();});

test('migration and test seeding are repeatable and preserve an existing reservation',async()=>{
 const held=await reserve();await migrate(pool);await migrate(pool);await seedDemo(pool,'test');
 assert.equal((await repo.getByToken(held.token)).id,held.booking.id);
 assert.equal((await pool.query('SELECT count(*)::int AS n FROM repairroom_migrations')).rows[0].n,1);
 assert.equal((await pool.query('SELECT count(*)::int AS n FROM stations')).rows[0].n,1);
});
test('20 concurrent requests reserve exactly once, using DB price and a 10-minute hold',async()=>{
 const windowId=await firstWindow();
 const results=await Promise.allSettled(Array.from({length:20},()=>repo.reserve({offerId:'compact',windowId})));
 const successes=results.filter(r=>r.status==='fulfilled');assert.equal(successes.length,1);
 for(const rejected of results.filter(r=>r.status==='rejected'))assert.ok(hasCode('SLOT_TAKEN')(rejected.reason));
 const {booking,token}=(successes[0] as PromiseFulfilledResult<Awaited<ReturnType<typeof reserve>>>).value;
 assert.equal(booking.status,'pending_payment');assert.equal(booking.amount_cents,12900);
 assert.ok(booking.hold_expires_at.getTime()-booking.created_at.getTime()>590000);
 const stored=(await pool.query('SELECT management_token_hash FROM bookings WHERE id=$1',[booking.id])).rows[0];
 assert.notEqual(stored.management_token_hash,token);assert.equal(stored.management_token_hash,createHash('sha256').update(token).digest('hex'));
 assert.ok(!(await repo.availability('compact')).windows.some(w=>w.id===windowId));
 assert.deepEqual(await counts(),{bookings:1,events:1,payments:0});
});
test('incompatible offer rolls back without a booking or event',async()=>{
 const windowId=await firstWindow();await pool.query('DELETE FROM window_offers WHERE window_id=$1 AND offer_id=$2',[windowId,'compact']);
 await assert.rejects(repo.reserve({offerId:'compact',windowId}),hasCode('OFFER_UNAVAILABLE'));
 await assert.rejects(repo.availability('unsupported-vehicle'),hasCode('VEHICLE_UNSUPPORTED'));
 assert.deepEqual(await counts(),{bookings:0,events:0,payments:0});
});
test('too short and past windows cannot be reserved',async()=>{
 const windowId=(await repo.availability('compact')).windows[0].id;await pool.query("UPDATE service_windows SET ends_at=starts_at+interval '30 minutes' WHERE id=$1",[windowId]);
 await assert.rejects(repo.reserve({offerId:'compact',windowId}),hasCode('OFFER_UNAVAILABLE'));
 assert.ok(!(await repo.availability('compact')).windows.some(w=>w.id===windowId));
 await pool.query("UPDATE service_windows SET starts_at=clock_timestamp()-interval '5 minutes',ends_at=clock_timestamp()+interval '55 minutes' WHERE id=$1",[windowId]);
 await assert.rejects(repo.reserve({offerId:'compact',windowId}),hasCode('OFFER_UNAVAILABLE'));
});
test('immediately available future windows are bookable and holds end by service start',async()=>{
 const other=randomUUID(),window=randomUUID();
 await pool.query("INSERT INTO stations(id,name,data_kind) VALUES($1,'Immediate demo station','test')",[other]);
 await pool.query("INSERT INTO service_windows(id,station_id,starts_at,ends_at,data_kind) VALUES($1,$2,clock_timestamp()+interval '30 seconds',clock_timestamp()+interval '60 minutes 30 seconds','test')",[window,other]);
 await pool.query('INSERT INTO window_offers(window_id,offer_id) VALUES($1,$2)',[window,'compact']);
 assert.ok((await repo.availability('compact')).windows.some(w=>w.id===window));
 const held=await repo.reserve({offerId:'compact',windowId:window});
 assert.equal(held.booking.hold_expires_at.getTime(),held.booking.starts_at.getTime());
 assert.equal((await repo.confirmSimulatedPayment(payment(held.booking))).status,'confirmed');
});
test('overlapping capacity is rejected directly by PostgreSQL',async()=>{
 const q=await repo.availability('compact');const w=q.windows[0];
 await assert.rejects(pool.query("INSERT INTO service_windows(id,station_id,starts_at,ends_at,data_kind) VALUES($1,$2,$3::timestamptz+interval '15 minutes',$4::timestamptz+interval '15 minutes','test')",[randomUUID(),station,w.starts_at,w.ends_at]),(e:unknown)=>(e as {code:string}).code==='23P01');
});
test('price snapshot survives later price changes and payment rejects wrong totals/currency',async()=>{
 const held=await reserve();await pool.query('UPDATE service_offers SET amount_cents=17900 WHERE id=$1',['compact']);
 await assert.rejects(repo.confirmSimulatedPayment({...payment(held.booking),amountCents:1}),hasCode('PAYMENT_MISMATCH'));
 await assert.rejects(repo.confirmSimulatedPayment({...payment(held.booking),currency:'USD'}),hasCode('PAYMENT_MISMATCH'));
 assert.equal((await repo.getByToken(held.token)).amount_cents,12900);
 assert.deepEqual(await counts(),{bookings:1,events:1,payments:0});
 assert.equal((await repo.confirmSimulatedPayment(payment(held.booking))).status,'confirmed');
});
test('concurrent repeated simulation events are idempotent',async()=>{
 const held=await reserve();const event=payment(held.booking,'repeated-test-event');
 const results=await Promise.all(Array.from({length:8},()=>repo.confirmSimulatedPayment(event)));
 assert.ok(results.every(b=>b.status==='confirmed'));
 assert.deepEqual(await counts(),{bookings:1,events:2,payments:1});
 await assert.rejects(repo.confirmSimulatedPayment(payment(held.booking,'another-event')),hasCode('INVALID_STATE'));
});
test('expired hold is visible as expired, reclaimed, and cannot be confirmed later',async()=>{
 const held=await reserve();await pool.query("UPDATE bookings SET hold_expires_at=clock_timestamp()-interval '1 second' WHERE id=$1",[held.booking.id]);
 assert.equal((await repo.getByToken(held.token)).status,'expired');
 assert.ok((await repo.availability('compact')).windows.some(w=>w.id===held.booking.window_id));
 await assert.rejects(repo.confirmSimulatedPayment(payment(held.booking)),hasCode('HOLD_EXPIRED'));
 const replacement=await repo.reserve({offerId:'compact',windowId:held.booking.window_id});
 await assert.rejects(repo.confirmSimulatedPayment(payment(held.booking)),hasCode('HOLD_EXPIRED'));
 assert.equal((await repo.cancelByToken(held.token)).status,'expired');
 assert.equal((await repo.getByToken(replacement.token)).status,'pending_payment');
 assert.deepEqual(await counts(),{bookings:2,events:3,payments:0});
});
test('expiry is rechecked after waiting for a competing transaction',async()=>{
 const held=await reserve();const blocker=await pool.connect();let confirming:Promise<unknown>|undefined;
 try{
  await blocker.query('BEGIN');await blocker.query('SELECT id FROM service_windows WHERE id=$1 FOR UPDATE',[held.booking.window_id]);
  await blocker.query("UPDATE bookings SET hold_expires_at=clock_timestamp()+interval '150 milliseconds' WHERE id=$1",[held.booking.id]);
  // Attach rejection handling immediately while the confirmation waits for the window lock.
  confirming=assert.rejects(repo.confirmSimulatedPayment(payment(held.booking)),hasCode('HOLD_EXPIRED'));
  await blocker.query('SELECT pg_sleep(0.2)');await blocker.query('COMMIT');await confirming;
  assert.equal((await repo.getByToken(held.token)).status,'expired');assert.equal((await counts()).payments,0);
 }finally{await blocker.query('ROLLBACK');blocker.release();if(confirming)await confirming;}
});
test('concurrent cancellation is idempotent and cannot cancel a replacement booking',async()=>{
 const held=await reserve();await repo.confirmSimulatedPayment(payment(held.booking));
 const cancelled=await Promise.all(Array.from({length:8},()=>repo.cancelByToken(held.token)));
 assert.ok(cancelled.every(b=>b.status==='cancelled'));
 const next=await repo.reserve({offerId:'compact',windowId:held.booking.window_id});
 await repo.cancelByToken(held.token);assert.equal((await repo.getByToken(next.token)).status,'pending_payment');
 assert.equal((await pool.query("SELECT count(*)::int AS n FROM booking_events WHERE booking_id=$1 AND kind='cancelled'",[held.booking.id])).rows[0].n,1);
});
test('payment/cancellation race has consistent terminal state without resurrection',async()=>{
 const held=await reserve();const p=payment(held.booking);
 const results=await Promise.allSettled([repo.confirmSimulatedPayment(p),repo.cancelByToken(held.token)]);
 assert.equal(results[1].status,'fulfilled');assert.equal((await repo.getByToken(held.token)).status,'cancelled');
 const count=await counts();assert.ok(count.payments===0||count.payments===1);
 if(count.payments===0)await assert.rejects(repo.confirmSimulatedPayment(p),hasCode('INVALID_STATE'));
 else assert.equal((await repo.confirmSimulatedPayment(p)).status,'cancelled');
 assert.ok((await repo.availability('compact')).windows.some(w=>w.id===held.booking.window_id));
});
test('an event cannot be reused for a different booking',async()=>{
 const first=await reserve();await repo.confirmSimulatedPayment(payment(first.booking,'unique-payment-event'));
 const second=await reserve();await assert.rejects(repo.confirmSimulatedPayment(payment(second.booking,'unique-payment-event')),hasCode('EVENT_CONFLICT'));
 assert.equal((await repo.getByToken(second.token)).status,'pending_payment');
});
test('concurrent event reuse across bookings confirms only one and rolls back the loser',async()=>{
 const first=await reserve();const second=await reserve();
 const results=await Promise.allSettled([repo.confirmSimulatedPayment(payment(first.booking,'racing-event')),repo.confirmSimulatedPayment(payment(second.booking,'racing-event'))]);
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
 for(const result of results)if(result.status==='rejected')assert.ok(hasCode('EVENT_CONFLICT')(result.reason));
 const states=[(await repo.getByToken(first.token)).status,(await repo.getByToken(second.token)).status].sort();assert.deepEqual(states,['confirmed','pending_payment']);
 assert.deepEqual(await counts(),{bookings:2,events:3,payments:1});
});
test('a completed booking cannot be cancelled, and incorrect tokens reveal no data',async()=>{
 const held=await reserve();await repo.confirmSimulatedPayment(payment(held.booking));
 await pool.query("UPDATE bookings SET status='completed' WHERE id=$1",[held.booking.id]);
 await assert.rejects(repo.cancelByToken(held.token),hasCode('INVALID_STATE'));
 for(const token of ['../../etc/passwd','x'.repeat(43),held.token.slice(0,-1)+'!'])await assert.rejects(repo.getByToken(token),hasCode('NOT_FOUND'));
 assert.equal((await repo.getByToken(held.token)).status,'completed');
});
test('demo/test configuration refuses a live destination and never uses DATABASE_URL',async()=>{
 const live=process.env.DATABASE_URL;process.env.DATABASE_URL='postgresql://never-contact.example/live';const ignored=await localPool('test');try{assert.equal((await ignored.query('SELECT current_database() AS name')).rows[0].name,'repairroom_test');}finally{await ignored.end();if(live===undefined)delete process.env.DATABASE_URL;else process.env.DATABASE_URL=live;}
 const saved=process.env.REPAIRROOM_TEST_DATABASE_URL;process.env.REPAIRROOM_TEST_DATABASE_URL='postgresql://localhost/live_database';
 try{await assert.rejects(localPool('test'),/ausschließlich/);}finally{if(saved===undefined)delete process.env.REPAIRROOM_TEST_DATABASE_URL;else process.env.REPAIRROOM_TEST_DATABASE_URL=saved;}
});
