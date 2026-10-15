import {SceneCar,SceneFloor,ScenePerson,SceneTablet} from './IllustrationPrimitives';

export default function JourneyIllustration({step}:{step:'vehicle'|'quote'|'calendar'|'drive'}){
 return <svg className="service-illustration journey-scene" data-journey={step} viewBox="0 0 240 150" aria-hidden="true" focusable="false">
 <SceneFloor/>
 {step==='vehicle'&&<>
  <path d="m26 24 118 8v85l-118-8Z" fill="#28402d" stroke="#718f60" strokeWidth="2"/>
  <path d="m34 34 102 7v53L34 87Z" fill="#1a2c20"/>
  <g transform="translate(24 18) scale(.68)"><SceneCar/></g>
  <path d="m39 99 73 5" stroke="#94b476" strokeWidth="3"/><path d="m117 103 7 4 6-6" stroke="#d6ef6e" strokeWidth="2" fill="none"/>
  <ScenePerson x={185} y={29} scale={1.04} tool={<SceneTablet/>}/>
 </>}
 {step==='quote'&&<>
  <path d="m30 29 92 7v83l-92-7Z" fill="#b8cba8"/>
  <path d="m37 38 78 6v62l-78-6Z" fill="#203823"/>
  <path d="m46 52 12 1m9 1 35 3m-56 6 12 1m9 1 35 3m-56 6 12 1m9 1 35 3" stroke="#8faf74" strokeWidth="3"/>
  <path d="m49 90 8 7 13-15" stroke="#d6ef6e" strokeWidth="3" fill="none"/>
  <path d="m114 67 26 6v51l-26-5Z" fill="#617f53" stroke="#a9c68b"/>
  <path d="m119 77 16 4v9l-16-4Z" fill="#d6ef6e"/><path d="m120 96 4 1m5 1 4 1m-13 5 4 1m5 1 4 1" stroke="#d2e4be" strokeWidth="3"/>
  <ScenePerson x={185} y={31} scale={1.02} tool={<SceneTablet/>}/>
 </>}
 {step==='calendar'&&<>
  <path d="m26 29 116 10v83L26 112Z" fill="#91a97e"/>
  <path d="m26 29 116 10v18L26 47Z" fill="#d6ef6e"/>
  <path d="m43 23 0 17m78-11v17" stroke="#243a25" strokeWidth="4" strokeLinecap="round"/>
  <g stroke="#4e6e42" strokeWidth="3"><path d="m42 63 9 1m15 1 9 1m15 1 9 1m15 1 9 1m-81 9 9 1m15 1 9 1m15 1 9 1m15 1 9 1m-81 9 9 1m15 1 9 1m15 1 9 1"/></g>
  <g className="journey-calendar-selected"><path d="m85 77 20 2v17l-20-2Z" fill="#d6ef6e"/><path d="m90 86 3 4 8-9" stroke="#2a4327" strokeWidth="2" fill="none"/></g>
  <ScenePerson x={185} y={30} scale={1.02} tool={<SceneTablet/>}/>
 </>}
 {step==='drive'&&<>
  <path d="m17 99 170 30m-178-17 174 31" stroke="#6c865c" strokeWidth="2"/>
  <path d="m24 116 13 3m13 2 13 3m13 2 13 3m13 2 13 3m13 2 13 3" stroke="#c8de9e" strokeWidth="2"/>
  <g className="journey-drive-car"><SceneCar/></g>
  <ScenePerson x={204} y={35} scale={.9}/>
  <path d="m170 25 28 6v20l-28-6Z" fill="#d6ef6e"/><path d="m175 37 6 6 11-11" stroke="#294024" strokeWidth="2" fill="none"/>
 </>}
 </svg>;
}
