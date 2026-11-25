import test from 'node:test';
import assert from 'node:assert/strict';
import {handleGenerate} from '../lib/generate.ts';
import {handleNote, targets} from '../lib/note-generator.ts';
import {draftIncident, incidentExample} from '../lib/incident.ts';
import {noteStyleRules} from '../lib/documentation-style.ts';

const request=(route,body)=>new Request('https://care.test/api/'+route,{
  method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),
});
const output=value=>Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(value)}]}]});

test('each incident writer and reviewer receives direct account and field-specific abbreviation rules',async()=>{
  for(const pathway of ['fall','wound','infection']){
    const incident=incidentExample(pathway);
    const documents=draftIncident(pathway,incident);
    const candidate={documents,warnings:[],references:Object.entries(documents).filter(([,text])=>text.trim()).map(([field,text])=>({field,source:text.slice(0,2000),draft:text.slice(0,2000)}))};
    const calls=[];
    const result=await(await handleGenerate(request('generate',{pathway,incident}),{key:'synthetic'},true,async(url,options)=>{
      calls.push(JSON.parse(options.body));
      return output(calls.length===1?candidate:{approved:true,issues:[],warnings:[]});
    })).json();
    assert.equal(result.reviewed,true);
    assert.equal(calls.length,2);
    for(const call of calls){
      assert.match(call.instructions,/direct third-person account/);
      assert.match(call.instructions,/"the note says".*"the details state".*"the plan records"/);
      assert.match(call.instructions,/RiskMan fields summary, details, actions and investigation use full words/);
      assert.match(call.instructions,/ecase progress note and gp email may retain/);
      assert.match(call.instructions,/bd to twice daily and for 5\/7 to for five days/);
      assert.match(call.instructions,/prescribed.*distinct from administration/);
      assert.match(call.instructions,/25 words, without resident names/);
    }
  }
});

test('all Note Generator targets share the clinical voice while only GP and progress allow shorthand',async()=>{
  const source='GP charted Medicine X bd for 5/7. Review next week. No pain observed on palpation.';
  for(const target of Object.keys(targets)){
    const input={source,context:'',sourceType:'Rough notes',communicationStatus:'Unknown',target};
    const text=['ecase','gp'].includes(target)
      ?'The GP prescribed Medicine X BD for 5/7, with review planned for next week. No pain was observed on palpation.'
      :'The general practitioner prescribed Medicine X twice daily for five days, with review planned for next week. No pain was observed on palpation.';
    const calls=[];
    const result=await(await handleNote(request('notes',input),{key:'synthetic'},true,async(url,options)=>{
      calls.push(JSON.parse(options.body));
      return output(calls.length===1?{text,warnings:[],references:[{source,draft:text}]}:{approved:true,issues:[]});
    })).json();
    assert.equal(result.document,text);
    assert.equal(calls.length,2);
    for(const call of calls)assert.ok(call.instructions.includes(noteStyleRules(target)));
    assert.equal(noteStyleRules(target).includes('may retain clear familiar clinical abbreviations'),['ecase','gp'].includes(target));
  }
});

test('source field conflicts alert outside the report, while unambiguous assessment and prescription remain direct',async()=>{
  const incident={
    resident:'Resident S',date:'23/11/26',infectionType:'Skin / wound',infectionStatus:'Suspected',
    diagnosisSource:'Doctor reviewed a skin lesion.',pain:'Observed',painDetail:'No pain on palpation.',
    medication:'GP charted Medicine X bd for 5/7.',planned:'Review next week.',
  };
  const canonical=draftIncident('infection',incident);
  const documents={
    ...canonical,
    summary:'A skin lesion was identified.',
    details:'A small skin lesion was identified. No pain was observed on palpation.',
    actions:'The general practitioner prescribed Medicine X twice daily for five days, with review planned for next week.',
  };
  const warning='Pain selection and assessment text may conflict. Confirm whether pain was observed at another time.';
  let calls=0;
  const result=await(await handleGenerate(request('generate',{pathway:'infection',incident}),{key:'synthetic'},true,async()=>output(++calls===1?
    {documents,warnings:[warning],references:Object.entries(documents).map(([field,text])=>({field,source:'GP charted Medicine X bd for 5/7.',draft:text.slice(0,2000)}))}:
    {approved:true,issues:[],warnings:[warning]}))).json();
  assert.equal(result.reviewed,true);
  assert.ok(result.warnings.includes(warning));
  assert.doesNotMatch(result.documents.details,/the note says|the details|pain was marked/i);
  assert.doesNotMatch(result.documents.actions,/the plan records|\bGP\b|\bbd\b|5\/7|administered/i);
  assert.match(result.documents.actions,/prescribed.*review planned/);
});

test('a prescription incorrectly upgraded to administration remains flagged on an editable draft',async()=>{
  const input={source:'GP charted Medicine X bd for 5/7. First dose planned tonight.',context:'',sourceType:'Rough notes',communicationStatus:'Unknown',target:'ecase'};
  const text='The nurse administered Medicine X twice daily for five days.';
  let calls=0;
  const result=await(await handleNote(request('notes',input),{key:'synthetic'},true,async()=>output(++calls===1?
    {text,warnings:[],references:[{source:input.source,draft:text}]}:
    {approved:false,issues:['Prescription and planned first dose were incorrectly described as administered treatment.']}))).json();
  assert.equal(calls,2);
  assert.equal(result.document,text);
  assert.equal(result.reviewStatus,'needs_attention');
  assert.match(result.warnings[0],/incorrectly described/);
});
