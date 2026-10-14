import {checkout} from '../../../lib/checkout';
import { NextRequest, NextResponse } from 'next/server';
import { assertDemo,demoVehicles,slots,quote,book,getBooking,cancel } from '../../../lib/demo';
export const runtime='nodejs';export const dynamic='force-dynamic';
function fail(e:unknown){return NextResponse.json({error:e instanceof Error?e.message:'Demo-Anfrage fehlgeschlagen.'},{status:400,headers:{'Cache-Control':'no-store'}});}
export async function GET(req:NextRequest){try{assertDemo();const token=req.nextUrl.searchParams.get('token');return NextResponse.json(token?await getBooking(token):{vehicles:await demoVehicles(),slots:await slots()},{headers:{'Cache-Control':'no-store'}});}catch(e){return fail(e);}}
export async function POST(req:NextRequest){try{assertDemo();if(req.headers.get('origin') && new URL(req.headers.get('origin')!).host!==req.headers.get('host'))return NextResponse.json({error:'Ungültiger Ursprung.'},{status:403});const b=await req.json();if(['reserve','resume','release','confirm'].includes(b.action))return NextResponse.json(await checkout(b.action,b));if(b.action==='quote'){return NextResponse.json(await quote(b.vehicle));}if(b.action==='book')return NextResponse.json(await book(b.vehicle,b.slot));if(b.action==='cancel')return NextResponse.json(await cancel(b.token));throw new Error('Unbekannte Aktion.');}catch(e){return fail(e);}}
