import {keys,headings,type Docs,type DocKey} from './drafts.ts';
import {noteOutputNumericTokens} from './note-language.ts';
import type {Pathway} from './incident.ts';
export type IncidentRewrite={documents:Docs;warnings:string[];references:Array<{field:DocKey;source:string;draft:string}>};
export const warningList=(v:unknown):v is string[]=>Array.isArray(v)&&v.length<=20&&v.every(w=>typeof w==='string'&&w.trim().length>0&&w.length<=600);
export function validIncidentRewrite(p:Pathway,value:unknown,canonical:Docs):value is Docs{
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 const d=value as Docs;
 if(Object.keys(d).sort().join(',')!==[...keys].sort().join(','))return false;
 if(!keys.every(k=>typeof d[k]==='string'&&(!canonical[k].trim()||d[k].trim().length>0)&&d[k].length<=20000))return false;
 if(keys.reduce((n,k)=>n+d[k].length,0)>90000)return false;
 for(const k of keys){
  const allowed:string[]=canonical[k].match(/\d+(?:[.:/%-]\d+)*[%°]?/g)||[];
  if(!noteOutputNumericTokens(d[k],{source:canonical[k],context:''}).every(n=>allowed.includes(n)))return false;
 }
 if(p==='fall'&&!headings.every((h,i)=>d.ecase.split(h+':').length===2&&(i===0||d.ecase.indexOf(headings[i-1]+':')<d.ecase.indexOf(h+':'))))return false;
 return true;
}
export function validIncidentCandidate(p:Pathway,value:unknown,canonical:Docs,incident:Record<string,string>):value is IncidentRewrite{
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 const v=value as IncidentRewrite;
 if(Object.keys(v).sort().join(',')!=='documents,references,warnings'||!validIncidentRewrite(p,v.documents,canonical)||!warningList(v.warnings)||!Array.isArray(v.references)||v.references.length<1||v.references.length>100)return false;
 const original=Object.values(incident);
 return keys.filter(k=>v.documents[k].trim()).every(k=>v.references.some(r=>r.field===k))&&v.references.every(r=>r&&Object.keys(r).sort().join(',')==='draft,field,source'&&keys.includes(r.field)&&typeof r.source==='string'&&r.source.trim().length>0&&r.source.length<=2000&&(canonical[r.field].includes(r.source)||original.some(text=>text.includes(r.source)))&&typeof r.draft==='string'&&r.draft.trim().length>0&&r.draft.length<=2000&&v.documents[r.field].includes(r.draft));
}
// Client response gate: only a server-reviewed rewrite can use the broader prose contract.
export function reviewedIncidentDocuments(p:Pathway,result:{reviewed?:unknown;rewriteFailed?:unknown;mode?:unknown;documents?:unknown},canonical:Docs):Docs|null{
 return result.reviewed===true&&result.mode==='ai'&&result.rewriteFailed!==true&&validIncidentRewrite(p,result.documents,canonical)?result.documents:null;
}
