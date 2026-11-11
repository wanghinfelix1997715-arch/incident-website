import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync,writeFileSync,rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
const script=new URL('../scripts/check-repository.mjs',import.meta.url);
function fixture(fn){const root=mkdtempSync(join(tmpdir(),'repo-contract-'));try{writeFileSync(join(root,'AGENTS.md'),'# Rules\n');writeFileSync(join(root,'README.md'),'# Readme\n');fn(root);}finally{rmSync(root,{recursive:true,force:true});}}
const run=root=>spawnSync(process.execPath,[script.pathname,'--root',root],{encoding:'utf8'});
test('repository gate clean control passes the actual CLI',()=>fixture(root=>{assert.equal(run(root).status,0);}));
test('repository gate blocks an actual broken document link',()=>fixture(root=>{writeFileSync(join(root,'README.md'),'[Required](missing.md)');const r=run(root);assert.equal(r.status,1);assert.match(r.stderr,/Missing local link/);}));
test('repository gate cannot treat missing root instructions as success',()=>fixture(root=>{rmSync(join(root,'AGENTS.md'));assert.equal(run(root).status,1);}));
