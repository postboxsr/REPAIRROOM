import {localPool} from '../lib/booking/connection';import {migrate} from '../lib/booking/migrate';
async function main(){
for(const kind of ['demo','test'] as const){const pool=await localPool(kind);try{await migrate(pool);console.log('Migrationen geprüft: repairroom_'+kind);}finally{await pool.end();}}
}
main().catch(e=>{console.error(e instanceof Error?e.message:"Datenbankvorbereitung fehlgeschlagen.");process.exitCode=1;});
