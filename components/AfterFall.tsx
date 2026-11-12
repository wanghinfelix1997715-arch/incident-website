'use client';
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { type Data } from '../lib/assessment';
import { incidentSections, initialIncident, incidentExample, draftIncident, incidentWarnings, validateIncidentAI, woundCount, type Pathway } from '../lib/incident';
import { mergeDrafts, type Docs, type DocKey } from '../lib/drafts';
import { connectionState, connectionMessage, type Connection } from '../lib/connection';
const keys = ['summary', 'details', 'actions', 'investigation', 'ecase', 'gp', 'nok'] as const;
const label: Record<string, string> = {
  summary: 'Summary',
  details: 'Details',
  actions: 'Describe Immediate Action Taken',
  investigation: 'Investigation',
  ecase: 'eCase Progress Note',
  gp: 'GP Email',
  nok: 'NOK Email'
};
export const FallIncidentWriter2026 = () => {
  const [pathway, setPathway] = useState<Pathway>('fall');
  const [data, setData] = useState<Data>(()=>initialIncident('fall'));
  const sections = incidentSections(pathway, data);
  type Saved = {data:Data;active:number;tab:'riskman'|'ecase'|'gp'|'nok';docs:Partial<Docs>;edited:Set<string>;generated:boolean;dirty:boolean};
  const saved = useRef<Partial<Record<Pathway,Saved>>>({});
  const [active, setActive] = useState(0);
  const [tab, setTab] = useState<'riskman' | 'ecase' | 'gp' | 'nok'>('riskman');
  const [docs, setDocs] = useState<Partial<Docs>>({});
  const [edited, setEdited] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [connection, setConnection] = useState<Connection>('checking');
  const apiConfigured=connection==='ready';
  const [useAI, setUseAI] = useState(false);
  const [settings, setSettings] = useState(false);
  const revision = useRef(0);
  const checkConnection=async()=>{
    setConnection('checking');
    try {
      const response=await fetch('/api/status',{cache:'no-store',signal:AbortSignal.timeout(15000)});
      const state=connectionState(response.status,await response.json());
      setConnection(state);
      if(state!=='ready')setUseAI(false);
    }catch{setConnection('error');setUseAI(false);}
  };
  useEffect(() => {void checkConnection();}, []);
  const [generated, setGenerated] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState('');
  const update = (k: string, v: string) => {
    revision.current++;
    setData(p => ({
      ...p,
      [k]: v
    }));
    setDirty(generated);
    setVerified(false);
  };
  const warnings = useMemo(() => incidentWarnings(pathway,data), [pathway,data]);
  const changePathway = (next:Pathway) => {
    if(next===pathway || busy)return;
    saved.current[pathway]={data,active,tab,docs,edited,generated,dirty};
    revision.current++;
    const previous=saved.current[next];
    setPathway(next);setData(previous?.data||initialIncident(next));
    setActive(previous?.active||0);setTab(previous?.tab||'riskman');setDocs(previous?.docs||{});
    setEdited(previous?.edited||new Set());setGenerated(previous?.generated||false);setDirty(previous?.dirty||false);
    setVerified(false);setMessage('Separate '+next+' incident opened. Other pathway work is retained in this page until refresh or close.');
  };
  const removeWound = () => {
    if(!window.confirm('Remove the last wound and its assessment? Existing drafts will need regeneration.'))return;
    const count=woundCount(data);
    revision.current++;setData(p=>Object.fromEntries(Object.entries({...p,woundCount:String(count-1)}).filter(([k])=>!k.startsWith('wound_'+(count-1)+'_'))));
    setDirty(generated);setVerified(false);
  };
  const make = async (replaceEdited = false) => {
    const snapshot = revision.current;
    const canonical = draftIncident(pathway,data);
    const protectedFields = replaceEdited ? new Set<string>() : edited;
    setVerified(false);
    setBusy(true);
    let next = canonical;
    let status = 'Four local drafts generated. Review before submission.';
    try {
      if (useAI) {
        const response = await fetch('/api/generate', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({pathway,incident:data}), signal:AbortSignal.timeout(30000)});
        const result = await response.json() as {documents?:unknown;reason?:string;error?:string};
        if (!response.ok) {
          setConnection(connectionState(response.status,{}));setUseAI(false);
          status=(result.error||'Server AI request failed.')+' Four local drafts generated.';
        } else {
          if (validateIncidentAI(pathway,result.documents, canonical)) next = result.documents;
          status = result.reason || 'Local drafts ready.';
        }
      }
    } catch { status = 'AI unavailable. Four local drafts generated.'; }
    if (revision.current !== snapshot) {
      setBusy(false);
      setMessage('Assessment changed while generating. Results discarded; generate again.');
      return;
    }
    setDocs(current => mergeDrafts(current, next, protectedFields));
    if (replaceEdited) setEdited(new Set());
    setGenerated(true);
    setDirty(false);
    setBusy(false);
    setMessage(status + (protectedFields.size ? ' Manual edits preserved; review these against the updated assessment.' : ''));
  };
  const copy = async (s: string) => {
    if (busy) return;
    if (dirty) { setMessage('Assessment changed. Regenerate and review before copying.'); return; }
    if (!verified) {
      setMessage('Please confirm completion status before copying.');
      return;
    }
    try {
      await navigator.clipboard.writeText(s);
      setMessage('Copied document text only.');
    } catch {
      setMessage('Copy was blocked by this browser. Select text and copy manually.');
    }
  };
  const fields = sections[active].fields;
  const selected: DocKey[] = tab === 'riskman' ? ['summary', 'details', 'actions', 'investigation'] : [tab];
  return <div className="min-h-screen bg-[#f6f8f6] text-[#19352d] font-sans">
 <header className="bg-[#143e35] text-white px-5 md:px-10 py-5 flex items-center justify-between gap-3"><div><div className="text-2xl font-semibold tracking-tight">✳ AfterFall<span className="text-[#9bc8ac]">.</span></div><div className="text-xs text-[#c7dcd1] mt-1">RN DOCUMENTATION STUDIO · V1 WEB</div></div><button onClick={() => setSettings(!settings)} className="text-xs border border-[#7ca996] rounded-full px-3 py-1">{apiConfigured ? 'Server AI configured' : 'Local drafts available'}</button></header>
 <main className="max-w-7xl mx-auto px-4 md:px-8 py-7">{settings && <div className="mb-5 rounded-2xl bg-white border p-5 text-sm"><h2 className="font-semibold">AI connection</h2><p role="status" className="mt-2">{connectionMessage[connection]} Local templates remain available.</p><button disabled={connection==='checking'} onClick={()=>void checkConnection()} className="mt-3 border rounded-lg px-3 py-2">Check connection again</button>{connection==='sign_in_required' && <a href="/signin-with-chatgpt?return_to=%2F" target="_top" className="ml-3 underline">Sign in to this Site</a>}<p className="mt-2">API credentials belong in the Site runtime secret named OPENAI_API_KEY, never in a document, source file or chat. Optional model setting: OPENAI_MODEL.</p><p className="mt-2">AI formatting sends the entered assessment through this Site to OpenAI. Assessment and drafts stay in page memory; the app does not save them. AI requests use store:false. Closing or refreshing this page clears your work.</p><button onClick={()=>setSettings(false)} className="mt-3 border rounded-lg px-3 py-2">Close settings</button></div>}<div className="flex flex-wrap justify-between items-center gap-4 mb-7"><div><h1 className="text-2xl md:text-3xl font-semibold">{pathway==='fall'?'Post-fall documentation':pathway==='wound'?'Wound / skin injury documentation':'Infection documentation'}</h1><p className="text-sm text-[#668076] mt-1">One assessment. Four ready-to-review documents.</p></div><div className="flex gap-2"><button onClick={() => {
            if((generated||Object.keys(data).some(k=>k!=='woundCount'&&data[k])) && !window.confirm('Replace the current pathway assessment and drafts with a synthetic example? Other pathways are retained.')) return;
            revision.current++;
            setData(incidentExample(pathway));
            setDocs({});
            setEdited(new Set());
            setDirty(false);
            setGenerated(false);
            setVerified(false);
            setMessage('Synthetic case loaded.');
          }} disabled={busy} className="border rounded-xl bg-white px-4 py-2 text-sm font-medium hover:bg-[#e8f0ea]">Load synthetic example</button><button onClick={() => {
            if(!window.confirm('Clear this pathway assessment and its drafts? Other pathways are retained.')) return;
            revision.current++;
            setData(initialIncident(pathway));
            setActive(0);
            setTab('riskman');
            setMessage('Current pathway cleared. Other pathways are retained.');
            setEdited(new Set());
            setDocs({});
            setGenerated(false);
            setDirty(false);
            setVerified(false);
          }} disabled={busy} className="border rounded-xl bg-white px-4 py-2 text-sm">Clear</button></div></div>
 <div className="mb-5 flex flex-wrap gap-2 items-center" role="group" aria-label="Incident pathway"><span className="text-sm font-semibold mr-2">Incident type</span>{(['fall','wound','infection'] as const).map(p=><button key={p} disabled={busy} aria-pressed={pathway===p} onClick={()=>changePathway(p)} className={'px-4 py-2 rounded-xl border text-sm '+(pathway===p?'bg-[#216b56] text-white border-[#216b56]':'bg-white border-[#cfdbd3]')}>{p==='fall'?'Fall':p==='wound'?'Wound / skin injury':'Infection'}</button>)}</div>
 <div className="grid lg:grid-cols-[1.06fr_.94fr] gap-6 items-start">
 <section className="bg-white border border-[#dee7df] rounded-2xl shadow-sm overflow-hidden"><div className="p-5 border-b"><div className="text-xs uppercase tracking-widest text-[#70887b]">Step 01</div><h2 className="text-xl font-semibold">Incident assessment</h2><p className="text-sm text-[#779083]">Select what you assessed; add context where needed.</p></div>
 <nav className="grid grid-cols-3 sm:grid-cols-6 border-b bg-[#f8faf8]">{sections.map((s, i) => <button key={i} onClick={() => setActive(i)} title={s.title} aria-current={i === active ? 'step' : undefined} className={'px-2 py-3 text-xs border-b-2 ' + (i === active ? 'border-[#2d8067] bg-white font-semibold' : 'border-transparent text-[#658075]')}>{String(i + 1).padStart(2, '0')}<span className="block truncate mt-1">{s.title.split(' ')[0]}</span></button>)}</nav>
 <div className="p-5 md:p-6"><h3 className="text-lg font-semibold">{sections[active].title}</h3><p className="text-sm text-[#71877b] mb-5">{sections[active].sub}</p>{pathway==='wound'&&active===1&&<div className="mb-4 flex flex-wrap items-center gap-3 text-sm"><span>{woundCount(data)} separate wound(s)</span><button disabled={woundCount(data)>=20} className="border rounded-lg px-3 py-2" onClick={()=>update('woundCount',String(woundCount(data)+1))}>Add another wound</button>{woundCount(data)>1&&<button className="border rounded-lg px-3 py-2" onClick={removeWound}>Remove last wound</button>}</div>}<div className="grid sm:grid-cols-2 gap-4">{fields.map(f => {
                const [id, title, kind] = f;
                const options = (f as readonly string[])[3];
                const wide = kind === 'textarea';
                return <label key={id} className={'flex flex-col gap-1.5 text-sm font-medium ' + (wide ? 'sm:col-span-2' : '')}><span>{title}</span>{kind === 'select' ? <select value={data[id] || (options || '').split('|')[0]} onChange={e => update(id, e.target.value)} className="w-full bg-[#fafcfb] border border-[#cfdbd3] rounded-lg px-3 py-2.5 focus:outline-[#438f77]">{(options || '').split('|').map(o => <option key={o}>{o}</option>)}</select> : kind === 'textarea' ? <textarea rows={3} value={data[id] || ''} onChange={e => update(id, e.target.value)} placeholder="Add relevant details…" className="w-full resize-y bg-[#fafcfb] border border-[#cfdbd3] rounded-lg px-3 py-2.5 focus:outline-[#438f77]" /> : <input type={kind} value={data[id] || ''} onChange={e => update(id, e.target.value)} placeholder="Not entered" className="w-full bg-[#fafcfb] border border-[#cfdbd3] rounded-lg px-3 py-2.5 focus:outline-[#438f77]" />}</label>;
              })}</div>
 <div className="flex justify-between gap-3 mt-7 pt-5 border-t"><button disabled={active === 0} onClick={() => setActive(a => a - 1)} className="px-4 py-2 border rounded-lg disabled:opacity-30">← Back</button><button onClick={() => setActive(a => Math.min(a + 1, 5))} className="px-4 py-2 border rounded-lg">{active === 5 ? 'Last section' : 'Next section →'}</button></div></div></section>
 <aside className="space-y-4 lg:sticky lg:top-4"><div className="bg-white border border-[#dee7df] rounded-2xl p-5 shadow-sm"><div className="text-xs uppercase tracking-widest text-[#70887b]">Step 02</div><div className="flex items-center justify-between mt-1"><h2 className="text-xl font-semibold">Generate documents</h2><span className="text-xs text-[#7c8f83]">4 outputs</span></div><button disabled={busy} onClick={() => make()} className="mt-4 w-full bg-[#216b56] text-white font-medium rounded-xl py-3 hover:bg-[#185540]">{busy ? 'Generating…' : generated ? '↻ Regenerate drafts' : '✦ Generate all drafts'}</button><p className="mt-2 text-xs text-[#81958b]">Local templates always remain available. AI formatting is optional and checked against documented facts.</p><label className="flex items-center gap-2 mt-3 text-sm"><input type="checkbox" checked={useAI} disabled={busy || !apiConfigured} onChange={e => setUseAI(e.target.checked)} />Use server AI formatting</label>{!apiConfigured && <button onClick={()=>setSettings(true)} className="text-xs underline mt-2">AI connection settings</button>}{edited.size > 0 && <div className="mt-3 text-xs text-[#668076]">{edited.size} manually edited field(s) protected. Regenerate updates other fields.<button disabled={busy} onClick={()=>{if(window.confirm('Replace all manually edited drafts with newly generated text?')) make(true);}} className="block underline mt-2">Replace all drafts, including edits</button></div>}{dirty && <p className="mt-3 text-sm text-amber-700">Assessment changed since generation. Existing edited drafts are preserved.</p>}</div>
 <div className="bg-white border border-[#dee7df] rounded-2xl shadow-sm overflow-hidden"><div className="p-5 border-b"><div className="text-xs uppercase tracking-widest text-[#70887b]">Step 03</div><h2 className="text-xl font-semibold">Review & copy</h2></div><div className="grid grid-cols-4 bg-[#f7faf8] border-b">{(['riskman', 'ecase', 'gp', 'nok'] as const).map(t => <button key={t} onClick={() => setTab(t)} className={'text-xs sm:text-sm py-3 border-b-2 ' + (tab === t ? 'border-[#2d8067] font-semibold bg-white' : 'border-transparent')}>{t === 'riskman' ? 'RiskMan' : t === 'ecase' ? (pathway==='fall'?'eCase':'Progress note') : t === 'gp' ? 'GP email' : 'NOK email'}</button>)}</div>
 <div className="p-4 space-y-4">{generated ? selected.map(k => <div key={k}><div className="flex justify-between items-center mb-2"><span className="font-semibold text-sm">{k==='ecase'&&pathway!=='fall'?'Progress Note':label[k]}</span><button disabled={busy} onClick={() => copy(docs[k] || '')} className="text-xs font-semibold text-[#256e56] border px-3 py-1.5 rounded-lg hover:bg-[#f1f7f2]">Copy</button></div><textarea rows={k === 'ecase' ? 18 : k === 'actions' || k === 'details' ? 8 : 5} aria-label={k==='ecase'&&pathway!=='fall'?'Progress Note':label[k]} disabled={busy} value={docs[k] || ''} onChange={e => {setDocs(p => ({...p,[k]:e.target.value}));setEdited(p=>new Set([...p,k]));setVerified(false);}} className="w-full text-sm leading-relaxed border border-[#d6e3db] rounded-xl p-3 bg-white resize-y focus:outline-[#438f77]" /></div>) : <div className="py-16 text-center text-[#82958a]"><div className="text-4xl mb-3">▤</div><p className="font-medium">Your drafts will appear here</p><p className="text-sm">Fill assessment and press Generate all drafts.</p></div>}</div></div>
 <div className="bg-[#eef3ed] border border-[#d5e2d7] rounded-2xl p-4"><div className="font-semibold text-sm">Review before submission</div><div className="text-xs text-[#697e70] mt-1">Warnings are outside the document and are never included in Copy.</div>{warnings.length > 0 && <ul className="list-disc pl-5 mt-2 text-xs text-[#6e7b54]">{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>}<label className="flex items-start gap-2 mt-3 text-sm"><input type="checkbox" disabled={busy} checked={verified} onChange={e => setVerified(e.target.checked)} className="mt-1" /><span>I have checked the documentation and confirmed the completed actions.</span></label>{message && <p role="status" className="mt-2 text-xs text-[#256d58]">{message}</p>}</div>
 </aside></div><footer className="text-xs text-[#82958b] mt-8 pb-6">Documentation drafting aid only. Review each draft against assessment and facility policy. Do not enter identifiable resident information without workplace authorisation.</footer></main></div>;
};
