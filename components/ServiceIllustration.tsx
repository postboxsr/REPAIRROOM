import ServiceIcon from './ServiceIcon';
export default function ServiceIllustration({kind}:{kind:string}){
 const detail:Record<string,React.ReactNode>={
  oil:<g fill="#d6ef6e"><path d="m89 82 9-3 9 3v9l-9 3-9-3Z"/><path d="M98 71q-7 8 0 8 7 0 0-8Z"/></g>,
  glass:<g fill="none" stroke="#d6ef6e" strokeWidth="2"><path d="m85 58 5 4-4 4 8 3"/><path d="m78 55 40 5 13 10"/></g>,
  brakes:<g fill="none" stroke="#d6ef6e" strokeWidth="2"><ellipse cx="128" cy="99" rx="7" ry="9"/><path d="m133 91 4 9"/></g>,
  tyre:<g stroke="#8fa77e" strokeWidth="2"><ellipse cx="26" cy="102" rx="12" ry="16" fill="#17241a"/><ellipse cx="26" cy="102" rx="5" ry="9" fill="#536d4c"/></g>,
  check:<g><path d="m151 64 14 3v22l-14-3Z" fill="#d6ef6e"/><path d="m154 76 3 4 5-7" fill="none" stroke="#304325" strokeWidth="2"/></g>,
  climate:<g fill="none" stroke="#d6ef6e" strokeWidth="1.6"><path d="M42 33q8-8 16 0t16 0M42 40q8-8 16 0t16 0"/></g>,
  diagnosis:<g><path d="m147 76 17 4v13l-17-3Z" fill="#d6ef6e"/><path d="m149 85 4-4 3 6 4-2" fill="none" stroke="#304325" strokeWidth="1.5"/></g>,
  repair:<path d="m130 72 14-18 15 18" fill="#697e63" stroke="#d6ef6e" strokeWidth="1.5"/>,
  shine:<g fill="none" stroke="#d6ef6e" strokeWidth="1.6"><path d="m53 37 3 6 6 3-6 3-3 6-3-6-6-3 6-3Zm47 2 2 4 4 2-4 2-2 4-2-4-4-2 4-2Z"/></g>
 };
 return <svg className="service-illustration" viewBox="0 0 220 125" aria-hidden="true">
 <path d="m18 98 89-23 95 25-90 21Z" fill="#ffffff06" stroke="#ffffff12"/>
 <path d="m26 76 19-17 30-8 43 4 24 16 19 9-1 17-26 7-86-11-22-8Z" fill="#cbd1c4"/>
 <path d="m51 60 24-6 40 5 18 11-53-6Z" fill="#4d665c"/><path d="m83 57 2 8" stroke="#d4dccb" strokeWidth="2"/>
 <ellipse cx="56" cy="89" rx="10" ry="12" fill="#121e19"/><ellipse cx="56" cy="89" rx="5" ry="7" fill="#81977e"/><ellipse cx="128" cy="99" rx="10" ry="12" fill="#121e19"/><ellipse cx="128" cy="99" rx="5" ry="7" fill="#81977e"/>
 {detail[kind]}
 <g className="mini-service-person"><path d="m170 77-4 28h8l4-23 3 24h8l-3-29" fill="#7f9279"/><path d="m172 46 14 1 6 30-24 1-1-24Z" fill="#c4d0b9"/><path d="m173 47 4 12 7-11" fill="#d6ef6e"/><rect x="173" y="28" width="14" height="20" rx="7" fill="#a6a394"/><path d="m170 54-8 15-11-4" fill="none" stroke="#b1bfa7" strokeWidth="7" strokeLinecap="round"/></g>
 <circle cx="130" cy="27" r="21" fill="#d6ef6e"/>
 <g transform="translate(116 13) scale(.875)" color="#1d291c"><ServiceIcon kind={kind}/></g>
 </svg>}
