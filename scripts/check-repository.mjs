import { readdir, readFile, access } from 'node:fs/promises';
import { resolve, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// Structural gate only. It cannot certify application, clinical or visual behavior.
export async function checkRepository(root) {
 root=resolve(root);await access(resolve(root,'AGENTS.md'));await access(resolve(root,'README.md'));
 const ignored=new Set(['.git','node_modules','dist','.next','.vinext','.sites-runtime','.wrangler','coverage']);
 let documents=0,links=0;
 async function walk(dir) {
  for(const entry of await readdir(dir,{withFileTypes:true})) {
   const path=resolve(dir,entry.name);
   if(entry.isDirectory()){if(!ignored.has(entry.name))await walk(path);continue;}
   if(!entry.name.endsWith('.md'))continue;
   documents++;
   const content=await readFile(path,'utf8');
   for(const m of content.matchAll(/\[[^\]\n]+\]\(([^)]+)\)/g)) {
    const target=m[1];if(/^(https?:|mailto:|#)/.test(target))continue;
    const location=resolve(dirname(path),target.split('#')[0]);
    const rel=relative(root,location);
    if(rel==='..'||rel.startsWith('..'+sep))throw new Error('Local link escapes repository in '+relative(root,path));
    try{await access(location);}catch{throw new Error('Missing local link target in '+relative(root,path)+': '+target);}
    links++;
   }
  }
 }
 await walk(root);return {documents,links};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
 const i=process.argv.indexOf('--root');const root=i>=0?process.argv[i+1]:resolve(dirname(fileURLToPath(import.meta.url)),'..');
 try{const r=await checkRepository(root);console.log(`Repository structure passed: ${r.documents} Markdown files, ${r.links} local links. Application behavior not certified.`);}
 catch(e){console.error('Repository structure failed: '+e.message);process.exitCode=1;}
}
