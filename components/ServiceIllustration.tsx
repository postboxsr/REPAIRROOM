import {SceneCar,SceneFloor,ScenePerson,SceneTablet,SceneWheel} from './IllustrationPrimitives';

function OilScene(){return <>
 <path d="m40 115 9-28h7l-2 32m66 2 6-24h8l-2 28" fill="#8d9f59"/>
 <g className="oil-service-car" transform="translate(0 -14)"><SceneCar/></g>
 <ScenePerson x={179} y={34} scale={.92} tool={<path d="m-25 38-6-8m-3 2 6-5" stroke="#d6ef6e" strokeWidth="2"/>}/>
 <path d="m81 120 17-6 18 6v8l-18 6-17-6Z" fill="#8da74e" stroke="#d6ef6e"/>
 <g className="service-oil-flow" fill="#d6ef6e"><path d="M98 96q-5 7 0 7 5 0 0-7Z"/><path d="M98 108q-3 4 0 4 3 0 0-4Z"/></g>
 <path d="m204 110 14 4v15l-14-4Z" fill="#d6ef6e"/><path d="m207 108 5-2 6 2" fill="none" stroke="#b2c586" strokeWidth="2"/>
 </>;}

function GlassScene(){return <>
 <g transform="translate(-10 13)"><SceneCar/></g>
 <path d="m68 66 12 3-6 7 10 5" stroke="#9cae8b" strokeWidth="1.5" fill="none"/>
 <ScenePerson x={179} y={27} scale={1.05}/>
 <g className="service-glass-panel"><path d="m126 35 28 7 9 39-43-10Z" fill="#799a7a" fillOpacity=".6" stroke="#d6ef6e" strokeWidth="2"/>
 <path d="m130 40 20 5 6 27-29-7Z" fill="#b0d3ac" fillOpacity=".3"/><path d="m132 48 13 3m-15 3 10 3" stroke="#dcebcf" strokeWidth="1.5"/>
 <path d="m134 61 11 3m-7-6-2 10" stroke="#203724" strokeWidth="3" strokeLinecap="round"/>
 </g>
 <path d="m211 69-4 47m-9-36 17 3" stroke="#8ea476" strokeWidth="3"/>
 </>;}

function BrakeScene(){return <>
 <g transform="translate(-9 -1)"><SceneCar frontWheel={false}/></g>
 <path d="m109 124 6-15 9 2 5 14Z" fill="#97ae58"/>
 <g transform="translate(174 66) scale(.8)"><ScenePerson x={0} y={0} kneeling tool={<path d="m-28 37 5-7m-8 7 7 3" fill="none" stroke="#d6ef6e" strokeWidth="2"/>}/></g>
 <g className="service-brake-tool"><path d="m129 104 19 9m-3-3 7-4" stroke="#d6ef6e" strokeWidth="2.5" strokeLinecap="round"/></g>
 <g transform="translate(45 123) rotate(-12)"><SceneWheel/></g>
 <path d="m158 127 23 5 16-5-24-5Z" fill="#3f553b" stroke="#8fa76f"/>
 </>;}

function TyreScene(){return <>
 <g transform="translate(-11 -6)"><SceneCar frontWheel={false}/></g>
 <path d="m36 116 9-25h9l-3 30m59 5 7-24 10 2-3 26" fill="#819b4b"/>
 <ScenePerson x={188} y={37} scale={.95}/>
 <g className="service-tyre" transform="translate(154 104)"><g className="service-tyre-spin"><circle r="19" fill="#0c1910" stroke="#536e4c" strokeWidth="3"/><circle r="12" fill="#9bb38c"/><path d="M0-11V11M-11 0h22m-18-8 16 16m-16 0L8-8" stroke="#435d3b" strokeWidth="2"/><circle r="3" fill="#d6ef6e"/></g></g>
 <g fill="#152619" stroke="#6f8c62"><ellipse cx="37" cy="130" rx="20" ry="7"/><path d="M17 121v9m40-9v9"/><ellipse cx="37" cy="121" rx="20" ry="7"/></g>
 </>;}

function InspectionScene(){return <>
 <g transform="translate(-15 8)"><SceneCar openHood/></g>
 <ScenePerson x={183} y={30} scale={1.04} tool={<SceneTablet/>}/>
 <g className="service-inspection-check"><rect x="18" y="23" width="42" height="34" rx="4" fill="#354a30" stroke="#8ba568"/>
 <path d="m25 36 3 3 6-7m4 3h14m-27 12 3 3 6-7m4 3h14" fill="none" stroke="#d6ef6e" strokeWidth="2"/>
 </g>
 <path d="m156 76-17-3" stroke="#9dbb7d" strokeWidth="1.5" strokeDasharray="3 3"/>
 </>;}

function ClimateScene(){return <>
 <g transform="translate(-14 7)"><SceneCar openHood/></g>
 <path d="m177 84 29 7v38l-29-7Z" fill="#708966" stroke="#abc993"/><path d="m182 91 18 5v12l-18-5Z" fill="#1f3424"/>
 <circle cx="182" cy="127" r="4" fill="#112517"/><circle cx="203" cy="133" r="4" fill="#112517"/>
 <path d="m180 112-21-10 0-22-13-6m43 43-24-9-1-26-18-5" fill="none" stroke="#a1bf83" strokeWidth="2"/>
 <ScenePerson x={204} y={57} scale={.7}/>
 <g className="service-airflow" fill="none" stroke="#d6ef6e" strokeWidth="1.6"><path d="M40 29q8-6 16 0t16 0M40 37q8-6 16 0t16 0M40 45q8-6 16 0t16 0"/></g>
 </>;}

function DiagnosisScene(){return <>
 <g transform="translate(-14 11)"><SceneCar/></g>
 <ScenePerson x={201} y={27} scale={.95}/>
 <path d="m157 99 33 8v16l-33-8Z" fill="#65805a"/><path d="m161 98 0-27 30 7v27Z" fill="#1d3021" stroke="#9ebd84" strokeWidth="2"/>
 <g className="service-diagnostic-trace"><path d="m165 89 5 1 3-7 5 15 3-6 5 1" fill="none" stroke="#d6ef6e" strokeWidth="2"/></g>
 <path d="m161 117-28-5-6-17m37 23v14m21-9v14m-25-5 30 8" fill="none" stroke="#829f6f" strokeWidth="2"/><circle cx="161" cy="133" r="3" fill="#122617"/><circle cx="188" cy="139" r="3" fill="#122617"/>
 </>;}

function RepairScene(){return <>
 <g transform="translate(-12 1)"><SceneCar openHood/></g>
 <path d="m19 25 0 70m-6-70h98l26 36m-19-19v19" fill="none" stroke="#637f55" strokeWidth="5"/>
 <path d="m120 57 9 6-1 15-10-6Z" fill="#d6ef6e"/>
 <ScenePerson x={188} y={37} scale={.96} tool={<path d="m-24 36 7-6m-2-3 4 5" stroke="#d6ef6e" strokeWidth="2" fill="none"/>}/>
 <g className="service-repair-part"><path d="m125 120 24 5 20-6 7 8-26 10-29-9Z" fill="#afc2a3" stroke="#6b8c5a"/></g>
 </>;}

function ShineScene(){return <>
 <g transform="translate(-12 9)"><SceneCar/></g>
 <ScenePerson x={185} y={32} scale={1.02} tool={<g className="service-polish-cloth"><path d="m-35 37 12-1 5 7-16 1Z" fill="#d6ef6e"/></g>}/>
 <path d="m194 119 18 5-2 14-15-4Z" fill="#708966"/><path d="m197 121 1-7 9 3 2 8" fill="none" stroke="#b0c99a" strokeWidth="1.5"/>
 <g className="service-shine" fill="#d6ef6e"><path d="m55 34 3 9 9 3-9 3-3 9-3-9-9-3 9-3Z"/><path d="m116 43 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z"/></g>
 </>;}

const scenes={oil:OilScene,glass:GlassScene,brakes:BrakeScene,tyre:TyreScene,check:InspectionScene,climate:ClimateScene,diagnosis:DiagnosisScene,repair:RepairScene,shine:ShineScene};
export default function ServiceIllustration({kind}:{kind:string}){
 const Scene=scenes[kind as keyof typeof scenes]||RepairScene;
 return <svg className="service-illustration detailed-scene" data-scene={kind} viewBox="0 0 240 150" aria-hidden="true" focusable="false"><SceneFloor/><Scene/></svg>;
}
