import test from 'node:test';
import assert from 'node:assert/strict';
import {draftIncident} from '../lib/incident.ts';
import {handleGenerate} from '../lib/generate.ts';
import {reviewedIncidentDocuments} from '../lib/incident-rewrite.ts';

const incident = {
  resident:'Resident A', date:'19/11', infectionType:'Urinary', infectionStatus:'Suspected',
  symptoms:'Resident reported pain when passing urine.', observations:'Temperature 37.8°C.',
  specimenStatus:'Result pending', specimen:'MSU collected at 16:55.',
  gp:'Pending', nok:'Pending', hospital:'Not required', gpRequired:'No at present',
  planned:'Medication X 400mg. Take ONE tablet TWICE a day. Commence on 20/11 evening.',
};

test('infection keeps full clinical detail while using concise recipient-specific prose', () => {
  const docs = draftIncident('infection', incident);
  assert.match(docs.summary, /Suspected urinary infection/);
  assert.match(docs.ecase, /Result pending/);
  assert.match(docs.ecase, /The following actions are planned:.*400mg.*20\/11/);
  assert.doesNotMatch(docs.ecase, /Symptoms \/ signs:|Test \/ specimen status:/);
  for (const email of [docs.gp,docs.nok]) {
    assert.doesNotMatch(email, /GP .*pending|hospital.*not required|please review/i);
  }
  assert.match(docs.gp, /400mg/);
  assert.doesNotMatch(docs.nok, /400mg|37\.8|\bMSU\b/);
  const escalation = draftIncident('infection', {...incident,gpRequired:'Yes',reviewReason:'Please review the urine result when available.',hospital:'Transferred',escalation:'Transferred to hospital after reassessment.'});
  assert.match(escalation.gp, /Please review the urine result when available/);
  assert.match(escalation.nok, /Transferred to hospital after reassessment/);
});

const request = () => new Request('https://example.test/api/generate', {
  method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pathway:'infection',incident}),
});
const output = value => Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(value)}]}]});

test('infection accepts faithful reorganisation in server and UI gates, and rejects a new dose', async () => {
  const canonical = draftIncident('infection',incident);
  for (const changedDose of [false,true]) {
    const documents = {...canonical, summary:'Suspected urinary infection on 19 November. Temperature 37.8°C.'};
    if (changedDose) documents.actions += ' Medication X 800 mg.';
    const references = Object.entries(documents).filter(([,text])=>text.trim()).map(([field,text])=>({field,source:canonical[field],draft:text}));
    let calls = 0;
    const result = await (await handleGenerate(request(),{key:'synthetic'},true,async()=>output(++calls===1?{documents,warnings:[],references}:{approved:true,issues:[],warnings:[]}))).json();
    assert.equal(calls,changedDose?1:2);
    assert.deepEqual(reviewedIncidentDocuments('infection',result,canonical,incident),changedDose?null:documents);
    assert.equal(result.rewriteFailed===true,changedDose);
  }
});
