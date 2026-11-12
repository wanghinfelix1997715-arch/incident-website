import test from 'node:test';
import assert from 'node:assert/strict';
import {noteLanguageRules,noteLanguageWarnings} from '../lib/note-language.ts';
import {handleNote,validateNoteDraft} from '../lib/note-generator.ts';
const input=(source,target='ecase')=>({source,context:'',target,sourceType:'Rough notes',communicationStatus:'Unknown'});
const draft=(source,text=source)=>({text,warnings:[],references:[{source,draft:text}]});
test('confirmed workflow supersedes tx-transfer and blanket alphabetic expansion',()=>{
 for(const term of ['tx = treatment','t/f = transfer','CNS = central nervous system','OT = occupational therapist'])assert.ok(noteLanguageRules.includes(term));
 assert.doesNotMatch(noteLanguageRules,/tx = transfer|care and tx = no pain during care and transfers/i);
 assert.match(noteLanguageRules,/retain familiar.*abbreviations/i);
 assert.match(noteLanguageRules,/mg, mL, cm/);
});
test('familiar abbreviations and measurement units may survive clinical output validation',()=>{
 const s='Obs within range. Tolerating f&f. Ax completed. Medication X 2.5 mg. Wound 2 cm.';
 assert.equal(validateNoteDraft(draft(s),input(s)),true);
 assert.equal(validateNoteDraft(draft(s,'Medication X 5 mg.'),input(s)),false);
});
test('clear date and duration cues do not produce false ambiguity alerts',()=>{
 for(const s of ['Review in 3/12.','Review every 6/52.','Review within 2/7.','Reviewed on 9/11.','Pain for 2/7.'])assert.deepEqual(noteLanguageWarnings(input(s)),[],s);
 for(const s of ['Review 3/12.','Review in 9/11.'])assert.ok(noteLanguageWarnings(input(s)).length>0,s);
});
test('each target receives final meanings, retention and audience rules through the actual handler',async()=>{
 const s='OT review in 2/7. CNS ax completed. Tx ongoing. No pain during t/f. Tolerating f&f. Medication X 2.5 mg.';
 for(const target of ['ecase','gp','nok','manager','pharmacy']){
  const prompts=[];const text=target==='nok'?'An occupational therapist review is planned in 2/7. A central nervous system assessment was completed. Treatment is ongoing. No pain during transfers. Food and fluid intake is tolerated. Medication X 2.5 mg.':s;
  const send=async(url,opts)=>{prompts.push(JSON.parse(opts.body).instructions);return Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(prompts.length===1?draft(s,text):{approved:true,issues:[]})}]}]});};
  const r=await handleNote(new Request('https://afterfall.test/api/notes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input(s,target))}),{key:'synthetic'},true,send);
  assert.equal(r.status,200,target);assert.equal(prompts.length,2);
  for(const p of prompts){assert.ok(p.includes('tx = treatment'));assert.ok(p.includes('OT = occupational therapist'));assert.match(p,/retain familiar.*abbreviations/i);}
  assert.deepEqual((await r.json()).warnings,[]);
 }
});
