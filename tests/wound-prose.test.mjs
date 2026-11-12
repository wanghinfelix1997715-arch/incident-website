import {incidentProviderResult} from './helpers/incident-provider.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {draftIncident,incidentExample,validateIncidentAI,incidentSections} from '../lib/incident.ts';
import {handleGenerate} from '../lib/generate.ts';
const seed={...incidentExample('wound'),wound_0_loss:'Partial flap loss',wound_0_pain:'Denied',care:'Bleeding had stopped before assessment.',plan:'Dressing review in 2/7.',photo:'Completed',gp:'Notified — awaiting response',gpContact:'GP emailed at 14:25.',nokContact:'NOK emailed at 14:30.',management:'Not required',hospital:'Not required'};
const req=d=>new Request('https://afterfall.test/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pathway:'wound',incident:d})});
test('wound report uses balanced sentences rather than a form-label dump',()=>{
 const d=draftIncident('wound',seed);
 for(const k of ['details','actions','investigation','ecase'])assert.doesNotMatch(d[k],/Injury type:|Site and side:|Flap \/ skin loss:|Care actually provided:|Photograph status:|GP \/ clinician status:|Wound chart \/ care plan status:/);
 assert.match(d.details,/partial flap loss/i);assert.match(d.details,/denied pain/i);
 assert.match(d.actions,/A wound care plan was created\./);
 assert.match(d.actions,/A wound photograph was taken\./);
 assert.match(d.actions,/GP was notified.*response.*awaited/i);
 assert.match(d.actions,/Management notification and hospital transfer were documented as not required\./);
 for(const fact of ['2 x 2 cm','left lower leg','14:25','14:30','2/7'])assert.ok(d.ecase.includes(fact),fact);
 assert.equal(d.ecase,d.investigation);
});
test('pending, declined and later findings remain distinct; missing findings are not invented',()=>{
 const d=draftIncident('wound',{wound_0_site:'right hand',wound_0_pain:'Unable to assess',planStatus:'Pending',photo:'Declined',gp:'Pending',nok:'Pending',planned:'Review planned in 2/7.',later:'16:00 — bleeding noted again.'});
 assert.match(d.actions,/care plan.*pending/i);assert.match(d.actions,/photograph.*declined/i);
 assert.doesNotMatch(d.actions,/care plan was created|photograph was taken|GP was notified|NOK was informed/);
 assert.match(d.details,/unable to be assessed for pain/i);assert.doesNotMatch(Object.values(d).join(' '),/denied pain|no pain|normal observations|bleeding controlled/i);
 assert.match(d.investigation,/16:00 — bleeding noted again/);
});
test('wound API and fallback use the same prose while altered facts still fail validation',async()=>{
 const canonical=draftIncident('wound',seed);let instructions='';
 const send=async(url,opts)=>{instructions=JSON.parse(opts.body).instructions;return Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(incidentProviderResult(canonical,opts))}]}]});};
 const success=await(await handleGenerate(req(seed),{key:'synthetic'},true,send)).json();
 assert.equal(success.mode,'ai');assert.deepEqual(success.documents,canonical);assert.match(instructions,/narrative|prose/i);
 assert.equal(validateIncidentAI('wound',{...canonical,actions:canonical.actions.replace('response is awaited','review was completed')},canonical),false);
 const fallback=await(await handleGenerate(req(seed),{key:'synthetic'},true,async()=>{throw Error('synthetic');})).json();
 assert.equal(fallback.mode,'template');assert.deepEqual(fallback.documents,canonical);
});

test('every entered wound free-text field survives in the consolidated report',()=>{
 const data={woundCount:'2'};
 const fields=incidentSections('wound',data).flatMap(s=>s.fields).filter(f=>f[2]!=='select');
 for(const [id] of fields)data[id]='SYN_'+id.toUpperCase();
 const text=draftIncident('wound',data).ecase;
 for(const [id] of fields)assert.ok(text.includes(data[id]),id);
});
