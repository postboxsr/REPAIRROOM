import {BookingRepository,type StoredBooking} from './repository';import {localPool} from './connection';
import type {Booking} from '../demo';
const globalState=globalThis as typeof globalThis & {rrDemoRepo?:Promise<BookingRepository>};
export function demoRepository(){return globalState.rrDemoRepo??=(localPool('demo').then(pool=>new BookingRepository(pool)));}
function converted(b:StoredBooking,token:string):Booking{
 if(b.status!=='confirmed'&&b.status!=='cancelled')throw Error('Diese Testbuchung ist noch nicht bestätigt oder bereits abgelaufen.');
 return {id:b.id,token,vehicle:b.vehicle_snapshot.name,slot:b.starts_at.toISOString(),price:b.amount_cents,status:b.status,payment:'simulated',created:b.created_at.toISOString()};
}
export async function postgresOffers(){return (await demoRepository()).offers();}
export async function postgresQuote(id:string){const q=await (await demoRepository()).availability(id);return {price:q.price,slots:q.windows.map(w=>w.starts_at.toISOString())};}
export async function postgresSlots(){const repo=await demoRepository();const offers=await repo.offers();const all=await Promise.all(offers.map(o=>repo.availability(o.id)));return [...new Set(all.flatMap(q=>q.windows.map(w=>w.starts_at.toISOString())))].sort();}
export async function postgresBook(offerId:string,slot:string){
 const repo=await demoRepository();const q=await repo.availability(offerId);const window=q.windows.find(w=>w.starts_at.toISOString()===slot);if(!window)throw Error('Dieses Testzeitfenster ist nicht mehr verfügbar. Bitte neu wählen.');
 const held=await repo.reserve({offerId,windowId:window.id});
 try{const confirmed=await repo.confirmSimulatedPayment({bookingId:held.booking.id,eventId:'demo-'+held.booking.id,amountCents:held.booking.amount_cents,currency:held.booking.currency});return converted(confirmed,held.token);}catch(e){await repo.cancelByToken(held.token);throw e;}
}
export async function postgresGet(token:string){return converted(await (await demoRepository()).getByToken(token),token);}
export async function postgresCancel(token:string){return converted(await (await demoRepository()).cancelByToken(token),token);}
