'use client';
import React,{useEffect,useRef,useState} from 'react';
import {targets,sourceTypes,communicationStatuses,noteInputKey,type NoteInput,type NoteTarget} from '../lib/note-generator';
import {connectionState,connectionMessage,type Connection} from '../lib/connection';
type SavedNote={text:string;warnings:string[];sourceKey:string;edited:boolean};
const control='w-full rounded-xl border border-[#cfdbd3] bg-[#fafcfb] px-3 py-2.5 text-sm focus:outline-[#438f77]';
export function NoteGenerator(){
 const [source,setSource]=useState(''),[context,setContext]=useState('');
 const [sourceType,setSourceType]=useState<NoteInput['sourceType']>('Rough notes');
 const [communicationStatus,setCommunicationStatus]=useState<NoteInput['communicationStatus']>('Unknown');
 const [target,setTarget]=useState<NoteTarget|''>('');
 const [bank,setBank]=useState<Partial<Record<NoteTarget,SavedNote>>>({});
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[verified,setVerified]=useState(false);
 const [connection,setConnection]=useState<Connection>('checking');
 const revision=useRef(0),inflight=useRef<AbortController|null>(null),requesting=useRef(false);
 const sourceKey=noteInputKey({source,context,sourceType,communicationStatus});
 const current=target?bank[target]:undefined;
 const stale=!!current&&current.sourceKey!==sourceKey;
 const invalidate=()=>{revision.current++;setVerified(false);};
 const checkConnection=async()=>{
  setConnection('checking');
  try{const r=await fetch('/api/status',{cache:'no-store',signal:AbortSignal.timeout(15000)});setConnection(connectionState(r.status,await r.json()));}
  catch{setConnection('error');}
 };
 useEffect(()=>{void checkConnection();return()=>inflight.current?.abort();},[]);
 const selectTarget=(next:NoteTarget)=>{invalidate();setTarget(next);setMessage('');};
 const generate=async(replace=false)=>{
  if(!target||!source.trim()||requesting.current)return;
  if(current?.edited&&!replace){setMessage('Your manual edit is protected. Use Replace edited draft if you want a new version.');return;}
  if(replace&&!window.confirm('Replace your manually edited '+targets[target].label+' draft? Other target drafts are retained.'))return;
  const snapshot=revision.current,selected=target,key=sourceKey;
  const controller=new AbortController();inflight.current=controller;
  requesting.current=true;setBusy(true);setVerified(false);setMessage('Writing for '+targets[selected].label+' and checking against your source…');
  const timer=setTimeout(()=>controller.abort(),65000);
  try{
   const r=await fetch('/api/notes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({source,context,sourceType,communicationStatus,target:selected}),signal:controller.signal});
   const b=await r.json() as {target?:string;document?:unknown;warnings?:unknown;error?:string};
   if(revision.current!==snapshot){setMessage('Source or target changed while generating. Late result discarded; existing drafts retained.');return;}
   if(!r.ok){if(r.status===401||r.status===403)setConnection(connectionState(r.status,{}));setMessage(b.error||'Could not generate. Your source and existing drafts are unchanged.');return;}
   if(b.target!==selected||typeof b.document!=='string'||!b.document.trim()||!Array.isArray(b.warnings)||!b.warnings.every(w=>typeof w==='string'))throw Error('Invalid result');
   setBank(p=>({...p,[selected]:{text:b.document as string,warnings:b.warnings as string[],sourceKey:key,edited:false}}));
   setMessage(targets[selected].label+' draft ready. Automated checks assist review; compare with the source before copying.');
  }catch{if(revision.current===snapshot)setMessage('Generation failed or timed out. Your source and existing drafts are unchanged.');}
  finally{clearTimeout(timer);requesting.current=false;setBusy(false);inflight.current=null;}
 };
 const copy=async()=>{
  if(!current||busy)return;
  if(stale){setMessage('The source details changed. Regenerate and review this target before copying.');return;}
  if(!verified){setMessage('Confirm the draft against the source and action status before copying.');return;}
  try{await navigator.clipboard.writeText(current.text);setMessage('Copied note text only.');}
  catch{setMessage('Browser Copy was blocked. Select the note text and copy manually.');}
 };
 const clear=()=>{
  if(!window.confirm('Clear the Note Generator source and all five target drafts? Incident assessments are retained.'))return;
  invalidate();inflight.current?.abort();setSource('');setContext('');setBank({});setTarget('');setSourceType('Rough notes');setCommunicationStatus('Unknown');setMessage('Note Generator cleared. Incident work retained.');
 };
 return <div className="min-h-screen bg-[#f6f8f6] text-[#19352d]">
  <header className="bg-[#143e35] px-5 py-5 text-white md:px-10"><div className="text-2xl font-semibold">✳ AfterFall<span className="text-[#9bc8ac]">.</span></div><p className="mt-1 text-xs text-[#c7dcd1]">RN DOCUMENTATION STUDIO · NOTE GENERATOR</p></header>
  <main className="mx-auto max-w-7xl px-4 py-7 md:px-8">
   <div className="mb-6 flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-semibold md:text-3xl">Write for your recipient</h1><p className="mt-1 text-sm text-[#668076]">Paste once. Choose a target. Review and copy the adapted note.</p></div><button disabled={busy} onClick={clear} className="rounded-xl border bg-white px-4 py-2 text-sm">Clear note workspace</button></div>
   <div className="grid items-start gap-6 lg:grid-cols-2">
    <section className="min-w-0 space-y-5 rounded-2xl border border-[#dee7df] bg-white p-5 shadow-sm md:p-6">
     <h2 className="text-xl font-semibold">Source material</h2>
     <label className="block text-sm font-medium">Original text<textarea aria-label="Original text" rows={13} maxLength={16000} value={source} onChange={e=>{invalidate();setSource(e.target.value);}} placeholder="Paste rough notes, an email or a received reply…" className={control+' mt-2 resize-y leading-relaxed'}/><span className="mt-1 block text-xs font-normal text-[#668076]">{source.length.toLocaleString()} / 16,000 characters. Use de-identified text unless workplace-authorised.</span></label>
     <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Source type<select value={sourceType} onChange={e=>{invalidate();setSourceType(e.target.value as NoteInput['sourceType']);}} className={control+' mt-2'}>{sourceTypes.map(s=><option key={s}>{s}</option>)}</select></label><label className="text-sm font-medium">Communication status<select value={communicationStatus} onChange={e=>{invalidate();setCommunicationStatus(e.target.value as NoteInput['communicationStatus']);}} className={control+' mt-2'}>{communicationStatuses.map(s=><option key={s}>{s}</option>)}</select></label></div>
     <p className="text-xs text-[#668076]">Status describes the pasted communication. A draft or unknown status does not mean it was sent.</p>
     <label className="block text-sm font-medium">Additional context <span className="font-normal">(optional)</span><textarea rows={3} maxLength={4000} value={context} onChange={e=>{invalidate();setContext(e.target.value);}} placeholder="Clarify the recipient, timing, facts or the request you want to make." className={control+' mt-2 resize-y'}/></label>
    </section>
    <aside className="min-w-0 space-y-5">
     <section className="rounded-2xl border border-[#dee7df] bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">Choose one target</h2><div role="group" aria-label="Note target" className="mt-4 flex flex-wrap gap-2">{(Object.keys(targets) as NoteTarget[]).map(t=><button key={t} aria-pressed={target===t} onClick={()=>selectTarget(t)} className={'rounded-xl border px-4 py-2 text-sm font-medium '+(target===t?'border-[#216b56] bg-[#216b56] text-white':'border-[#cfdbd3] bg-[#fafcfb]')}>{targets[t].label}</button>)}</div>
      <p className="mt-3 text-sm text-[#668076]">{target?({ecase:'Factual progress note in paragraphs.',gp:'Concise clinical update or request.',nok:'Plain-language family update.',manager:'Factual operational update and support request.',pharmacy:'Medication or supply enquiry with exact supplied details.'})[target]:'Select eCase, GP, NOK, Manager or Pharmacy to continue.'}</p>
      <button disabled={busy||!target||!source.trim()} onClick={()=>void generate()} className="mt-4 w-full rounded-xl bg-[#216b56] px-4 py-3 font-medium text-white disabled:opacity-40">{busy?'Writing and checking…':target?targets[target].button:'Select a target'}</button>
      {current?.edited&&<button disabled={busy} onClick={()=>void generate(true)} className="mt-3 text-sm underline">Replace edited draft</button>}
      <p className="mt-3 text-xs text-[#668076]">Generate sends the original text and context through this private Site to OpenAI for rewriting and a second source review. Nothing is sent as an email or submitted to eCase.</p>
      <p className="mt-2 text-xs text-[#668076]" role="status">{connectionMessage[connection]}</p><button disabled={connection==='checking'} onClick={()=>void checkConnection()} className="mt-2 text-xs underline">Check AI connection</button>{connection==='sign_in_required'&&<a href="/signin-with-chatgpt?return_to=%2F" target="_top" className="ml-3 text-xs underline">Sign in to this Site</a>}
     </section>
     <section className="rounded-2xl border border-[#dee7df] bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">{target?targets[target].label+' draft':'Your draft'}</h2><button disabled={!current||busy} onClick={()=>void copy()} className="rounded-lg border px-3 py-2 text-sm text-[#256e56] disabled:opacity-40">Copy note</button></div>
      {current?<><textarea aria-label="Adapted note" rows={15} disabled={busy} value={current.text} onChange={e=>{if(!target)return;revision.current++;setBank(p=>({...p,[target]:{...current,text:e.target.value,edited:true}}));setVerified(false);}} className={control+' mt-4 resize-y bg-white leading-relaxed'}/>{current.edited&&<p className="mt-2 text-xs text-[#668076]">Manual edit protected. Other target drafts are retained.</p>}{stale&&<p className="mt-2 text-sm text-amber-800">Source details changed. This draft is retained but needs regeneration and review.</p>}</>:<p className="py-14 text-center text-sm text-[#668076]">Your selected target’s draft will appear here.</p>}
     </section>
     <section className="rounded-2xl border border-[#d5e2d7] bg-[#eef3ed] p-5"><h2 className="text-sm font-semibold">Review against the source</h2><p className="mt-1 text-xs text-[#697e70]">Automated review can miss errors. Check facts, medications, source attribution and action status. Warnings are outside copied text.</p>{current?.warnings.length? <ul className="mt-3 list-disc pl-5 text-sm">{current.warnings.map((w,i)=><li key={i}>{w}</li>)}</ul>:null}<label className="mt-3 flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={verified} disabled={!current||busy||stale} onChange={e=>setVerified(e.target.checked)}/><span>I checked this note against the source, including communication and action status.</span></label><p role="status" className="mt-3 text-sm text-[#256d58]">{message}</p></section>
    </aside>
   </div><footer className="mt-7 text-xs text-[#668076]">Source and separate target drafts stay in page memory. Switching modes retains them; refreshing or closing this page loses them. Automatic name protection is not implemented.</footer>
  </main>
 </div>;
}
