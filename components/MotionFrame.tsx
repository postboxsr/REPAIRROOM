'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
export default function MotionFrame({children}:{children:ReactNode}){
 const ref=useRef<HTMLDivElement>(null);const [paused,setPaused]=useState(false);const [offscreen,setOffscreen]=useState(false);
 useEffect(()=>{const observer=new IntersectionObserver(([entry])=>setOffscreen(!entry.isIntersecting),{rootMargin:'80px'});if(ref.current)observer.observe(ref.current);return()=>observer.disconnect();},[]);
 return <div ref={ref} className="motion-frame" data-paused={paused||offscreen}><div className="motion-stage">{children}</div><button type="button" className="motion-toggle" aria-pressed={paused} onClick={()=>setPaused(v=>!v)}>{paused?'Animation abspielen':'Animation pausieren'}<svg aria-hidden="true" viewBox="0 0 16 16" width="12" height="12" fill="currentColor" style={{verticalAlign:'middle',marginLeft:6}}>{paused?<path d="M4 2 14 8 4 14Z"/>:<path d="M3 2h4v12H3ZM10 2h4v12h-4Z"/>}</svg></button><p className="scene-disclaimer">STILISIERTE SERVICE-SZENE · KEIN REALER STANDORT</p></div>;
}
