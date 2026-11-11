import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const app=await readFile(new URL('../app.js',import.meta.url),'utf8');const srv=await readFile(new URL('../server.mjs',import.meta.url),'utf8');
test('six questionnaire sections retained',()=>{for(const id of ['incident','assessment','mobility','actions','notifications','followup'])assert.ok(app.includes("['"+id+"'"))});
test('four outputs including four RiskMan text fields',()=>{for(const key of ['summary','details','actions','investigation','ecase','gp','nok'])assert.ok(app.includes(key))});
test('eCase fixed headings',()=>{for(const head of ['TIME OF INCIDENT:','PLACE OF INCIDENT:','SITUATION:','BACKGROUND:','ASSESSMENT:','RECOMMENDATIONS / RESULT:'])assert.ok(app.includes(head)&&srv.includes(head))});
test('no browser persisted resident data',()=>assert.doesNotMatch(app,/localStorage|sessionStorage|indexedDB/));
test('API key remains server-side',()=>{assert.doesNotMatch(app,/OPENAI_API_KEY/);assert.match(srv,/process\.env\.OPENAI_API_KEY/)});
test('GCS requires entered value',()=>assert.match(app,/if\(has\('gcs'\)\)/));
test('copy completed claims requires confirmation',()=>assert.match(app,/confirmedFollow\(\)&&!sessionConfirmed/));
