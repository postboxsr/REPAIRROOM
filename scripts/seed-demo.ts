import {localPool} from '../lib/booking/connection';import {seedDemo} from '../lib/booking/seed';
async function main(){
const pool=await localPool('demo');try{await seedDemo(pool,'demo');console.log('Lokale Demo-Angebote und Testzeitfenster vorbereitet.');}finally{await pool.end();}
}
main().catch(e=>{console.error(e instanceof Error?e.message:"Datenbankvorbereitung fehlgeschlagen.");process.exitCode=1;});
