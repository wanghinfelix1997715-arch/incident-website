import {incidentProviderResult} from './helpers/incident-provider.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { draft, getWarnings, mergeDrafts, validateAI, headings, validData, keys } from '../lib/drafts.ts';
import { example, empty, sections } from '../lib/assessment.ts';
import { handleGenerate } from '../lib/generate.ts';
import { ownerAccess } from '../lib/access.ts';
import { connectionState } from '../lib/connection.ts';
test('Sites owner email authorizes shared drafts even when platform user ID is absent',()=>{
 const owner='synthetic-owner@example.test';
 assert.equal(ownerAccess(new Headers({'oai-authenticated-user-email':owner}),owner).allowed,true);
 assert.equal(ownerAccess(new Headers({'oai-authenticated-user-email':owner.toUpperCase(),'oai-authenticated-user-id':'synthetic-id'}),owner).allowed,true);
 assert.equal(ownerAccess(new Headers(),owner).status,401);
 assert.equal(ownerAccess(new Headers({'OAI-Sites-Authorization':'Bearer synthetic-service-token'}),owner).allowed,false);
 assert.equal(ownerAccess(new Headers({'oai-authenticated-user-email':'other@example.test'}),owner).status,403);
 assert.equal(ownerAccess(new Headers({'oai-authenticated-user-email':owner})).status,503);
});
test('Connection status never mislabels authentication or server errors as missing key',()=>{
 assert.equal(connectionState(401,{configured:false}),'sign_in_required');
 assert.equal(connectionState(403,{}),'access_denied');
 assert.equal(connectionState(503,{}),'error');
 assert.equal(connectionState(200,{}),'error');
 assert.equal(connectionState(200,{configured:false}),'missing_key');
 assert.equal(connectionState(200,{configured:true}),'ready');
});
const all=d=>Object.values(d).join('\n');
const req=incident=>new Request('https://afterfall.test/api/generate',{method:'POST',headers:{'Content-Type':'application/json','Origin':'https://afterfall.test'},body:JSON.stringify({incident})});
// Acceptance directions recovered from Phase 1 discussion. Every fixture below is synthetic.
test('A1 uncertain staircase mechanism survives; absent GCS is not invented',()=>{
 const d=draft({...example,resident:'Synthetic A',suspected:'Possible stair descent; exact mechanism unknown.'});
 assert.match(d.details,/Suspected contributing circumstances: Possible stair descent; exact mechanism unknown/);
 assert.doesNotMatch(all(d),/GCS|fell down the stairs|confirmed stair descent/i);
 assert.match(d.investigation,/exact mechanism unknown/);
});
test('A2 initial assessment remains before later deterioration',()=>{
 const d=draft({...empty,resident:'Synthetic B',time:'10:10',pain:'Denied',rom:'At baseline',reassessment:'11:20 — severe right hip pain, drowsy, GCS 13; hospital transfer arranged.'});
 for(const k of ['actions','investigation','ecase','gp','nok']){
  assert.match(d[k],/11:20 — severe right hip pain, drowsy, GCS 13/);
  assert.ok(d[k].indexOf(k==='nok'?'reported no pain':'denied pain')<d[k].indexOf('11:20'));
 }
});
test('A3 pre-existing weakness retained as baseline, never promoted to new weakness',()=>{
 const d=draft({...empty,strength:'Pre-existing weakness unchanged',rom:'At baseline',limbdetail:'Baseline bilateral leg weakness; left hip ROM limited.'});
 assert.match(d.ecase,/Pre-existing weakness unchanged/);
 assert.match(d.ecase,/Baseline bilateral leg weakness/);
 assert.doesNotMatch(all(d),/New limb weakness|normal strength|full ROM/i);
});
test('A4 head strike, anticoagulants and escalation are retained',()=>{
 const input={...empty,head:'Confirmed / witnessed',anticoag:'Yes',hospital:'Pending',transferdetail:'Urgent medical advice requested; ambulance pending.'};
 const d=draft(input);
 assert.match(d.gp,/Head strike confirmed/);assert.match(d.gp,/On anticoagulant therapy/);
 assert.match(d.ecase,/Hospital transfer pending/);assert.match(d.gp,/ambulance pending/);
 assert.ok(getWarnings(input).some(w=>/Anticoagulant/.test(w)));
 assert.doesNotMatch(all(d),/Hospital transfer documented/);
});
test('A5 no pain does not exclude documented injury',()=>{
 const d=draft({...empty,pain:'Denied',injury:'Yes',injurydetail:'Small left forearm skin tear.'});
 for(const k of ['actions','ecase','gp','nok']){assert.match(d[k],/skin tear/);assert.match(d[k],/no pain|denied pain/);assert.doesNotMatch(d[k],/No injury/);}
});
test('A6 pending notifications and review never become completed',()=>{
 const d=draft({...empty,gp:'Pending',nok:'Not completed',frat:'Pending'});
 assert.match(d.actions,/GP notification pending/);assert.match(d.actions,/NOK notification not completed/);assert.match(d.actions,/FRAT review pending/);
 assert.doesNotMatch(all(d),/GP informed|NOK informed|FRAT reviewed and updated/);
});
test('A7 missing observations never become normal; incomplete drafts allowed',()=>{
 const d=draft({});assert.deepEqual(Object.keys(d),keys);
 assert.doesNotMatch(all(d),/GCS|normal|within range|BP \d|No injury|denied pain|informed|reviewed/i);
 assert.ok(getWarnings({}).length>5);
 for(const h of headings)assert.ok(d.ecase.includes(h+':'));
});
test('A8 all four outputs regenerate and independent manual edits survive',()=>{
 const first=draft({...empty,time:'09:00',place:'Synthetic room'});
 const next=draft({...empty,time:'12:30',place:'Synthetic lounge'});
 const edited=new Set(['details','gp']);const current={...first,details:'Manual narrative',gp:'Manual GP email'};
 const merged=mergeDrafts(current,next,edited);
 assert.equal(merged.details,'Manual narrative');assert.equal(merged.gp,'Manual GP email');
 for(const k of ['summary','actions','investigation','ecase','nok'])assert.equal(merged[k],next[k]);
 assert.match(merged.summary,/12:30/);assert.match(merged.ecase,/12:30/);assert.match(merged.nok,/12:30/);
 assert.deepEqual(mergeDrafts(current,next,new Set()),next);
});
test('six sections and ZIP-only fields retained',()=>{
 assert.equal(sections.length,6);const f=sections.flatMap(s=>s.fields.map(f=>f[0]));
 for(const k of ['pupils','cognition','baseline','weight','mobilised','mednotes','gpadvice','nokadvice','prevention','reassessment'])assert.ok(f.includes(k));
});
test('every free-text field is retained in appropriate documents',()=>{
 const input={...empty,found:'FOUND123',account:'ACCOUNT123',suspected:'SUSPECT123',injurydetail:'INJURY123',paindetail:'PAIN123',neuro:'NEURO123',baseline:'BASE123',limbdetail:'LIMB123',walkingdetail:'WALK123',mednotes:'MED123',cause:'CAUSE123',actions:'ACTION123',transfer:'TRANSFER123',treatment:'TREAT123',otheractions:'OTHER123',visual:'MONITOR123',investigations:'SAMPLE123',gpadvice:'GP123',nokadvice:'NOK123',notificationdetail:'NOTICE123',transferdetail:'HOSP123',prevention:'PREVENT123',followup:'FOLLOW123',reassessment:'LATER123'};
 const output=all(draft(input));for(const [k,v] of Object.entries(input)){if(v.endsWith('123'))assert.ok(output.includes(v),k);}
});
test('reassessment without change does not invent deterioration',()=>{
 const d=draft({...empty,reassessment:'14:00 — no change from initial assessment.'});
 assert.match(d.nok,/14:00 — no change/);assert.doesNotMatch(d.nok,/changes requiring|deteriorat/i);
});
test('warnings and placeholders never enter document text',()=>{
 const d=draft({});assert.doesNotMatch(all(d),/not specified|not recorded|not entered|confirm.*before copy|\*\*|\[TODO\]/i);
});
test('AI validator rejects unsupported findings, omission, numeric punctuation change, and chronology reversal',()=>{
 const d=draft({...example,gcs:'13/15',reassessment:'18:00 reassessment: GCS 12/15.'});
 assert.equal(validateAI(d,d),true);
 for(const c of [{...d,gp:d.gp+' No fracture.'},{...d,ecase:d.ecase.replace('GCS 13/15.','')},{...d,gp:d.gp.replace('13/15','13.15')},{...d,ecase:d.ecase.replace('ASSESSMENT:','EXAMINATION:')},{...d,gp:d.gp.replace('GCS 13/15.','GCS 12/15.') }])assert.equal(validateAI(c,d),false);
 assert.equal(validateAI({...d,extra:'unsupported'},d),false);
});
test('AI may use equivalent clinical wording without changing facts',()=>{
 const d=draft({...example});assert.equal(validateAI({...d,gp:d.gp.replace('Neurological observations','Neuro obs')},d),true);
});
test('API: authentication, origin, body size and field validation enforced',async()=>{
 assert.equal((await handleGenerate(req({}),{},false)).status,401);
 const cross=new Request('https://afterfall.test/api/generate',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://evil.test'},body:'{}'});
 assert.equal((await handleGenerate(cross,{},true)).status,403);
 assert.equal((await handleGenerate(req({unapproved:'x'}),{},true)).status,400);
 assert.equal((await handleGenerate(req({account:'x'.repeat(100001)}),{},true)).status,413);
 assert.equal(validData({gp:42}),false);
});
test('API: absent key uses deterministic fallback without upstream request',async()=>{
 const r=await handleGenerate(req(example),{},true,async()=>{throw Error('must not call');});
 const body=await r.json();assert.equal(body.mode,'template');assert.deepEqual(body.documents,draft(example));
 assert.equal(r.headers.get('cache-control'),'no-store');
});
test('API: mocked valid response accepted; sensitive requests not stored',async()=>{
 const d=draft(example);let requestBody;
 const send=async(url,options)=>{assert.equal(url,'https://api.openai.com/v1/responses');requestBody=JSON.parse(options.body);return Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(incidentProviderResult(d,options))}]}]});};
 const body=await (await handleGenerate(req(example),{key:'synthetic-test-secret'},true,send)).json();
 assert.equal(body.mode,'ai');assert.equal(requestBody.store,false);assert.ok(requestBody.text.format.strict);
 assert.doesNotMatch(JSON.stringify(body),/synthetic-test-secret/);
});
test('API: unsafe, malformed, refused, failed and timed-out results fall back',async()=>{
 for(const send of [async()=>Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({...draft(example),gp:'GCS 15. No fracture.'})}]}]}),async()=>Response.json({status:'completed',output:[]}),async()=>Response.json({status:'incomplete'}),async()=>new Response('rejected',{status:401}),async()=>{throw Error('timeout synthetic-test-secret');}]){
 const body=await (await handleGenerate(req(example),{key:'synthetic-test-secret'},true,send)).json();
 assert.equal(body.mode,'template');assert.deepEqual(body.documents,draft(example));assert.doesNotMatch(JSON.stringify(body),/synthetic-test-secret/);
 }
});
test('client has no resident persistence or key handling; edits reset copy verification',async()=>{
 const ui=await readFile(new URL('../components/AfterFall.tsx',import.meta.url),'utf8');
 assert.doesNotMatch(ui,/localStorage|sessionStorage|indexedDB|Bearer |sk-proj-/);
 assert.match(ui,/setEdited\(p=>new Set/);assert.match(ui,/setVerified\(false\)/);
 assert.match(ui,/revision.current !== snapshot/);assert.match(ui,/if \(dirty\)/);
});
