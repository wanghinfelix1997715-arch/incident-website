import test from 'node:test';
import assert from 'node:assert/strict';
import {handleGenerate} from '../lib/generate.ts';
import {handleNote} from '../lib/note-generator.ts';
import {draftIncident,incidentExample} from '../lib/incident.ts';
import {reviewedIncidentDocuments} from '../lib/incident-rewrite.ts';
const request=body=>new Request('https://care.test/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
const output=value=>Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(value)}]}]});
const writer=documents=>({documents,warnings:[],references:Object.entries(documents).filter(([,s])=>s.trim()).map(([field,s])=>({field,source:s.slice(0,2000),draft:s.slice(0,2000)}))});
test('each incident returns reviewer corrections and remaining alerts as an editable result',async()=>{
 for(const pathway of ['fall','wound','infection']){
  const incident=incidentExample(pathway),canonical=draftIncident(pathway,incident);
  const documents={...canonical,nok:'The medication record is being updated.'};
  const text=canonical.nok;
  let calls=0;
  const prompts=[];
  const result=await(await handleGenerate(request({pathway,incident}),{key:'synthetic'},true,async(_url,options)=>{prompts.push(JSON.parse(options.body));return output(++calls===1?writer(documents):{approved:false,issues:['The source contains two different event times.'],warnings:[],corrections:[{field:'nok',text}]});})).json();
  assert.equal(calls,2);assert.equal(result.documents.nok,text);
  assert.equal(result.reviewStatus,'needs_attention');assert.notEqual(result.reviewed,true);
  assert.deepEqual(reviewedIncidentDocuments(pathway,result,canonical,incident),result.documents);
  assert.ok(result.warnings.some(s=>/two different event times/.test(s)));
  assert.equal(result.documents.details,canonical.details,'recipient concern does not discard incident');
  assert.match(prompts[1].instructions,/correct the candidate before returning it/);
  assert.doesNotMatch(prompts[1].instructions,/Do not rewrite\./);
  assert.ok(prompts[1].text.format.schema.required.includes('corrections'));
  assert.deepEqual(JSON.parse(prompts[1].input).incident,incident);
 }
});
test('an unavailable review returns the writer draft; an unavailable writer returns local incident drafts',async()=>{
 const pathway='infection',incident=incidentExample(pathway),canonical=draftIncident(pathway,incident);
 for(const failAt of [1,2]){
  let calls=0;
  const result=await(await handleGenerate(request({pathway,incident}),{key:'synthetic'},true,async()=>{if(++calls===failAt)throw Error('synthetic-private-error');return output(writer(canonical));})).json();
  assert.deepEqual(result.documents,canonical);assert.equal(result.reviewStatus,'unavailable');
  assert.deepEqual(reviewedIncidentDocuments(pathway,result,canonical,incident),canonical);
  assert.ok(result.warnings.length);assert.doesNotMatch(JSON.stringify(result),/synthetic-private-error/);
 }
});
test('Note Generator applies supported corrections while displaying unresolved concerns',async()=>{
 const input={source:'An email was sent to the GP requesting a medication record update.',context:'',sourceType:'Rough notes',communicationStatus:'Unknown',target:'ecase'};
 const text='The medication record is being updated.';let calls=0;
 const r=await handleNote(request(input),{key:'synthetic'},true,async()=>output(++calls===1?{text,warnings:[],references:[{source:input.source,draft:text}]}:{approved:false,issues:['Review the supplied timing.'],corrections:[{field:'text',text:input.source}]}));
 const result=await r.json();assert.equal(r.status,200);assert.equal(calls,2);
 assert.equal(result.document,input.source);assert.equal(result.reviewStatus,'needs_attention');assert.ok(result.warnings.includes('Review the supplied timing.'));
});
test('no key or invalid model format still returns a labelled editable source draft for Note Generator',async()=>{
 const input={source:'Resident T returned at 1230. Lunch offered.',context:'',sourceType:'Rough notes',communicationStatus:'Unknown',target:'ecase'};
 for(const config of [{},{key:'synthetic'}]){
  const r=await handleNote(request(input),config,true,async()=>output({nonsense:true}));const result=await r.json();
  assert.equal(r.status,200);assert.equal(result.document,input.source);assert.equal(result.reviewStatus,'unavailable');assert.ok(result.warnings.length);
 }
});
test('invalid correction fields or broken headings retain the writer draft and an alert',async()=>{
 const pathway='fall',incident=incidentExample(pathway),canonical=draftIncident(pathway,incident);
 for(const corrections of [[{field:'ecase',text:'Required headings lost.'}],[{field:'unknown',text:'Wrong field.'}],[{field:'details',text:'A'},{field:'details',text:'B'}]]){
  let calls=0;
  const result=await(await handleGenerate(request({pathway,incident}),{key:'synthetic'},true,async()=>output(++calls===1?writer(canonical):{approved:true,issues:[],warnings:[],corrections}))).json();
  assert.deepEqual(result.documents,canonical);assert.equal(result.reviewStatus,'unavailable');assert.ok(result.warnings.length);
 }
});
test('all Note Generator targets return source-supported corrections rather than critique or rejection',async()=>{
 for(const target of ['ecase','gp','nok','manager','pharmacy']){
  const source='An email was sent to the general practitioner requesting a medication record update. The update is not confirmed.';
  const input={source,context:'',sourceType:'Rough notes',communicationStatus:'Unknown',target};
  const draft='The medication record update is underway.';let calls=0;const prompts=[];
  const result=await(await handleNote(request(input),{key:'synthetic'},true,async(_url,options)=>{prompts.push(JSON.parse(options.body));return output(++calls===1?{text:draft,warnings:[],references:[{source,draft}]}:{approved:true,issues:[],corrections:[{field:'text',text:source}]});})).json();
  assert.equal(calls,2);assert.equal(result.document,source);assert.equal(result.reviewStatus,'checked');assert.deepEqual(result.warnings,[]);
  assert.match(prompts[1].instructions,/correct the candidate before returning it/);
  assert.doesNotMatch(prompts[1].instructions,/Do not rewrite it\./);
  assert.equal(JSON.parse(prompts[1].input).source,source);
 }
});
