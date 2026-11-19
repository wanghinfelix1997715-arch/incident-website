import test from 'node:test';
import assert from 'node:assert/strict';
import {handleNote,validateNoteDraft} from '../lib/note-generator.ts';
import {handleGenerate} from '../lib/generate.ts';
import {draftIncident} from '../lib/incident.ts';
import {noteLanguageWarnings} from '../lib/note-language.ts';
const input=source=>({source,context:'',sourceType:'Rough notes',communicationStatus:'Unknown',target:'gp'});
const request=(path,body)=>new Request('https://afterfall.test/api/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
const output=x=>Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(x)}]}]});
const writer=(source,text)=>({text,warnings:[],references:[{source,draft:text}]});
test('faithful clock, quantity and day interval wording passes; changed values still fail',()=>{
 for(const [source,text] of [
  ['At 1655, Resident A was found seated.','At 16:55, Resident A was found seated.'],
  ['At 09:05, Resident A was reviewed.','At 0905 hours, Resident A was reviewed.'],
  ['Medication X 400mg: take ONE tablet TWICE a day.','Medication X 400 mg: take 1 tablet twice daily.'],
  ['Review within 2/7.','Review within 2 days.'],
 ])assert.equal(validateNoteDraft(writer(source,text),input(source)),true,text);
 const source='At 1655, Resident A was reviewed. Medication X 400 mg: ONE tablet TWICE a day.';
 for(const text of ['At 16:56, Resident A was reviewed.','Medication X 800 mg.','Medication X 400 mg: 3 tablets daily.'])assert.equal(validateNoteDraft(writer(source,text),input(source)),false,text);
});
test('note writer quotation mismatch can reach independent original-source review',async()=>{
 const source='Resident A tolerarte f&f well.';
 const draft=writer('Resident A tolerated food and fluid well.','Resident A tolerated food and fluid well.');
 for(const approved of [true,false]){
  let calls=0;const seen=[];
  const send=async(u,o)=>{seen.push(JSON.parse(o.body));return output(++calls===1?draft:{approved,issues:approved?[]:['Unsupported assessment']});};
  const r=await handleNote(request('notes',input(source)),{key:'synthetic'},true,send);
  assert.equal(calls,2);assert.equal(r.status,approved?200:422);
  assert.equal(JSON.parse(seen[1].input).source,source);
  assert.equal(!!(await r.json()).document,approved);
 }
});
test('sparse infection with date field and planned word-number medication generates reviewed prose',async()=>{
 const incident={resident:'Resident A',date:'19/11',infectionType:'Urinary',diagnosisSource:'Repeat urine specimen reported infection after treatment.',planned:'Medication X 400mg. Take ONE tablet TWICE a day. Commence on 20/11 evening.'};
 const canonical=draftIncident('infection',incident);
 const documents=Object.fromEntries(Object.entries(canonical).map(([k,v])=>[k,v.replaceAll('ONE tablet','1 tablet').replaceAll('TWICE a day','twice daily').replaceAll('400mg','400 mg')]));
 const references=Object.entries(documents).filter(([,v])=>v.trim()).map(([field,text])=>({field,source:canonical[field].slice(0,2000),draft:text.slice(0,2000)}));
 let calls=0;const b=await(await handleGenerate(request('generate',{pathway:'infection',incident}),{key:'synthetic'},true,async()=>output(++calls===1?{documents,warnings:[],references}:{approved:true,issues:[],warnings:[]}))).json();
 assert.equal(b.mode,'ai');assert.equal(calls,2);assert.equal(b.reviewed,true);
 assert.ok(!b.warnings.some(w=>/Ambiguous slash notation 19\/11/.test(w)));
 assert.match(b.documents.investigation,/1 tablet twice daily/);
 assert.doesNotMatch(b.documents.investigation,/treatment (?:was )?commenced|observations.*normal/i);
});
test('incident references are hints, while independent review still rejects changed meaning',async()=>{
 const incident={resident:'Resident A',symptoms:'Mild pain in lt arm.'};
 const canonical=draftIncident('infection',incident);
 const documents=Object.fromEntries(Object.entries(canonical).map(([k,v])=>[k,v.replaceAll('lt arm','left arm')]));
 const references=Object.entries(documents).filter(([,v])=>v.trim()).map(([field,text])=>({field,source:'Mild pain in left arm.',draft:text.slice(0,2000)}));
 for(const approved of [true,false]){
  let calls=0;const b=await(await handleGenerate(request('generate',{pathway:'infection',incident}),{key:'synthetic'},true,async()=>output(++calls===1?{documents,warnings:[],references}:{approved,issues:approved?[]:['Wrong side'],warnings:[]}))).json();
  assert.equal(calls,2);assert.equal(b.reviewed===true,approved);assert.equal(b.rewriteFailed===true,!approved);
 }
});
test('explicit date labels suppress false alerts; genuinely isolated slash notation still alerts',()=>{
 assert.deepEqual(noteLanguageWarnings({source:'Event / onset date: 19/11',context:''}),[]);
 assert.ok(noteLanguageWarnings({source:'Review 3/12',context:''}).some(w=>/Ambiguous/.test(w)));
});
test('review failures expose bounded reasons outside documents, never a false successful draft',async()=>{
 const source='Resident A denied pain.',draft=writer(source,source);
 let calls=0;const note=await(await handleNote(request('notes',input(source)),{key:'synthetic'},true,async()=>output(++calls===1?draft:{approved:false,issues:['The source does not confirm this finding.']}))).json();
 assert.deepEqual(note.issues,['The source does not confirm this finding.']);assert.equal(note.document,undefined);
 const incident={symptoms:source},documents=draftIncident('infection',incident);
 const references=Object.entries(documents).filter(([,v])=>v.trim()).map(([field,text])=>({field,source:text,draft:text}));
 calls=0;const result=await(await handleGenerate(request('generate',{pathway:'infection',incident}),{key:'synthetic'},true,async()=>output(++calls===1?{documents,warnings:[],references}:{approved:false,issues:['A planned action was described as completed.'],warnings:[]}))).json();
 assert.equal(result.rewriteFailed,true);assert.ok(result.warnings.includes('A planned action was described as completed.'));
 assert.ok(!Object.values(result.documents).some(text=>text.includes('A planned action was described as completed.')));
});
test('invalid numeric and reference structures still fail before independent review',async()=>{
 const source='Resident A takes Medication X 400 mg.',draft=writer(source,source);
 for(const bad of [{...draft,text:source+' 800 mg.'},{...draft,references:[]},{...draft,references:[{source:42,draft:source}]}]){
  let calls=0;const r=await handleNote(request('notes',input(source)),{key:'synthetic'},true,async()=>{calls++;return output(bad);});
  assert.equal(r.status,422);assert.equal(calls,1);assert.equal((await r.json()).document,undefined);
 }
});
