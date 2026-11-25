import test from 'node:test';
import assert from 'node:assert/strict';
import {handleGenerate} from '../lib/generate.ts';
import {handleNote} from '../lib/note-generator.ts';
import {draftIncident,incidentExample} from '../lib/incident.ts';
import {reviewedIncidentDocuments} from '../lib/incident-rewrite.ts';

const request=(route,body)=>new Request('https://care.test/api/'+route,{
 method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),
});
const output=value=>Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(value)}]}]});

test('all incident pathways send alternative date wording to independent review and UI accepts it',async()=>{
 for(const pathway of ['fall','wound','infection']){
  const incident={...incidentExample(pathway),date:'19/11/26'};
  const canonical=draftIncident(pathway,incident);
  const documents=Object.fromEntries(Object.entries(canonical).map(([key,text])=>[key,text.replaceAll('19/11/26','19th November 2026')]));
  const warnings=['Input contains an unresolved source detail; confirm it before copying.'];
  const candidate={documents,warnings,references:Object.entries(documents).filter(([,text])=>text.trim()).map(([field,text])=>({field,source:'19/11/26',draft:text.slice(0,2000)}))};
  const seen=[];
  const result=await(await handleGenerate(request('generate',{pathway,incident}),{key:'synthetic'},true,async(url,opts)=>{
   seen.push(JSON.parse(opts.body));
   return output(seen.length===1?candidate:{approved:true,issues:[],warnings:[]});
  })).json();
  assert.equal(seen.length,2);
  assert.match(seen[0].instructions,/Before drafting, assess the complete original input/);
  assert.match(seen[1].instructions,/independent|independently/i);
  assert.deepEqual(JSON.parse(seen[1].input).incident,incident);
  assert.deepEqual(reviewedIncidentDocuments(pathway,result,canonical,incident),documents);
  assert.ok(result.warnings.includes(warnings[0]));
 }
});

test('Note Generator handles prior completed contact inside a new draft, and retains input alerts',async()=>{
 const input={source:'GP was informed on 19/11/26. Dear Family, the urine result remains pending.',context:'',sourceType:'Outgoing email',communicationStatus:'Draft — not sent',target:'ecase'};
 const text='The GP was informed on 19th November 2026. The urine result remains pending.';
 const warnings=['The family email is a draft; verify sending status.'];
 let calls=0;
 const result=await(await handleNote(request('notes',input),{key:'synthetic'},true,async()=>output(++calls===1?
  {text,warnings,references:[{source:input.source,draft:text}]}:{approved:true,issues:[]}))).json();
 assert.equal(calls,2);
 assert.equal(result.document,text);
 assert.deepEqual(result.warnings,warnings);
});

test('an altered dose reaches review and remains clearly flagged on the editable output',async()=>{
 const input={source:'Medication X 400 mg prescribed. Not administered.',context:'',sourceType:'Rough notes',communicationStatus:'Unknown',target:'gp'};
 const text='Medication X 800 mg was administered.';
 let calls=0;
 const result=await(await handleNote(request('notes',input),{key:'synthetic'},true,async()=>output(++calls===1?
  {text,warnings:[],references:[{source:input.source,draft:text}]}:
  {approved:false,issues:['Dose changed from 400 mg to 800 mg and prescribed treatment was described as administered.']}))).json();
 assert.equal(calls,2);
 assert.equal(result.document,text);
 assert.equal(result.reviewStatus,'needs_attention');
 assert.match(result.warnings[0],/Dose changed/);
});
