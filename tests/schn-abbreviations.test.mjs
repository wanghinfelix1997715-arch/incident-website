import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {noteLanguageRules,noteLanguageWarnings} from '../lib/note-language.ts';
import {handleNote} from '../lib/note-generator.ts';
const reference=JSON.parse(readFileSync(new URL('../lib/schn-abbreviations.json',import.meta.url),'utf8'));
test('every SCHN table row and provenance reaches the shared prompt, including alternatives',()=>{
 assert.equal(reference.entries.length,714);
 assert.deepEqual([...new Set(reference.entries.map(r=>r.page))],Array.from({length:15},(_,i)=>i+7));
 for(const row of reference.entries)assert.ok(noteLanguageRules.includes(row.abbreviation+' = '+row.meaning),row.abbreviation);
 assert.match(noteLanguageRules,/2016-9005 v3\.2/);
 assert.match(noteLanguageRules,/2025-09-05/);
 assert.match(noteLanguageRules,/property of SCHN/);
 assert.match(noteLanguageRules,/not universal approval/i);
});
test('reference conflicts and unsafe entries require context, not dictionary substitution',()=>{
 assert.match(noteLanguageRules,/Tx = Treatment/);
 assert.match(noteLanguageRules,/t\/f or T\/F = Transfer/);
 assert.match(noteLanguageRules,/local.*transfer/i);
 assert.match(noteLanguageRules,/TOF.*do not.*expand/i);
 assert.match(noteLanguageRules,/CNS.*staff.*nervous/is);
 assert.match(noteLanguageRules,/LRTI.*source.*error/is);
 assert.ok(noteLanguageWarnings({source:'TOF noted.',context:''}).some(w=>/TOF/.test(w)));
});
test('actual note handler supplies the complete SCHN reference to writer and independent reviewer',async()=>{
 const source='Resident S awaiting MSU collection. No SOB reported.';
 const text='Resident S is awaiting collection of a mid-stream urine specimen. No shortness of breath was reported.';
 const prompts=[];
 const send=async(url,opts)=>{
  const b=JSON.parse(opts.body);prompts.push(b.instructions);
  return Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(prompts.length===1?{text,warnings:[],references:[{source,draft:text}]}:{approved:true,issues:[]})}]}]});
 };
 const response=await handleNote(new Request('https://afterfall.test/api/notes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({source,context:'',target:'ecase',sourceType:'Rough notes',communicationStatus:'Unknown'})}),{key:'synthetic'},true,send);
 assert.equal(response.status,200);assert.equal(prompts.length,2);
 for(const p of prompts)for(const row of reference.entries)assert.ok(p.includes(row.abbreviation+' = '+row.meaning));
});
