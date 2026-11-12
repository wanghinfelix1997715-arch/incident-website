import test from 'node:test';
import assert from 'node:assert/strict';
import {handleGenerate} from '../lib/generate.ts';
import {draftIncident,incidentExample} from '../lib/incident.ts';
import {example,empty} from '../lib/assessment.ts';
import {reviewedIncidentDocuments} from '../lib/incident-rewrite.ts';
import {mergeDrafts} from '../lib/drafts.ts';
import {clinicalLanguageWarnings} from '../lib/note-language.ts';
import {readFile} from 'node:fs/promises';
const req=(p,d)=>new Request('https://afterfall.test/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pathway:p,incident:d})});
const output=x=>Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(x)}]}]});
function writer(documents,canonical){return {documents,warnings:[],references:Object.keys(documents).filter(field=>documents[field].trim()).map(field=>({field,source:canonical[field].slice(0,2000),draft:documents[field].slice(0,2000)}))};}
test('all incident pathways permit real spelling/site-shorthand correction and run independent review',async()=>{
 for(const p of ['fall','wound','infection']){
  const data=p==='fall'?{...example,found:'Resident S was found supne. Pain in lt shin.'}:p==='wound'?{...incidentExample(p),wound_0_site:'lt shin',care:'Temporpray dressing applied.'}:{...incidentExample(p),symptoms:'Modate pain in lt shin.'};
  const canonical=draftIncident(p,data);
  const documents=Object.fromEntries(Object.entries(canonical).map(([k,v])=>[k,v.replaceAll('supne','supine').replaceAll('lt shin','left shin').replaceAll('Temporpray','Temporary').replaceAll('Modate','Moderate')]));
  const prompts=[];
  const send=async(url,opts)=>{const b=JSON.parse(opts.body);prompts.push(b);return output(prompts.length===1?writer(documents,canonical):{approved:true,issues:[],warnings:[]});};
  const r=await(await handleGenerate(req(p,data),{key:'synthetic'},true,send)).json();
  assert.equal(r.mode,'ai',p);assert.deepEqual(r.documents,documents);assert.equal(r.reviewed,true);assert.equal(prompts.length,2);
  for(const b of prompts){assert.match(b.instructions,/2016-9005/);assert.match(b.instructions,/lt.*left/i);assert.match(b.instructions,/spelling/i);assert.equal(b.store,false);}
  assert.ok(JSON.parse(prompts[1].input).incident);assert.match(prompts[1].instructions,/independent|independently/i);
 }
});
test('new or reassigned values, changed status/site, omissions and chronology fail before display',async()=>{
 const data={...example,found:'Pain in left shin.',reassessment:'18:00 — pain increased.',gp:'Pending'},canonical=draftIncident('fall',data);
 for(const [name,change,approved] of [
  ['value',d=>({...d,gp:d.gp+' BP 999/999.'}),true],
  ['status',d=>({...d,actions:d.actions.replace('GP notification pending','GP informed')}),false],
  ['side',d=>({...d,details:d.details.replace('left shin','right shin')}),false],
  ['omission',d=>({...d,gp:'Dear Doctor, please review.'}),false],
  ['chronology',d=>({...d,gp:d.gp.split('\n\n').reverse().join('\n\n')}),false]
 ]){
  let calls=0;const documents=change(canonical);
  const send=async()=>output(++calls===1?writer(documents,canonical):{approved,issues:approved?[]:['Synthetic source mismatch'],warnings:[]});
  const body=await(await handleGenerate(req('fall',data),{key:'synthetic'},true,send)).json();
  assert.equal(body.rewriteFailed,true,name);assert.notEqual(body.mode,'ai',name);
 }
});
test('time, account and wound-description conflicts produce external alerts without changing facts',async()=>{
 const data={...example,time:'23:25',found:'Resident S was found supne at 1120 hours.',account:'Resident stated she lost balance.',certainty:'Unknown',injurydetail:'New abrasion with fat exposed. Pre-existing skin tear to left shin.'};
 const canonical=draftIncident('fall',data);let calls=0;
 const send=async()=>output(++calls===1?writer(canonical,canonical):{approved:true,issues:[],warnings:['Keep the reported account separate from the unwitnessed mechanism.']});
 const body=await(await handleGenerate(req('fall',data),{key:'synthetic'},true,send)).json();
 assert.equal(body.mode,'ai');assert.ok(body.warnings.some(w=>/time/i.test(w)));assert.ok(body.warnings.some(w=>/abrasion|terminology/i.test(w)));assert.ok(body.warnings.some(w=>/existing/i.test(w)));
 assert.match(body.documents.details,/23:25/);assert.match(body.documents.details,/1120/);assert.doesNotMatch(body.documents.details,/Confirm the|Clarify the/);
});
test('failed/malformed second review and missing source references cannot return a reviewed rewrite',async()=>{
 const canonical=draftIncident('wound',incidentExample('wound'));
 for(const review of [{approved:false,issues:['Changed status'],warnings:[]},{approved:true,issues:[]},null]){
  let calls=0;const send=async()=>output(++calls===1?writer(canonical,canonical):review);
  const b=await(await handleGenerate(req('wound',incidentExample('wound')),{key:'synthetic'},true,send)).json();assert.equal(b.rewriteFailed,true);assert.notEqual(b.mode,'ai');
 }
 let calls=0;const b=await(await handleGenerate(req('wound',incidentExample('wound')),{key:'synthetic'},true,async()=>{calls++;return output({documents:canonical,warnings:[],references:[]});})).json();
 assert.equal(b.rewriteFailed,true);assert.equal(calls,1);
});

test('falls A1–A8 directions and incomplete drafts pass through the full new writer/review boundary',async()=>{
 const cases=[
 {...empty,suspected:'Possible stairs; exact mechanism unknown.'},
 {...empty,pain:'Denied',reassessment:'11:20 — new right hip pain.'},
 {...empty,strength:'Pre-existing weakness unchanged'},
 {...empty,head:'Confirmed / witnessed',anticoag:'Yes',hospital:'Pending'},
 {...empty,pain:'Denied',injury:'Yes',injurydetail:'Left forearm skin tear.'},
 {...empty,gp:'Pending',nok:'Not completed',frat:'Pending'},
 {},
 {...empty,time:'12:30',place:'Synthetic lounge'}
 ];
 for(const data of cases){
  const canonical=draftIncident('fall',data);let calls=0;
  const send=async()=>output(++calls===1?writer(canonical,canonical):{approved:true,issues:[],warnings:[]});
  const b=await(await handleGenerate(req('fall',data),{key:'synthetic'},true,send)).json();
  assert.equal(b.reviewed,true);assert.deepEqual(b.documents,canonical);assert.equal(calls,2);
 }
});
test('client accepts reviewed prose, rejects unreviewed/failed results and retains manual edits',async()=>{
 const canonical=draftIncident('fall',{...example,found:'Found supne.'});
 const prose={...canonical,details:canonical.details.replace('supne','supine')};
 assert.equal(reviewedIncidentDocuments('fall',{mode:'ai',reviewed:true,documents:prose},canonical),prose);
 for(const result of [{mode:'ai',documents:prose},{mode:'ai',reviewed:true,rewriteFailed:true,documents:prose},{mode:'template',documents:canonical}])assert.equal(reviewedIncidentDocuments('fall',result,canonical),null);
 assert.equal(mergeDrafts({...canonical,gp:'Manually edited'},prose,new Set(['gp'])).gp,'Manually edited');
 const ui=await readFile(new URL('../components/AfterFall.tsx',import.meta.url),'utf8');
 assert.ok(ui.indexOf('if(failed)')<ui.indexOf('setDocs(current => mergeDrafts'));
 assert.match(ui,/revision.current !== snapshot/);assert.match(ui,/setApiWarnings\(nextWarnings\)/);
});

test('explicit incident time is compared with both compact and colon discovery times',()=>{
 for(const found of ['Found at 1120 hours.','Found at 11:20.'])assert.ok(clinicalLanguageWarnings({source:'Time: 23:25\n'+found,context:''}).some(w=>/times/.test(w)));
 assert.equal(clinicalLanguageWarnings({source:'Time: 23:25\nFound at 23:25.',context:''}).length,0);
});
