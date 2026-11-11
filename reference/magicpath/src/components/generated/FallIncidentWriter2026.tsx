import React, { useMemo, useState } from 'react';
type Data = Record<string, string>;
const sections = [{
  title: 'Incident details',
  sub: 'Where, when and what happened',
  fields: [['resident', 'Resident name', 'text'], ['date', 'Incident date', 'date'], ['time', 'Time of incident', 'time'], ['place', 'Location', 'text'], ['witness', 'Witnessed?', 'select', 'Not recorded|Witnessed|Unwitnessed|Unknown'], ['position', 'Position found', 'select', 'Not recorded|Supine|Prone|Side lying|Sitting|Other'], ['mechanism', 'Possible mechanism', 'select', 'Not recorded|Walking / tripping|Transfer|Stairs / height|Found on floor — unknown|Other'], ['account', 'Incident narrative / resident account', 'textarea'], ['suspected', 'Suspected contributing circumstances (if any)', 'textarea']]
}, {
  title: 'Clinical assessment',
  sub: 'Findings and initial observations',
  fields: [['head', 'Head strike', 'select', 'Not recorded|Denied by resident|Confirmed / witnessed|Suspected|Unknown'], ['loc', 'Loss of consciousness', 'select', 'Not recorded|No reported LOC|Yes|Unknown'], ['injury', 'Injury identified', 'select', 'Not assessed|No injury identified|Yes|Uncertain'], ['injurydetail', 'Injury description', 'textarea'], ['pain', 'Pain', 'select', 'Not assessed|Denied|Reported|Unable to assess'], ['paindetail', 'Pain site / score / management', 'textarea'], ['gcs', 'GCS (only if assessed)', 'text'], ['neuro', 'Neurological findings', 'textarea'], ['bp', 'BP', 'text'], ['hr', 'HR', 'text'], ['rr', 'RR', 'text'], ['spo2', 'SpO₂', 'text'], ['temp', 'Temperature', 'text'], ['bgl', 'BGL (if checked)', 'text']]
}, {
  title: 'Mobility & risk',
  sub: 'Baseline compared with post-fall',
  fields: [['rom', 'ROM', 'select', 'Not assessed|At baseline|New restriction|Unknown'], ['strength', 'Limb strength', 'select', 'Not assessed|At baseline|Pre-existing weakness unchanged|New weakness|Unknown'], ['limbdetail', 'Limb / ROM detail', 'textarea'], ['walking', 'Post-fall mobility', 'select', 'Not assessed|Mobilised at baseline|Reduced mobility|Unable to weight bear|Not mobilised'], ['walkingdetail', 'Mobility details / aid', 'textarea'], ['anticoag', 'Anticoagulants', 'select', 'Not confirmed|No|Yes'], ['antiplatelet', 'Antiplatelets', 'select', 'Not confirmed|No|Yes'], ['cause', 'Possible cause / risk factors', 'textarea']]
}, {
  title: 'Immediate actions',
  sub: 'What was actually done',
  fields: [['actions', 'Immediate assistance / positioning', 'textarea'], ['transfer', 'Transfer / hoist details', 'textarea'], ['treatment', 'Treatment / first aid', 'textarea'], ['neuroobs', 'Neurological observations', 'select', 'Not recorded|Commenced|Not commenced|Pending'], ['visual', 'Additional monitoring', 'textarea'], ['investigations', 'Investigations / samples collected', 'textarea']]
}, {
  title: 'Notifications',
  sub: 'Communication and escalation',
  fields: [['gp', 'GP informed', 'select', 'Completed|Not completed|Pending|Not indicated'], ['nok', 'NOK informed', 'select', 'Completed|Not completed|Pending|Not indicated'], ['hospital', 'Hospital transfer', 'select', 'No|Yes|Pending'], ['notificationdetail', 'GP / NOK advice and notification details', 'textarea'], ['transferdetail', 'Transfer / escalation details', 'textarea']]
}, {
  title: 'Investigation & follow-up',
  sub: 'Factors, prevention and review',
  fields: [['frat', 'FRAT reviewed and updated', 'select', 'Completed|Not completed|Pending|Not indicated'], ['prevention', 'Prevention / environmental measures', 'textarea'], ['followup', 'Investigation and follow-up narrative', 'textarea'], ['reassessment', 'Later reassessment (time and findings)', 'textarea']]
}] as const;
const empty: Data = {
  gp: 'Completed',
  nok: 'Completed',
  frat: 'Completed'
};
const example: Data = {
  ...empty,
  resident: 'Resident A (synthetic)',
  date: '2026-10-20',
  time: '16:45',
  place: 'Level 2 — bottom of staircase',
  witness: 'Unwitnessed',
  position: 'Supine',
  mechanism: 'Stairs / height',
  account: 'Resident called for assistance and was found below a short staircase with an overturned 4WW. Resident reported visiting another resident before using the lift to an unfamiliar level. Denied head strike and stated that they landed on their bottom.',
  suspected: 'Possible attempted stair descent with 4WW; exact mechanism unknown.',
  head: 'Denied by resident',
  injury: 'Uncertain',
  pain: 'Denied',
  bp: '108/68',
  hr: '79',
  rr: '20',
  spo2: '94%',
  temp: '36.2',
  rom: 'At baseline',
  strength: 'Pre-existing weakness unchanged',
  limbdetail: 'Mild pre-existing right lower limb weakness.',
  walking: 'Mobilised at baseline',
  walkingdetail: 'Able to stand and mobilise with 4WW without discomfort.',
  anticoag: 'No',
  actions: 'Repositioned for comfort on floor while awaiting hoist.',
  transfer: 'Hoisted into wheelchair and transferred to dining room.',
  neuroobs: 'Commenced',
  visual: '30-minute visual checks for five days commenced.',
  investigations: 'MSU collected to investigate possible UTI.',
  cause: 'Unfamiliar environment; possible stair use with 4WW.',
  followup: 'Review environmental access and falls risk prevention.'
};
const txt = (v?: string) => v && v.trim() && !['Not recorded', 'Not assessed', 'Not confirmed', 'Unknown', 'Uncertain'].includes(v) ? v.trim() : '';
function draft(d: Data) {
  const name = txt(d.resident) || 'Resident';
  const where = txt(d.place) || 'location not specified';
  const when = txt(d.time) || 'time not specified';
  const observed = [d.witness && d.witness !== 'Not recorded' ? d.witness.toLowerCase() + ' fall' : 'Fall', 'at ' + where + ' at ' + when].join(' ');
  const details = [observed + '.', txt(d.position) ? 'Found ' + d.position?.toLowerCase() + '.' : '', txt(d.account), txt(d.suspected) ? 'Possible contributing circumstances: ' + d.suspected : ''].filter(Boolean).join(' ');
  const head = txt(d.head) ? d.head === 'Denied by resident' ? 'Resident denied head strike.' : d.head === 'Confirmed / witnessed' ? 'Head strike confirmed.' : 'Head strike: ' + d.head + '.' : '';
  const pain = txt(d.pain) ? d.pain === 'Denied' ? 'Resident denied pain or discomfort.' : d.pain === 'Reported' ? 'Pain reported.' : 'Pain assessment: ' + d.pain + '.' : '';
  const injury = d.injury === 'No injury identified' ? 'No injury identified on assessment.' : d.injury === 'Yes' ? 'Injury identified.' : '';
  const obs = [['BP', d.bp], ['HR', d.hr], ['RR', d.rr], ['SpO₂', d.spo2], ['T', d.temp], ['BGL', d.bgl]].filter(([, v]) => txt(v)).map(([k, v]) => k + ' ' + v).join(', ');
  const assess = [head, injury, txt(d.injurydetail), pain, txt(d.paindetail), txt(d.gcs) ? 'GCS ' + d.gcs + '.' : '', txt(d.neuro), d.rom === 'At baseline' ? 'ROM remained at baseline.' : d.rom === 'New restriction' ? 'New ROM restriction documented.' : '', d.strength === 'Pre-existing weakness unchanged' ? 'Pre-existing weakness unchanged.' : d.strength === 'At baseline' ? 'Limb strength at baseline.' : d.strength === 'New weakness' ? 'New limb weakness reported.' : '', txt(d.limbdetail), txt(d.walkingdetail), obs ? 'Initial observations: ' + obs + '.' : ''].filter(Boolean).join(' ');
  const actions = [txt(d.actions), txt(d.transfer), txt(d.treatment), d.neuroobs === 'Commenced' ? 'Neurological observations commenced.' : '', txt(d.visual), txt(d.investigations), txt(d.transferdetail)].filter(Boolean).join(' ');
  const complete = [d.gp === 'Completed' ? 'GP informed.' : '', d.nok === 'Completed' ? 'NOK informed.' : '', d.frat === 'Completed' ? 'FRAT reviewed and updated.' : ''].filter(Boolean).join(' ');
  const investigation = ['Incident circumstances reviewed.', txt(d.cause) ? 'Possible contributing factors: ' + d.cause : '', txt(d.followup), complete, txt(d.reassessment) ? 'Subsequent reassessment: ' + d.reassessment : ''].filter(Boolean).join(' ');
  const summary = (d.witness === 'Unwitnessed' ? 'Unwitnessed fall' : 'Fall') + ' — ' + where + ', ' + when + '.';
  const ecase = ['TIME OF INCIDENT:\n' + when, 'PLACE OF INCIDENT:\n' + where, 'SITUATION:\n' + details, 'BACKGROUND:\n' + [txt(d.anticoag) ? 'Anticoagulants: ' + d.anticoag + '.' : '', txt(d.antiplatelet) ? 'Antiplatelets: ' + d.antiplatelet + '.' : '', txt(d.limbdetail)].filter(Boolean).join(' '), 'ASSESSMENT:\n' + assess, 'RECOMMENDATIONS / RESULT:\n' + [actions, complete, txt(d.followup), txt(d.notificationdetail), txt(d.reassessment) ? 'Reassessment: ' + d.reassessment : ''].filter(Boolean).join(' ')].join('\n\n');
  const gp = ['Dear Doctor,', name + ' sustained an ' + (d.witness === 'Unwitnessed' ? 'unwitnessed ' : '') + 'fall ' + ('at ' + where) + ' at ' + when + '. ' + [head, pain, injury, txt(d.walkingdetail)].filter(Boolean).join(' '), [obs ? 'Initial obs: ' + obs + '.' : '', d.anticoag === 'No' ? 'Not on anticoagulants.' : '', d.neuroobs === 'Commenced' ? 'Neuro obs commenced.' : '', txt(d.visual), txt(d.investigations)].filter(Boolean).join(' '), 'Please review and advise if further management is required.', 'Kind regards,\nRN'].filter(Boolean).join('\n\n');
  const nok = ['Dear Family,', 'I am writing to inform you that ' + name + ' sustained a fall at ' + where + ' at approximately ' + when + '.', [head, pain, txt(d.walkingdetail)].filter(Boolean).join(' '), [d.neuroobs === 'Commenced' ? 'Neurological observations commenced.' : '', txt(d.visual), 'We will continue to monitor and notify you of any concerns or changes.'].filter(Boolean).join(' '), 'Kind regards,\nRegistered Nurse'].join('\n\n');
  return {
    summary,
    details,
    actions: [assess, actions, complete].filter(Boolean).join('\n\n'),
    investigation,
    ecase,
    gp,
    nok
  };
}
const keys = ['summary', 'details', 'actions', 'investigation', 'ecase', 'gp', 'nok'] as const;
const label: Record<string, string> = {
  summary: 'Summary',
  details: 'Incident Details',
  actions: 'Immediate Action Taken',
  investigation: 'Investigation / Follow-up',
  ecase: 'eCase Progress Note',
  gp: 'GP Email',
  nok: 'NOK Email'
};
export const FallIncidentWriter2026 = () => {
  const [data, setData] = useState<Data>(empty);
  const [active, setActive] = useState(0);
  const [tab, setTab] = useState<'riskman' | 'ecase' | 'gp' | 'nok'>('riskman');
  const [docs, setDocs] = useState<Record<string, string>>({});
  const [generated, setGenerated] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState('');
  const update = (k: string, v: string) => {
    setData(p => ({
      ...p,
      [k]: v
    }));
    setDirty(generated);
    setVerified(false);
  };
  const warnings = useMemo(() => [!data.time ? 'Incident time not recorded' : '', !data.place ? 'Location not recorded' : '', !data.gcs ? 'GCS not entered' : '', !data.injury || data.injury === 'Uncertain' || data.injury === 'Not assessed' ? 'Injury assessment not confirmed' : '', data.gp === 'Completed' || data.nok === 'Completed' || data.frat === 'Completed' ? 'Confirm GP/NOK/FRAT actions before copy' : ''].filter(Boolean), [data]);
  const make = () => {
    setDocs(draft(data));
    setGenerated(true);
    setDirty(false);
    setMessage('Four drafts generated locally. Review before submission.');
  };
  const copy = async (s: string) => {
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
  const selected = tab === 'riskman' ? ['summary', 'details', 'actions', 'investigation'] : [tab];
  return <div className="min-h-screen bg-[#f6f8f6] text-[#19352d] font-sans">
 <header className="bg-[#143e35] text-white px-5 md:px-10 py-5 flex items-center justify-between gap-3"><div><div className="text-2xl font-semibold tracking-tight">✳ AfterFall<span className="text-[#9bc8ac]">.</span></div><div className="text-xs text-[#c7dcd1] mt-1">RN DOCUMENTATION STUDIO · V1 WEB</div></div><span className="text-xs border border-[#7ca996] rounded-full px-3 py-1">Local drafts · No API connected</span></header>
 <main className="max-w-7xl mx-auto px-4 md:px-8 py-7"><div className="flex flex-wrap justify-between items-center gap-4 mb-7"><div><h1 className="text-2xl md:text-3xl font-semibold">Post-fall documentation</h1><p className="text-sm text-[#668076] mt-1">One assessment. Four ready-to-review documents.</p></div><div className="flex gap-2"><button onClick={() => {
            setData(example);
            setGenerated(false);
            setVerified(false);
            setMessage('Synthetic case loaded.');
          }} className="border rounded-xl bg-white px-4 py-2 text-sm font-medium hover:bg-[#e8f0ea]">Load synthetic example</button><button onClick={() => {
            setData(empty);
            setDocs({});
            setGenerated(false);
            setDirty(false);
            setVerified(false);
          }} className="border rounded-xl bg-white px-4 py-2 text-sm">Clear</button></div></div>
 <div className="grid lg:grid-cols-[1.06fr_.94fr] gap-6 items-start">
 <section className="bg-white border border-[#dee7df] rounded-2xl shadow-sm overflow-hidden"><div className="p-5 border-b"><div className="text-xs uppercase tracking-widest text-[#70887b]">Step 01</div><h2 className="text-xl font-semibold">Incident assessment</h2><p className="text-sm text-[#779083]">Select what you assessed; add context where needed.</p></div>
 <nav className="grid grid-cols-3 sm:grid-cols-6 border-b bg-[#f8faf8]">{sections.map((s, i) => <button key={i} onClick={() => setActive(i)} title={s.title} className={'px-2 py-3 text-xs border-b-2 ' + (i === active ? 'border-[#2d8067] bg-white font-semibold' : 'border-transparent text-[#658075]')}>{String(i + 1).padStart(2, '0')}<span className="block truncate mt-1">{s.title.split(' ')[0]}</span></button>)}</nav>
 <div className="p-5 md:p-6"><h3 className="text-lg font-semibold">{sections[active].title}</h3><p className="text-sm text-[#71877b] mb-5">{sections[active].sub}</p><div className="grid sm:grid-cols-2 gap-4">{fields.map(f => {
                const [id, title, kind, options] = f;
                const wide = kind === 'textarea';
                return <label key={id} className={'flex flex-col gap-1.5 text-sm font-medium ' + (wide ? 'sm:col-span-2' : '')}><span>{title}</span>{kind === 'select' ? <select value={data[id] || ''} onChange={e => update(id, e.target.value)} className="w-full bg-[#fafcfb] border border-[#cfdbd3] rounded-lg px-3 py-2.5 focus:outline-[#438f77]">{(options || '').split('|').map(o => <option key={o}>{o}</option>)}</select> : kind === 'textarea' ? <textarea rows={3} value={data[id] || ''} onChange={e => update(id, e.target.value)} placeholder="Add relevant details…" className="w-full resize-y bg-[#fafcfb] border border-[#cfdbd3] rounded-lg px-3 py-2.5 focus:outline-[#438f77]" /> : <input type={kind} value={data[id] || ''} onChange={e => update(id, e.target.value)} placeholder="Not entered" className="w-full bg-[#fafcfb] border border-[#cfdbd3] rounded-lg px-3 py-2.5 focus:outline-[#438f77]" />}</label>;
              })}</div>
 <div className="flex justify-between gap-3 mt-7 pt-5 border-t"><button disabled={active === 0} onClick={() => setActive(a => a - 1)} className="px-4 py-2 border rounded-lg disabled:opacity-30">← Back</button><button onClick={() => setActive(a => Math.min(a + 1, 5))} className="px-4 py-2 border rounded-lg">{active === 5 ? 'Last section' : 'Next section →'}</button></div></div></section>
 <aside className="space-y-4 lg:sticky lg:top-4"><div className="bg-white border border-[#dee7df] rounded-2xl p-5 shadow-sm"><div className="text-xs uppercase tracking-widest text-[#70887b]">Step 02</div><div className="flex items-center justify-between mt-1"><h2 className="text-xl font-semibold">Generate documents</h2><span className="text-xs text-[#7c8f83]">4 outputs</span></div><button onClick={make} className="mt-4 w-full bg-[#216b56] text-white font-medium rounded-xl py-3 hover:bg-[#185540]">✦ Generate all drafts</button><p className="mt-2 text-xs text-[#81958b]">Uses local templates until an authorised server-side AI connection is configured.</p>{dirty && <p className="mt-3 text-sm text-amber-700">Assessment changed since generation. Existing edited drafts are preserved.</p>}</div>
 <div className="bg-white border border-[#dee7df] rounded-2xl shadow-sm overflow-hidden"><div className="p-5 border-b"><div className="text-xs uppercase tracking-widest text-[#70887b]">Step 03</div><h2 className="text-xl font-semibold">Review & copy</h2></div><div className="grid grid-cols-4 bg-[#f7faf8] border-b">{(['riskman', 'ecase', 'gp', 'nok'] as const).map(t => <button key={t} onClick={() => setTab(t)} className={'text-xs sm:text-sm py-3 border-b-2 ' + (tab === t ? 'border-[#2d8067] font-semibold bg-white' : 'border-transparent')}>{t === 'riskman' ? 'RiskMan' : t === 'ecase' ? 'eCase' : t === 'gp' ? 'GP email' : 'NOK email'}</button>)}</div>
 <div className="p-4 space-y-4">{generated ? selected.map(k => <div key={k}><div className="flex justify-between items-center mb-2"><span className="font-semibold text-sm">{label[k]}</span><button onClick={() => copy(docs[k] || '')} className="text-xs font-semibold text-[#256e56] border px-3 py-1.5 rounded-lg hover:bg-[#f1f7f2]">Copy</button></div><textarea rows={k === 'ecase' ? 18 : k === 'actions' || k === 'details' ? 8 : 5} value={docs[k] || ''} onChange={e => setDocs(p => ({
                  ...p,
                  [k]: e.target.value
                }))} className="w-full text-sm leading-relaxed border border-[#d6e3db] rounded-xl p-3 bg-white resize-y focus:outline-[#438f77]" /></div>) : <div className="py-16 text-center text-[#82958a]"><div className="text-4xl mb-3">▤</div><p className="font-medium">Your drafts will appear here</p><p className="text-sm">Fill assessment and press Generate all drafts.</p></div>}</div></div>
 <div className="bg-[#eef3ed] border border-[#d5e2d7] rounded-2xl p-4"><div className="font-semibold text-sm">Review before submission</div><div className="text-xs text-[#697e70] mt-1">Warnings are outside the document and are never included in Copy.</div>{warnings.length > 0 && <ul className="list-disc pl-5 mt-2 text-xs text-[#6e7b54]">{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>}<label className="flex items-start gap-2 mt-3 text-sm"><input type="checkbox" checked={verified} onChange={e => setVerified(e.target.checked)} className="mt-1" /><span>I have checked the documentation and confirmed the completed actions.</span></label>{message && <p role="status" className="mt-2 text-xs text-[#256d58]">{message}</p>}</div>
 </aside></div><footer className="text-xs text-[#82958b] mt-8 pb-6">Documentation drafting aid only. Review each draft against assessment and facility policy. Do not enter identifiable resident information without workplace authorisation.</footer></main></div>;
};
