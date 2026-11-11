import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname,resolve } from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const suites=readdirSync(resolve(root,'tests')).filter(f=>f.endsWith('.test.mjs')).sort();
if(!suites.length){console.error('No executable .test.mjs suites found');process.exit(1);}
console.log(`Running all ${suites.length} top-level .test.mjs suites`);
const r=spawnSync(process.execPath,['--test',...suites.map(f=>resolve(root,'tests',f))],{stdio:'inherit',cwd:root});
if(r.error)console.error('Test runner failed to start');
process.exit(r.error||r.status===null?1:r.status);
