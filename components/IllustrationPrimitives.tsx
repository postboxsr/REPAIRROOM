import type {ReactNode} from 'react';

export function SceneFloor(){return <><ellipse cx="120" cy="130" rx="102" ry="15" fill="#111b15" opacity=".55"/><path d="m12 115 103-29 113 30-108 31Z" fill="#ffffff05" stroke="#ffffff12"/></>;}

export function SceneCar({openHood=false,frontWheel=true}:{openHood?:boolean;frontWheel?:boolean}){return <g className="illustrated-car">
 <path d="m26 76 19-17 30-8 43 4 24 16 19 9-1 17-26 7-86-11-22-8Z" fill="#cbd1c4"/>
 <path d="m51 60 24-6 40 5 18 11-53-6Z" fill="#4d665c"/>
 <path d="m83 57 2 8m24-5 4 9" stroke="#d4dccb" strokeWidth="2"/>
 <path d="m30 77 50-10 76 15-22 7Z" fill="#e4e9dc"/>
 <path d="m84 70 0 23m30-16v20" stroke="#879b87" strokeWidth=".8"/>
 <path d="m91 76 8 1m19 6 7 1" stroke="#4a6150" strokeWidth="1.5"/>
 <path d="m138 89 20-6v10l-21 6Z" fill="#294231"/>
 <path d="m139 82 9-3m4 3 5 1" stroke="#d6ef6e" strokeWidth="2"/>
 <SceneWheel x={56} y={89}/>
 {frontWheel?<SceneWheel x={128} y={99}/>:<g><ellipse cx="128" cy="99" rx="8" ry="10" fill="#a7b79f"/><ellipse cx="128" cy="99" rx="4" ry="6" fill="#50634d"/><path d="m133 91 2 10" stroke="#d6ef6e" strokeWidth="3"/></g>}
 {openHood&&<path d="m133 72 13-20 14 21-20 6Z" fill="#728969" stroke="#d6ef6e" strokeWidth="1.2"/>}
 </g>;}

export function SceneWheel({x=0,y=0}:{x?:number;y?:number}){return <g transform={`translate(${x} ${y})`}><ellipse rx="10" ry="12" fill="#111c16"/><ellipse rx="6" ry="8" fill="#77906e"/><ellipse rx="2" ry="3" fill="#d1dec4"/></g>;}

export function ScenePerson({x=170,y=30,scale=1,tool,kneeling=false}:{x?:number;y?:number;scale?:number;tool?:ReactNode;kneeling?:boolean}){return <g transform={`translate(${x} ${y}) scale(${scale})`} className="illustrated-person">
 <g className="person-body">
 {kneeling?<><path d="M7 52 3 67l13 9 12-1 3-7-13 0-2-16Z" fill="#7f9279"/><path d="m27 68 10 5-3 6-11-3" fill="#d3ddc9"/></>:<><path d="m6 52-5 29 8 1 7-25 4 27 8-1-4-31Z" fill="#7f9279"/><path d="m0 80-4 5 13 1 1-5m10 1v5l13 0-5-5" fill="#d3ddc9"/></>}
 <path d="m8 20 15 1 7 33-28-1-1-22q0-9 7-11Z" fill="#c4d0b9"/>
 <path d="m9 22 5 14 9-14" fill="#d6ef6e"/>
 <path d="m15 38 9 2v8l-9-1Z" fill="#90a382"/>
 <path d="m10 17 1 6h9l1-7" fill="#9f9d8d"/>
 <rect x="8" y="1" width="16" height="22" rx="8" fill="#aba99b"/>
 <path d="m24 27 10 14-6 12" fill="none" stroke="#b3c0a9" strokeWidth="7" strokeLinecap="round"/>
 <g className="person-arm"><path d="m4 29-11 15-14-4" fill="none" stroke="#b3c0a9" strokeWidth="7" strokeLinecap="round"/><path d="m-22 40-4-1" stroke="#9f9d8d" strokeWidth="5" strokeLinecap="round"/>{tool}</g>
 </g></g>;}

export function SceneTablet(){return <g><path d="m-29 31 14 3v19l-14-3Z" fill="#24392b" stroke="#d6ef6e" strokeWidth="1.5"/><path d="m-26 41 3 4 5-6" fill="none" stroke="#d6ef6e" strokeWidth="1.5"/></g>;}
