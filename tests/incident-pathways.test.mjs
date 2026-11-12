import { test } from 'node:test';
import assert from 'node:assert/strict';
import { draftIncident, incidentSections, initialIncident, incidentExample, incidentWarnings, validIncident, validateIncidentAI } from '../lib/incident.ts';
import { draft, mergeDrafts } from '../lib/drafts.ts';
import { example } from '../lib/assessment.ts';
import { handleGenerate } from '../lib/generate.ts';
const all=d=>Object.values(d).join('\n');
const req=(pathway,incident)=>new Request('https://afterfall.test/api/generate',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://afterfall.test'},body:JSON.stringify({pathway,incident})});
test('fall dispatcher preserves every approved output unchanged',()=>assert.deepEqual(draftIncident('fall',example),draft(example)));
test('wound seed retains assessed facts and completed actions without invented findings',()=>{
 const d=draftIncident('wound',incidentExample('wound'));
 for(const fact of ['left lower leg','2 x 2 cm','fragile','non-adherent','created','emailed'])assert.ok(all(d).includes(fact),fact);
 assert.doesNotMatch(all(d),/denied pain|bleeding controlled|GP informed|cleansed|GP reviewed/i);
 assert.doesNotMatch(d.ecase,/TIME OF INCIDENT:|SUMMARY:|DETAILS:/);
 for(const k of ['summary','details','actions'])assert.ok(d.ecase.includes(d[k]));
});
test('separate wounds retain their own side dimensions and classification',()=>{
 const d=draftIncident('wound',{woundCount:'2',wound_0_site:'left forearm',wound_0_size:'2 x 1 cm',wound_0_classification:'ISTAP type 1',wound_1_site:'right shin',wound_1_size:'3 x 2 cm',wound_1_classification:'ISTAP type 2'});
 assert.match(d.nok,/Injury 1:.*left forearm.*\. Injury 2:.*right shin/);
 assert.match(d.details,/Wound 1[\s\S]*left forearm[\s\S]*2 x 1 cm[\s\S]*ISTAP type 1[\s\S]*Wound 2[\s\S]*right shin[\s\S]*3 x 2 cm[\s\S]*ISTAP type 2/);
});
test('blank pathways do not inherit falls completed defaults or invent normality',()=>{
 for(const p of ['wound','infection']){
  assert.equal(incidentSections(p,initialIncident(p)).length,6);
  const d=draftIncident(p,initialIncident(p));
  assert.doesNotMatch(all(d),/informed|reviewed|normal|denied|commenced|completed|Minor|Moderate|Major|Extreme/);
  assert.ok(incidentWarnings(p,{}).length>0);
 }
});
test('infection pending results and notified GP never become confirmed infection or review',()=>{
 const d=draftIncident('infection',{infectionStatus:'Suspected',infectionType:'Urinary',symptoms:'Dysuria reported at 10:00.',specimenStatus:'Result pending',specimen:'MSU collected at 10:20.',gp:'Notified — awaiting response',later:'12:00 — temperature 38.1°C.',followup:'Await GP advice.'});
 assert.match(d.summary,/Suspected/);assert.match(d.actions,/Result pending/);assert.match(d.actions,/awaiting response/);
 assert.doesNotMatch(all(d),/infection confirmed|GP reviewed|antibiotics commenced/i);
 assert.ok(d.ecase.indexOf('10:00')<d.ecase.indexOf('12:00'));
 assert.match(d.gp,/Dysuria/);assert.match(d.nok,/12:00/);
});
test('known negative symptoms and baseline distinction survive, absent signs stay absent',()=>{
 const d=draftIncident('infection',{symptoms:'No cough reported. New dysuria.',baseline:'Longstanding confusion unchanged.',observations:'11:00 — BP 118/70, temperature 37.3°C.'});
 for(const k of ['details','investigation','ecase','gp']){
  assert.match(d[k],/No cough reported/);assert.match(d[k],/Longstanding confusion unchanged/);assert.match(d[k],/118\/70/);
 }
 assert.doesNotMatch(all(d),/new confusion|SpO₂|sepsis/i);
});
test('severity is only the user selection, and contradictory classification triggers review',()=>{
 const a={woundCount:'1',wound_0_classification:'ISTAP type 1',wound_0_loss:'Total flap loss',wound_0_size:'20 x 10 cm'};
 assert.doesNotMatch(all(draftIncident('wound',a)),/Extreme|Major/);
 assert.ok(incidentWarnings('wound',a).some(w=>/classification/i.test(w)));
 assert.match(draftIncident('wound',{...a,severity:'Minor',severityReason:'User assessed.'}).details,/Minor/);
});
test('pathway validators reject foreign fields, wrong values and hidden wound entries',()=>{
 assert.equal(validIncident('wound',{gp:'Completed'}),false);
 assert.equal(validIncident('wound',{head:'Confirmed / witnessed'}),false);
 assert.equal(validIncident('infection',{infectionStatus:'Definitely normal'}),false);
 assert.equal(validIncident('wound',{woundCount:'1',wound_1_site:'hidden'}),false);
 assert.equal(validIncident('wound',{woundCount:'21'}),false);
 assert.equal(validIncident('infection',{symptoms:42}),false);
 assert.equal(validIncident('infection',incidentExample('infection')),true);
});
test('new pathway API constructs correct canonical documents and rejects altered facts',async()=>{
 const input=incidentExample('infection'), canonical=draftIncident('infection',input);
 let sent;
 const send=async(url,opts)=>{sent=JSON.parse(opts.body);return Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(canonical)}]}]});};
 const body=await(await handleGenerate(req('infection',input),{key:'synthetic'},true,send)).json();
 assert.equal(body.mode,'ai');assert.deepEqual(body.documents,canonical);assert.equal(sent.store,false);
 assert.equal(validateIncidentAI('infection',{...canonical,gp:canonical.gp+' Infection confirmed.'},canonical),false);
 assert.equal((await handleGenerate(req('unknown',{}),{},true)).status,400);
 assert.equal((await handleGenerate(req('wound',{head:'Unknown'}),{},true)).status,400);
});
test('new pathways retain manual edits on regeneration and use fallback safely',async()=>{
 for(const p of ['wound','infection']){
  const a=draftIncident(p,incidentExample(p));
  assert.equal(mergeDrafts({...a,ecase:'Manual note'},draftIncident(p,{}),new Set(['ecase'])).ecase,'Manual note');
  const body=await(await handleGenerate(req(p,incidentExample(p)),{key:'synthetic'},true,async()=>{throw Error('timeout');})).json();
  assert.equal(body.mode,'template');assert.deepEqual(body.documents,a);
 }
});
