'use client';
import {useState} from 'react';
const zone='Europe/Berlin';
function dayKey(slot:string){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(slot));const part=(name:string)=>parts.find(p=>p.type===name)!.value;return `${part('year')}-${part('month')}-${part('day')}`;}
const fullTime=(slot:string)=>new Intl.DateTimeFormat('de-DE',{dateStyle:'medium',timeStyle:'short',timeZone:zone}).format(new Date(slot));
export default function SlotCalendar({slots,selected,onSelect}:{slots:string[];selected:string;onSelect:(slot:string)=>void}){
 const days=[...new Set(slots.map(dayKey))].sort();const months=[...new Set(days.map(d=>d.slice(0,7)))];
 const [chosenDay,setChosenDay]=useState('');const [chosenMonth,setChosenMonth]=useState('');
 const selectedDay=selected?dayKey(selected):'';
 const day=days.includes(chosenDay)?chosenDay:days.includes(selectedDay)?selectedDay:days[0];
 const month=months.includes(chosenMonth)?chosenMonth:day?.slice(0,7);
 if(!day||!month)return <p role="status">Keine Demo-Zeitfenster frei. Versuche es später erneut.</p>;
 const [year,monthNumber]=month.split('-').map(Number);const first=new Date(Date.UTC(year,monthNumber-1,1,12));
 const padding=(first.getUTCDay()+6)%7;const count=new Date(Date.UTC(year,monthNumber,0)).getUTCDate();const monthIndex=months.indexOf(month);
 const daily=slots.filter(s=>dayKey(s)===day&&day.startsWith(month));
 function move(index:number){const next=months[index];if(!next)return;setChosenMonth(next);setChosenDay(days.find(d=>d.startsWith(next))!);onSelect('');}
 return <div className="appointment-calendar"><div className="calendar-month"><div className="calendar-heading"><h3>{new Intl.DateTimeFormat('de-DE',{month:'long',year:'numeric',timeZone:zone}).format(first)}</h3><div><button type="button" aria-label="Vorheriger Monat" disabled={monthIndex===0} onClick={()=>move(monthIndex-1)}>←</button><button type="button" aria-label="Nächster Monat" disabled={monthIndex===months.length-1} onClick={()=>move(monthIndex+1)}>→</button></div></div><div className="calendar-week" aria-hidden="true">{['Mo','Di','Mi','Do','Fr','Sa','So'].map(d=><span key={d}>{d}</span>)}</div><div className="calendar-days" role="group" aria-label="Verfügbaren Tag wählen">{Array.from({length:padding},(_,i)=><span key={'empty'+i}/>)}{Array.from({length:count},(_,i)=>{const key=`${month}-${String(i+1).padStart(2,'0')}`;const available=days.includes(key);return <button type="button" key={key} disabled={!available} className={day===key?'active-day':''} aria-pressed={day===key} aria-label={new Intl.DateTimeFormat('de-DE',{dateStyle:'full',timeZone:zone}).format(new Date(key+'T12:00:00Z'))} onClick={()=>{setChosenDay(key);onSelect('');}}>{i+1}{available&&<span className="availability-dot" aria-hidden="true"/>}</button>;})}</div><p className="calendar-legend"><span/> Freie Testtermine · Berlin</p></div><div className="calendar-times"><h3>{new Intl.DateTimeFormat('de-DE',{weekday:'short',day:'numeric',month:'long',timeZone:zone}).format(new Date(day+'T12:00:00Z'))}</h3><p>Welche Uhrzeit passt Dir?</p><div className="slots">{daily.map(s=><button type="button" className={selected===s?'selected':''} aria-pressed={selected===s} aria-label={fullTime(s)} key={s} onClick={()=>onSelect(s)}>{new Intl.DateTimeFormat('de-DE',{hour:'2-digit',minute:'2-digit',timeZone:zone}).format(new Date(s))}<span aria-hidden="true"> →</span></button>)}</div></div></div>;
}
