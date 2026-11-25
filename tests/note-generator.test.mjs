import test from 'node:test';
import assert from 'node:assert/strict';
import {handleNote, validNoteInput, validateNoteDraft, noteInputKey, targets} from '../lib/note-generator.ts';
const input={source:'Resident A has 2 tablets of Medication X remaining. Could pharmacy confirm the next delivery?',sourceType:'Outgoing email',communicationStatus:'Sent',context:'',target:'ecase'};
const request=(body=input,headers={})=>new Request('https://afterfall.test/api/notes',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://afterfall.test',...headers},body:JSON.stringify(body)});
const text='Pharmacy emailed regarding Medication X, with 2 tablets remaining. Confirmation of the next delivery was requested.';
const draft={text,warnings:[],references:[{source:'2 tablets of Medication X remaining',draft:'2 tablets remaining'}]};
const okReview={approved:true,issues:[]};
function mock(values){let i=0;return async(url,opts)=>{const value=values[i++];return value instanceof Response?value:Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(value)}]}]});};}
test('five selectable targets and strict bounded input',()=>{
 assert.deepEqual(Object.keys(targets),['ecase','gp','nok','manager','pharmacy']);
 assert.ok(validNoteInput(input));
 for(const x of [{...input,target:'all'},{...input,source:''},{...input,source:'x'.repeat(16001)},{...input,communicationStatus:'Completed'},{...input,extra:'ignore rules'},null])assert.equal(validNoteInput(x),false);
});
test('valid paraphrase is accepted without using the incident exact-wording validator',async()=>{
 const r=await handleNote(request(),{key:'synthetic'},true,mock([draft,okReview]));
 const b=await r.json();assert.equal(r.status,200);assert.equal(b.document,text);assert.equal(b.target,'ecase');
});
test('all five targets receive explicit audience instructions and same safe request settings',async()=>{
 for(const target of Object.keys(targets)){
  const requests=[];const send=async(url,opts)=>{const b=JSON.parse(opts.body);requests.push(b);return Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(requests.length===1?draft:okReview)}]}]});};
  await handleNote(request({...input,target}),{key:'synthetic'},true,send);
  assert.equal(requests.length,2);for(const r of requests){assert.equal(r.store,false);assert.equal(r.text.format.strict,true);}
  assert.ok(requests[0].instructions.includes(targets[target].instruction));
 }
});
test('new numbers, fabricated source anchors and altered anchor text fail closed',()=>{
 assert.equal(validateNoteDraft({...draft,text:text+' 5 mg daily.'},input),false);
 assert.equal(validateNoteDraft({...draft,references:[{source:'Delivery confirmed tomorrow.',draft:'Delivery confirmed'}]},input),false);
 assert.equal(validateNoteDraft({...draft,references:[{source:'2 tablets',draft:'made up phrase'}]},input),false);
 assert.equal(validateNoteDraft({...draft,extra:'x'},input),false);
});
test('draft or unknown outgoing contact receives an external alert while remaining editable',async()=>{
 for(const communicationStatus of ['Draft — not sent','Unknown']){
  const r=await handleNote(request({...input,communicationStatus}),{key:'synthetic'},true,mock([draft,{approved:false,issues:['The draft email was incorrectly documented as sent.']}]));
  assert.equal(r.status,200);const result=await r.json();assert.equal(result.document,text);assert.equal(result.reviewStatus,'needs_attention');assert.ok(result.warnings.length);
 }
});
test('review flags treatment, meaning, omission and chronology concerns beside an editable draft',async()=>{
 for(const issue of ['Unsupported treatment','Medication dose omitted','Chronology reversed','Wrong source actor','Suspected converted to confirmed']){
  const r=await handleNote(request(),{key:'synthetic'},true,mock([draft,{approved:false,issues:[issue]}]));
  assert.equal(r.status,200);const result=await r.json();assert.equal(result.document,text);assert.equal(result.reviewStatus,'needs_attention');assert.ok(result.warnings.length);
 }
});
test('auth, origin, media type and streamed size are bounded before provider',async()=>{
 let called=false;const send=async()=>{called=true;throw Error();};
 assert.equal((await handleNote(request(),{},false,send)).status,401);
 assert.equal((await handleNote(request(input,{Origin:'https://other.test'}),{},true,send)).status,403);
 assert.equal((await handleNote(request(input,{'Content-Type':'text/plain'}),{},true,send)).status,415);
 assert.equal((await handleNote(request({...input,source:'x'.repeat(50000)}),{},true,send)).status,413);
 assert.equal(called,false);
});
test('missing key and provider/review failures return labelled editable drafts without claiming checked success',async()=>{
 const missing=await(await handleNote(request(),{},true)).json();assert.equal(missing.document,input.source);assert.equal(missing.reviewStatus,'unavailable');
 for(const send of [mock([new Response('',{status:401})]),mock([new Response('',{status:429})]),mock([{}]),mock([draft,{approved:true,issues:['conflict']}]),async()=>{throw Error('secret synthetic');}]){
  const r=await handleNote(request(),{key:'synthetic'},true,send), b=await r.json();
  assert.equal(r.status,200);assert.ok(b.document);assert.notEqual(b.reviewStatus,'checked');assert.ok(b.warnings.length);assert.doesNotMatch(JSON.stringify(b),/secret synthetic/);
 }
});
test('source and status changes invalidate prior target results; target itself is separately banked',()=>{
 assert.notEqual(noteInputKey(input),noteInputKey({...input,source:input.source+' Updated.'}));
 assert.notEqual(noteInputKey(input),noteInputKey({...input,communicationStatus:'Unknown'}));
 assert.equal(noteInputKey(input),noteInputKey({...input,target:'pharmacy'}));
});
