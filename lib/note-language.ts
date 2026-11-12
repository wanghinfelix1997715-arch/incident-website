// Local meanings are user-confirmed. Medicines terminology guidance is linked in docs/note-generator.md.
export const noteLanguageRules = `Interpret the WHOLE sentence, surrounding sentences, source type and supplied context before expanding clinical shorthand. Use standard Australian nursing knowledge; this list is guidance, not an exhaustive whitelist. The user's local shorthand is f&f = food and fluid, ax = assessment, and tx = transfer in care/mobility notes (for example, no pain during care and tx = no pain during care and transfers). Tx can mean treatment in other clinical contexts: do not globally replace it or override clear source wording. Explicit abbreviation definitions in context are source information, not permission to change facts. Expand ordinary shorthand naturally when its meaning is clear, including obs = observations and r/v = review. Prefer full wording in recipient-facing notes, especially NOK. Do not expand a drug abbreviation into an unconfirmed drug, invent a route, or derive clinical findings from shorthand.
Slash notation is contextual, not universal: every 3/12 means every 3 months; in 3/12 means in 3 months; for 3/12 means for 3 months. On 9/11 is an Australian day/month date: on 9 November. Never invent a year. Three-monthly recurrence is different from one review in 3 months. An isolated review 3/12 may be an interval or a date: retain the ambiguous token, include an external warning, and do not guess. Preserve scores such as 9/11, BP 120/80 and other clinical ratios. Use only a conversion clearly supported by the actual sentence or explicit source definitions.
Write natural, concise Australian clinical prose, not a rigid word-by-word transcription. Correct spelling, expand clear shorthand, combine related facts and remove repetition without losing distinct findings, source attribution, timing, uncertainty or status. Deduplication of observations within range is permitted when it describes the same assessment; separate timed assessments must stay separate. Avoid robotic labels and repeated sentence fragments in paragraph notes. Preserve distinctions such as no pain reported versus no pain observed. Do not add remained, continued monitoring, stable, normal or other facts unless supported.
Synthetic style example: Source: Post fall day 3 Resident S pain free settled. Obs within range. No pain observed or reported during care and tx. Tolerates f&f well. Obs within range as recorded. Desired wording: On post-fall day 3, Resident S was settled and pain-free, with no pain observed or reported during care or transfers. Food and fluid intake was well tolerated. Observations were within range as recorded. This is a style example, not facts to copy into other notes.
The independent reviewer must permit faithful abbreviation expansion, grammatical restructuring and deduplication; these are not omissions when the same meaning is retained. Reject wrong expansion, ambiguous shorthand silently resolved, date/duration swaps, changed frequency, invented findings and loss of distinct assessments.`;
type NoteSource={source:string;context:string};
type Notation={token:string;start:number;end:number;numeric:string;kind:'duration'|'date';month?:number;year?:string};
function clearNotation(text:string):Notation[]{
 const out:Notation[]=[];
 const duration=/\b(?:every|in|for|after|within|over|duration of|interval of)\s+(\d{1,2})\/12\b/gi;
 for(const m of text.matchAll(duration)){
  if(Number(m[1])<1)continue;
  const start=m.index!+m[0].lastIndexOf(m[1]+'/12');out.push({token:m[1]+'/12',start,end:start+m[1].length+3,numeric:m[1],kind:'duration'});
 }
 const date=/\b(?:on|dated|date of|since|until)\s+([0-3]?\d)\/(0?[1-9]|1[0-2])(?:\/(\d{4}))?\b/gi;
 for(const m of text.matchAll(date)){
  const day=Number(m[1]),month=Number(m[2]);
  const limit=[31,29,31,30,31,30,31,31,30,31,30,31][month-1];
  if(day<1||day>limit)continue;
  const token=m[1]+'/'+m[2]+(m[3]?'/'+m[3]:'');const start=m.index!+m[0].lastIndexOf(token);
  out.push({token,start,end:start+token.length,numeric:String(day),kind:'date',month,year:m[3]});
 }
 return out;
}
export function noteOutputNumericTokens(output:string,input:NoteSource):string[]{
 let text=output;
 const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
 for(const n of clearNotation(input.source+'\n'+input.context)){
  if(n.kind==='duration'){
   const pattern=new RegExp('\\b'+Number(n.numeric)+'[ \\-]+(?:months?|monthly)\\b','gi');
   text=text.replace(pattern,n.token);
  }else{
   const month=months[n.month!-1];
   const pattern=new RegExp('\\b0?'+Number(n.numeric)+'\\s+(?:'+month+'|'+month.slice(0,3)+')'+(n.year?'(?:\\s+'+n.year+')?':'')+'\\b','gi');
   text=text.replace(pattern,n.token);
  }
 }
 return text.match(/\d+(?:[.:/%-]\d+)*[%°]?/g)||[];
}
export function noteLanguageWarnings(input:NoteSource):string[]{
 const text=input.source+'\n'+input.context,clear=clearNotation(text),warnings:string[]=[];
 for(const m of text.matchAll(/\b\d{1,2}\/\d{1,2}(?:\/\d{4})?\b/g)){
  const prefix=text.slice(Math.max(0,m.index!-30),m.index);
  if(/\b(?:score|GCS|MMSE|MoCA|AMT)\s*(?:of|is|:)?\s*$/i.test(prefix))continue;
  if(!clear.some(n=>m.index!>=n.start&&m.index!+m[0].length<=n.end))warnings.push('Ambiguous slash notation '+m[0]+': confirm whether this is a date, duration, frequency or score; do not assume a conversion.');
 }
 return [...new Set(warnings)];
}
export function hasUnexpandedLocalShorthand(text:string,input?:NoteSource):boolean{return /\bf\s*&\s*f\b|\bax\b/i.test(text)||!!(input&&/\bcare\s+and\s+tx\b/i.test(input.source)&&/\btx\b/i.test(text));}
