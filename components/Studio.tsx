'use client';
import React,{useState} from 'react';
import {FallIncidentWriter2026} from './AfterFall';
import {NoteGenerator} from './NoteGenerator';
export function Studio(){
 const [mode,setMode]=useState<'incidents'|'notes'>('incidents');
 return <><nav aria-label="Studio mode" className="flex flex-wrap gap-2 border-b border-[#cfdbd3] bg-[#eef3ed] px-4 py-3 md:px-8">{([['incidents','Incident documentation'],['notes','Note Generator']] as const).map(([id,label])=><button key={id} aria-pressed={mode===id} onClick={()=>setMode(id)} className={'rounded-lg border px-4 py-2 text-sm font-medium '+(mode===id?'border-[#216b56] bg-[#216b56] text-white':'border-[#cfdbd3] bg-white text-[#19352d]')}>{label}</button>)}</nav><div hidden={mode!=='incidents'}><FallIncidentWriter2026/></div><div hidden={mode!=='notes'}><NoteGenerator/></div></>;
}
