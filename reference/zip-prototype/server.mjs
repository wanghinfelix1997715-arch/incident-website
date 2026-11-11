import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.dirname(fileURLToPath(import.meta.url));
const port=Number(process.env.PORT||4173);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
const max=100000;
const server=http.createServer(async(req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 if(pathname==='/api/generate'&&req.method==='POST'){
  let raw='';for await(const c of req){raw+=c;if(raw.length>max){res.writeHead(413).end('Payload too large');return;}}
  let parsed;try{parsed=JSON.parse(raw)}catch{res.writeHead(400).end('Invalid JSON');return}
  if(!process.env.OPENAI_API_KEY){res.writeHead(503,{'Content-Type':'application/json'}).end(JSON.stringify({error:'AI is not configured. Offline templates remain available.'}));return}
  const system=`You are an Australian residential aged-care RN documentation writing assistant. Rewrite ONLY the documented facts from the supplied structured questionnaire into four independent documentation outputs. Never invent findings, examinations, actions, diagnoses, dates, completed notifications or review. No unchecked/unknown facts should be asserted as normal. Preserve uncertainty, resident-reported statements, and time sequence. Suspected is not confirmed; symptoms absent is not injury excluded; neuro obs commenced does not imply normal observations. Additional recommendations only if user documented as recommended/planned. Return JSON object ONLY with keys summary,details,actions,investigation,ecase,gp,nok. RiskMan actions must be complete and investigation may repeat key information while expanding relevant documented contributing factors. eCase MUST contain the exact headings TIME OF INCIDENT:, PLACE OF INCIDENT:, SITUATION:, BACKGROUND:, ASSESSMENT:, RECOMMENDATIONS / RESULT: in order. GP is very concise, clinically focused. NOK is family-friendly, brief and accurate. No bracketed notes, warnings, placeholders, to-dos or explanatory metadata in document text. Never include clinical identifying information beyond what user provided. Keep notification completion exactly as selected and confirmed in questionnaire.`;
  try{
   const response=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4.1-mini',temperature:0.2,response_format:{type:'json_object'},messages:[{role:'system',content:system},{role:'user',content:JSON.stringify(parsed)}]})});
   const body=await response.json();if(!response.ok)throw Error(body.error?.message||`HTTP ${response.status}`);
   const value=JSON.parse(body.choices?.[0]?.message?.content||'{}');const fields=['summary','details','actions','investigation','ecase','gp','nok'];if(fields.some(k=>typeof value[k]!=='string'))throw Error('AI returned incomplete document fields');
   const headings=['TIME OF INCIDENT:','PLACE OF INCIDENT:','SITUATION:','BACKGROUND:','ASSESSMENT:','RECOMMENDATIONS / RESULT:'];let last=-1;for(const h of headings){const pos=value.ecase.indexOf(h);if(pos<=last)throw Error('eCase section format failed validation');last=pos}
   res.writeHead(200,{'Content-Type':'application/json'}).end(JSON.stringify({documents:value}));
  }catch(err){res.writeHead(502,{'Content-Type':'application/json'}).end(JSON.stringify({error:'AI generation unsuccessful; use offline drafts and review manually.',detail:String(err.message).slice(0,180)}))}return;
 }
 if(req.method!=='GET'){res.writeHead(405).end();return}
 const file=pathname==='/'?'index.html':pathname.slice(1);
 if(!['index.html','app.js','styles.css'].includes(file)){res.writeHead(404).end('Not found');return}
 try{const buf=await readFile(path.join(root,file));res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'text/plain','Content-Security-Policy':"default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'none'"}).end(buf)}catch{res.writeHead(404).end('Not found')}
});server.listen(port,()=>console.log(`PostFall V1 running on http://localhost:${port}`));
