import test from 'node:test';
import assert from 'node:assert/strict';
import {setImmediate as flush} from 'node:timers/promises';
import {handleGenerate} from '../lib/generate.ts';
import {handleNote} from '../lib/note-generator.ts';
import {draftIncident,incidentExample} from '../lib/incident.ts';
import {AI_CLIENT_TIMEOUT_MS,AI_STAGE_TIMEOUT_MS} from '../lib/ai-timing.ts';
import {readFileSync} from 'node:fs';

const request=(body)=>new Request('https://care.test/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
const output=value=>Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(value)}]}]});
const note={source:'Resident T returned from hospital at 1230 on 23/11. Comfortable and settled. Lunch offered.',context:'',sourceType:'Rough notes',communicationStatus:'Unknown',target:'ecase'};
const noteDraft={text:note.source,warnings:[],references:[{source:note.source,draft:note.source}]};
function incidentDraft(pathway){
 const incident={...incidentExample(pathway),date:'24/11/2026',time:'1200'};
 const documents=draftIncident(pathway,incident);
 return {incident,candidate:{documents,warnings:[],references:Object.entries(documents).filter(([,v])=>v.trim()).map(([field,text])=>({field,source:text.slice(0,2000),draft:text.slice(0,2000)}))}};
}
function clock(t){
 t.mock.timers.enable({apis:['setTimeout','Date']});
 // Also exercise the historical AbortSignal.timeout deadline without real waits.
 t.mock.method(AbortSignal,'timeout',ms=>{const c=new AbortController();setTimeout(()=>c.abort(new DOMException('Timed out','TimeoutError')),ms);return c.signal;});
 t.mock.method(console,'info',()=>{});
}
function delayed(values,delays){
 let calls=0;
 return {send:async(_url,options)=>{
   const index=calls++;
   await new Promise((resolve,reject)=>{
     const timer=setTimeout(resolve,delays[index]);
     options.signal.addEventListener('abort',()=>{clearTimeout(timer);reject(options.signal.reason);},{once:true});
   });
   return output(values[index]);
 },count:()=>calls};
}
test('all pathways complete a 60-second writer plus a separate 60-second review',async t=>{
 clock(t);
 for(const pathway of ['fall','wound','infection']){
   const {incident,candidate}=incidentDraft(pathway);
   const provider=delayed([candidate,{approved:true,issues:[],warnings:[]}],[60000,60000]);
   const pending=handleGenerate(request({pathway,incident}),{key:'synthetic'},true,provider.send);
   await flush();t.mock.timers.tick(60000);await flush();t.mock.timers.tick(60000);await flush();
   const result=await(await pending).json();
   assert.equal(provider.count(),2);
   assert.equal(result.reviewed,true,JSON.stringify(result.reason));
 }
});
test('Note Generator uses the same independent stage budgets',async t=>{
 clock(t);
 const provider=delayed([noteDraft,{approved:true,issues:[]}],[60000,60000]);
 const pending=handleNote(request(note),{key:'synthetic'},true,provider.send);
 await flush();t.mock.timers.tick(60000);await flush();t.mock.timers.tick(60000);await flush();
 const result=await(await pending).json();
 assert.equal(result.document,note.source);
 assert.equal(provider.count(),2);
});
test('a stalled writer or reviewer is bounded, identified, and never accepted',async t=>{
 clock(t);
 const logs=[];t.mock.method(console,'info',value=>logs.push(value));
 for(const handler of ['incident','note'])for(const stage of ['writing','review']){
   const {incident,candidate}=incidentDraft('infection');
   const provider=delayed([handler==='incident'?candidate:noteDraft,{approved:true,issues:[],warnings:[]}],stage==='writing'?[200000,1]:[1000,200000]);
   const pending=handler==='incident'?handleGenerate(request({pathway:'infection',incident}),{key:'synthetic-secret'},true,provider.send):handleNote(request(note),{key:'synthetic-secret'},true,provider.send);
   await flush();
   if(stage==='review'){t.mock.timers.tick(1000);await flush();}
   t.mock.timers.tick(AI_STAGE_TIMEOUT_MS);await flush();
   const response=await pending;const result=await response.json();
   assert.match(result.reason||result.error,stage==='review'?/source review timed out/i:/drafting timed out/i);
   assert.notEqual(result.reviewed,true);assert.equal(result.document,undefined);
   assert.equal(provider.count(),stage==='writing'?1:2,'no automatic paid retries');
   if(handler==='incident')assert.equal(result.rewriteFailed,true);
   else {assert.equal(response.status,504);assert.equal(result.code,'provider_timeout');}
 }
 assert.ok(logs.some(s=>JSON.parse(s).stage==='review'&&JSON.parse(s).code==='timeout'));
 assert.ok(logs.every(s=>Object.keys(JSON.parse(s)).sort().join(',')==='code,durationMs,event,operation,stage'));
 assert.doesNotMatch(logs.join(''),/synthetic-secret|Resident T|hospital|source|candidate/i);
});
test('both browser flows wait beyond the complete server budget',()=>{
 assert.ok(AI_CLIENT_TIMEOUT_MS>2*AI_STAGE_TIMEOUT_MS);
 for(const file of ['AfterFall','NoteGenerator']){
   const source=readFileSync(new URL('../components/'+file+'.tsx',import.meta.url),'utf8');
   assert.match(source,/AI_CLIENT_TIMEOUT_MS/);
   assert.doesNotMatch(source,/65000/);
 }
});
