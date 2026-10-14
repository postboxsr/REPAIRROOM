import {postgresOffers,postgresQuote,postgresSlots,postgresBook,postgresGet,postgresCancel} from './booking/postgres-demo';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
export const vehicles = [{id:'compact',name:'Demo Kompakt · Benzin',price:12900},{id:'touring',name:'Demo Touring · Diesel',price:15900},{id:'sport',name:'Demo Sport · Benzin',price:18900}];
const root=path.join(process.cwd(),'.demo-data');
export function assertDemo(){if(process.env.REPAIRROOM_MODE!=='demo') throw new Error('Demo ist deaktiviert. Kein Live-Adapter angeschlossen.');}
function usePostgres(){const storage=process.env.REPAIRROOM_DEMO_STORAGE||'file';if(storage!=='file'&&storage!=='postgres')throw Error('Unbekannter Demo-Speicher.');return storage==='postgres';}
export async function demoVehicles(){assertDemo();return usePostgres()?postgresOffers():vehicles;}
export async function quote(id:string){assertDemo();return usePostgres()?postgresQuote(id):{price:vehicle(id).price,slots:await slots()};}
export type Booking={id:string;token:string;vehicle:string;slot:string;price:number;status:'confirmed'|'cancelled';payment:'simulated';created:string};
export function vehicle(id:string){const v=vehicles.find(v=>v.id===id);if(!v)throw new Error('Bitte ein unterstütztes Demo-Fahrzeug wählen.');return v;}
export async function slots(){assertDemo();if(usePostgres())return postgresSlots();await mkdir(root,{recursive:true});const now=Date.now(); const out:string[]=[];
 for(let day=0;day<7;day++){const d=new Date(now+day*86400000);d.setUTCMinutes(0,0,0);for(let h=9;h<17;h++){d.setUTCHours(h);if(d.getTime()>now){const s=d.toISOString();try{await readFile(path.join(root,encodeURIComponent(s)+'.slot'));}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')out.push(s);else throw e;}}}}return out;}
export async function book(vehicleId:string,slot:string){assertDemo();if(usePostgres())return postgresBook(vehicleId,slot);const v=vehicle(vehicleId);if(!(await slots()).includes(slot))throw new Error('Dieses Demo-Zeitfenster ist nicht mehr verfügbar. Bitte neu wählen.');
 const b:Booking={id:randomUUID(),token:randomUUID(),vehicle:v.name,slot,price:v.price,status:'confirmed',payment:'simulated',created:new Date().toISOString()};
 const lock=path.join(root,encodeURIComponent(slot)+'.slot');try{await writeFile(lock,b.id,{flag:'wx'});}catch(e){if((e as NodeJS.ErrnoException).code==='EEXIST')throw new Error('Zeitfenster bereits reserviert. Bitte neu wählen.');throw e;}
 try{await writeFile(path.join(root,b.token+'.json'),JSON.stringify(b),{flag:'wx'});}catch(e){await unlink(lock);throw e;}return b;}
export async function getBooking(token:string){assertDemo();if(usePostgres())return postgresGet(token);if(!/^[0-9a-f-]{36}$/.test(token))throw new Error('Ungültiger Verwaltungslink.');try{return JSON.parse(await readFile(path.join(root,token+'.json'),'utf8')) as Booking;}catch{throw new Error('Demo-Buchung nicht gefunden.');}}
export async function cancel(token:string){assertDemo();if(usePostgres())return postgresCancel(token);const b=await getBooking(token);if(b.status==='cancelled')return b;b.status='cancelled';await writeFile(path.join(root,token+'.json'),JSON.stringify(b));try{await unlink(path.join(root,encodeURIComponent(b.slot)+'.slot'));}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}return b;}
