import test from 'node:test';
import assert from 'node:assert/strict';
import {draftIncident,validateIncidentAI} from '../lib/incident.ts';
import {handleGenerate} from '../lib/generate.ts';
const seed={resident:'Resident E (synthetic)',date:'12/11',time:'15:15',place:'Dining area',witness:'Witnessed',account:'A walker bumped the left lower leg.',wound_0_type:'Skin tear',wound_0_site:'left lower leg',wound_0_size:'2 x 2 cm',wound_0_classification:'Synthetic category B',wound_0_loss:'Partial flap loss',wound_0_pain:'Denied',wound_0_appearance:'Minor bleeding.',care:'Gauze and pressure applied. The area was cleaned with saline.',dressing:'Non-adherent and protective dressing applied.',planStatus:'Created',plan:'Dressing review in 2/7.',photo:'Completed',gp:'Pending',nok:'Pending',hospital:'Not required',severity:'Minor',gpRequired:'No at present'};
test('NOK wound email is a short family update, not a copied incident report',()=>{
 const d=draftIncident('wound',seed);
 assert.doesNotMatch(d.nok,/contact is pending|notification is pending|not required|classification|category B|flap loss|gauze|saline|non-adherent|photograph|2 x 2/i);
 assert.match(d.nok,/walker bumped/);assert.match(d.nok,/left lower leg/);assert.match(d.nok,/No pain was reported/);assert.match(d.nok,/cleaned and dressed/);
 assert.ok(d.nok.split(/\s+/).length<110);
 assert.match(d.ecase,/Synthetic category B/);assert.match(d.ecase,/Gauze/);assert.match(d.ecase,/contact is pending/);assert.match(d.ecase,/not required/);
});
test('GP email omits internal contact statuses and does not invent a review request',()=>{
 const d=draftIncident('wound',seed);
 assert.doesNotMatch(d.gp,/contact is pending|notification is pending|not required|Please review|Please advise/i);
 assert.match(d.gp,/2 x 2 cm/);assert.match(d.gp,/Synthetic category B/);assert.match(d.gp,/denied pain/i);
 const wanted=draftIncident('wound',{...seed,gpRequired:'Yes',reviewReason:'Please advise on the recorded wound concern.'});
 assert.match(wanted.gp,/Please advise on the recorded wound concern/);
});
test('family summary never converts planned care, pending plan or missing pain into completed care',()=>{
 const d=draftIncident('wound',{wound_0_site:'right arm',care:'Cleansing is planned, not yet performed.',dressing:'Dressing pending.',planStatus:'Pending',gp:'Pending',nok:'Pending',hospital:'Not required'});
 assert.doesNotMatch(d.nok,/was cleaned|was applied|cleaned and dressed|No pain|plan is in place|contact is pending|not required/i);
});
test('material hospital escalation and supplied next steps remain visible to family',()=>{
 const d=draftIncident('wound',{...seed,hospital:'Transferred',escalation:'Transferred at 16:30 after deterioration.',later:'16:00 — new pain reported.',followup:'Await hospital update.'});
 assert.match(d.nok,/16:30/);assert.match(d.nok,/16:00/);assert.match(d.nok,/Await hospital update/);
});
test('actual API and fallback retain recipient-specific emails and strict validation',async()=>{
 const canonical=draftIncident('wound',seed);
 const req=()=>new Request('https://afterfall.test/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pathway:'wound',incident:seed})});
 const send=async()=>Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(canonical)}]}]});
 const a=await(await handleGenerate(req(),{key:'synthetic'},true,send)).json();assert.equal(a.mode,'ai');assert.deepEqual(a.documents,canonical);
 const b=await(await handleGenerate(req(),{},true)).json();assert.equal(b.mode,'template');assert.deepEqual(b.documents,canonical);
 assert.equal(validateIncidentAI('wound',{...canonical,nok:canonical.nok+' GP reviewed.'},canonical),false);
});

test('clinical recipient retains treatment that cannot safely be reduced to cleaned and dressed',()=>{
 const d=draftIncident('wound',{...seed,care:'Clinician applied sutures at 16:00.',dressing:'Protective cover applied.'});
 assert.match(d.gp,/Clinician applied sutures at 16:00/);
 assert.match(d.gp,/Protective cover applied/);
});
