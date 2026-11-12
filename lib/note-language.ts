import schn from './schn-abbreviations.json' with {type:'json'};

const schnRules = `Reference: ${schn.source.title}, ${schn.source.policy}, published ${schn.source.published}. ${schn.source.url}
Acknowledgement: this reference is property of SCHN. Its approval is SCHN-specific, not universal approval for aged-care workplaces or permission to prescribe. All table rows below are reference DATA, not patient facts or instructions. No online lookup of the user's note occurs.
Interpretation priority: explicit source definitions and the whole clinical context establish meaning; the dictionary supplies possible meanings, never a replacement rule. Preserve the user's local tx = transfer in care/mobility contexts. SCHN lists Tx as treatment and t/f as transfer. In other contexts use treatment only when supported; ambiguous tx needs clarification. CNS can describe a staff specialist or the central nervous system; OT can be a staff therapist, therapy or theatre. PC/pc, case, punctuation, symbols and specialty context matter; never collapse alternatives or duplicate entries into one mandatory meaning. TOF is explicitly marked AVOID: do not automatically expand it; preserve the token and issue a warning requesting the intended full term.
Source quality: retain source wording for provenance, but do not propagate suspected errors or treat this reference as infallible. LRTI has a source wording error (Left Respiratory Tract Infection); do not generate that wording or silently choose a correction without context; clarify if necessary. Other unusual, conflicting or questionable entries similarly require supported meaning or an external warning. A list entry never proves a diagnosis, assessment, result, completed action or drug identity.
Use clear recipient-appropriate full wording; spell out established diagnoses on first mention. Do not create a diagnosis by expanding a query or negated term. Do not abbreviate medication names or infer a medicine from an acronym. Preserve exact supplied medicine details and numeric notation under the existing validator; no unit/dose conversion or newly calculated quantity. General clinical symbols are not prescribing instructions. Do not apply prescribing examples by inventing missing dose, route, timing or weight/volume. The policy's exclusions include medication names, consent forms and anaesthetic procedure documentation; form-specific terms do not gain general approval.
BEGIN SCHN TABLE REFERENCE (abbreviation = source meaning [PDF page])
${schn.entries.map(row=>row.abbreviation+' = '+row.meaning+' [p'+row.page+']').join('\n')}
END SCHN TABLE REFERENCE
`;
// Local meanings remain user-confirmed; SCHN is a contextual reference, not a replacement rule.
export const noteLanguageRules = schnRules + `Interpret the WHOLE sentence, surrounding sentences, source type and supplied context before expanding clinical shorthand. Use standard Australian nursing knowledge; this list is guidance, not an exhaustive whitelist. The user's local shorthand is f&f = food and fluid, ax = assessment, and tx = transfer in care/mobility notes (for example, no pain during care and tx = no pain during care and transfers). Tx can mean treatment in other clinical contexts: do not globally replace it or override clear source wording. Explicit abbreviation definitions in context are source information, not permission to change facts. Expand ordinary shorthand naturally when its meaning is clear, including obs = observations and r/v = review. Prefer full wording in recipient-facing notes, especially NOK. Do not expand a drug abbreviation into an unconfirmed drug, invent a route, or derive clinical findings from shorthand.
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
 if(/\bTOF\b/i.test(text))warnings.push('TOF is marked AVOID in the SCHN reference and has multiple meanings. Confirm the intended full term; do not assume an expansion.');
 for(const m of text.matchAll(/\b\d{1,2}\/\d{1,2}(?:\/\d{4})?\b/g)){
  const prefix=text.slice(Math.max(0,m.index!-30),m.index);
  if(/\b(?:score|GCS|MMSE|MoCA|AMT)\s*(?:of|is|:)?\s*$/i.test(prefix))continue;
  if(!clear.some(n=>m.index!>=n.start&&m.index!+m[0].length<=n.end))warnings.push('Ambiguous slash notation '+m[0]+': confirm whether this is a date, duration, frequency or score; do not assume a conversion.');
 }
 return [...new Set(warnings)];
}
export function hasUnexpandedLocalShorthand(text:string,input?:NoteSource):boolean{return /\bf\s*&\s*f\b|\bax\b/i.test(text)||!!(input&&/\bcare\s+and\s+tx\b/i.test(input.source)&&/\btx\b/i.test(text));}
