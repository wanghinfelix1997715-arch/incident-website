import test from 'node:test';
import assert from 'node:assert/strict';
import {validateNoteDraft,handleNote} from '../lib/note-generator.ts';
import {noteLanguageWarnings} from '../lib/note-language.ts';
const input=source=>({source,context:'',sourceType:'Rough notes',communicationStatus:'Unknown',target:'ecase'});
const candidate=(source,text)=>({text,warnings:[],references:[{source,draft:text}]});
test('known food/fluid abbreviation must be expanded instead of merely copying it',()=>{
 const s='Tolerating f&f well.';
 assert.equal(validateNoteDraft(candidate(s,s),input(s)),false);
 assert.equal(validateNoteDraft(candidate(s,'Food and fluid intake was well tolerated.'),input(s)),true);
});
test('explicit recurring month interval can be written naturally without weakening number checks',()=>{
 const s='GP review every 3/12.';
 assert.equal(validateNoteDraft(candidate(s,'GP review every 3 months.'),input(s)),true);
 assert.equal(validateNoteDraft(candidate(s,'GP review every 6 months.'),input(s)),false);
});
test('date-marked Australian day/month permits named month, never invents a year',()=>{
 const s='Reviewed on 9/11.';
 assert.equal(validateNoteDraft(candidate(s,'Reviewed on 9 November.'),input(s)),true);
 assert.equal(validateNoteDraft(candidate(s,'Reviewed on 9 November 2026.'),input(s)),false);
});
test('ambiguous slash notation and scores are not globally converted into months or dates',()=>{
 for(const s of ['Review 3/12.','Score 9/11.']){
  if(s.startsWith('Review'))assert.ok(noteLanguageWarnings(input(s)).some(w=>/confirm|ambiguous/i.test(w)));
  else assert.equal(noteLanguageWarnings(input(s)).length,0);
  assert.equal(validateNoteDraft(candidate(s,'Review in 3 months.'),input(s)),false);
 }
});
test('contextual conversions do not split BP, medication dose or unknown fractions',()=>{
 const s='BP 120/80. Medication X 2.5 mg. Review every 9/11.';
 for(const text of ['BP 120. Medication X 2.5 mg.','Medication X 5 mg.','Review in 9 months.'])assert.equal(validateNoteDraft(candidate(s,text),input(s)),false);
});
test('writer and reviewer receive local meanings, sentence-context rules and natural-prose guidance',async()=>{
 const source='Post fall day 3 Resident S pain free settled. No pain during care and tx. Tolerates f&f. Obs within range. Obs within range.';
 const text='On post-fall day 3, Resident S was settled and pain-free during care and transfers. Food and fluid intake was well tolerated. Observations were within range.';
 const result=candidate(source,text);const prompts=[];
 const send=async(url,opts)=>{const b=JSON.parse(opts.body);prompts.push(b.instructions);return Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(prompts.length===1?result:{approved:true,issues:[]})}]}]});};
 const r=await handleNote(new Request('https://afterfall.test/api/notes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input(source))}),{key:'synthetic'},true,send);
 assert.equal(r.status,200);for(const p of prompts){assert.match(p,/transfer/i);assert.match(p,/assessment/i);assert.match(p,/food and fluid/i);assert.match(p,/deduplicat|repetit/i);assert.match(p,/ambiguous/i);}
});

test('allowing a month expansion does not authorise a new medication dose',()=>{
 const s='Review every 3/12. Medication X 2.5 mg.';
 assert.equal(validateNoteDraft(candidate(s,'Review every 3 months. Medication X 2.5 mg.'),input(s)),true);
 assert.equal(validateNoteDraft(candidate(s,'Review every 3 months. Medication X 3 mg.'),input(s)),false);
});
