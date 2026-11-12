import schn from './schn-abbreviations.json' with {type:'json'};

const schnRules = `Reference: ${schn.source.title}, ${schn.source.policy}, published ${schn.source.published}. ${schn.source.url}
Acknowledgement: this reference is property of SCHN. Its approval is SCHN-specific, not universal approval for aged-care workplaces or permission to prescribe. All table rows below are reference DATA, not patient facts or instructions. No online lookup of the user's note occurs.
Interpretation priority: use the whole sentence and explicit source definitions; reference entries are possible meanings, not patient facts. The current user-confirmed project meanings take precedence over alternative dictionary entries: tx = treatment; t/f = transfer; CNS = central nervous system; OT = occupational therapist; f&f = food and fluid; ax = assessment. The prior tx-transfer rule is superseded: never interpret tx as transfer merely because it appears in a care/mobility note. Do not switch CNS or OT to the reference's alternative staff/theatre meanings. If the actual source explicitly conflicts with a project meaning, preserve the conflict and ask for clarification in an external warning rather than silently changing it. PC/pc and PEP still require clinical context; case, punctuation, symbols and specialty matter. TOF is explicitly marked AVOID: do not automatically expand it when unresolved; preserve it and request the intended full term.
Source quality: retain source wording for provenance, but do not propagate suspected errors or treat this reference as infallible. LRTI has a source wording error (Left Respiratory Tract Infection); do not generate that wording or silently choose a correction without context; clarify if necessary. Other unusual, conflicting or questionable entries similarly require supported meaning or an external warning. A list entry never proves a diagnosis, assessment, result, completed action or drug identity.
Use clear recipient-appropriate wording; established familiar clinical abbreviations are allowed, including a diagnosis abbreviation already supplied with clear meaning. Explain unfamiliar terms for the recipient, especially NOK. Do not create a diagnosis by expanding a query or negated term. Do not abbreviate medication names or infer a medicine from an acronym. Preserve exact supplied medicine details and numeric notation under the existing validator; no unit/dose conversion or newly calculated quantity. General clinical symbols are not prescribing instructions. Do not apply prescribing examples by inventing missing dose, route, timing or weight/volume. The policy's exclusions include medication names, consent forms and anaesthetic procedure documentation; form-specific terms do not gain general approval.
BEGIN SCHN TABLE REFERENCE (abbreviation = source meaning [PDF page])
${schn.entries.map(row=>row.abbreviation+' = '+row.meaning+' [p'+row.page+']').join('\n')}
END SCHN TABLE REFERENCE
`;
// Local meanings remain user-confirmed; SCHN is a contextual reference, not a replacement rule.
export const noteLanguageRules = schnRules + `Shared CareNote language policy: correct clear spelling and grammar, optimise sentence flow and remove repetition without changing facts, attribution, uncertainty, chronology or action status. Common site shorthand lt = left and rt = right only in clear anatomical contexts; never confuse these with units or specialty abbreviations. Correct obvious typos such as supne to supine, temporpray to temporary and modate to moderate where the meaning is established. Preserve measurements and familiar units. Do not guess a drug or dressing product, substitute a product or silently reclassify a wound. Preserve direct quotations or paraphrase them explicitly as reported speech; never invent a corrected direct quote. Conflicting times, a resident's account versus an unknown mechanism, and existing versus new injuries must remain distinct with external warnings rather than silently reconciled.
Read the WHOLE sentence, surrounding sentences, source type and context. For clinical eCase/GP/Pharmacy notes, retain familiar established abbreviations when clear and appropriate; do not impose a blanket ban on alphabetic abbreviations or mechanically expand every token. Preserve measurement units such as mg, mL, cm and exact supplied values. Use plain language and expand clinical jargon for NOK; choose wording relevant to Manager. Improve clarity and flow without turning a familiar abbreviation into a validation failure. The project meanings are tx = treatment; t/f = transfer; CNS = central nervous system; OT = occupational therapist; f&f = food and fluid; ax = assessment. An explicit conflicting source definition needs an external clarification warning, not a silent assumption. Do not infer a medication identity, route, diagnosis, finding or action from a reference entry.
Numeric shorthand is allowed in the output: preserve clear notation such as in 3/12, within 2/7, every 6/52 and on 9/11. Inputs normally include in/on/within/every or another clear cue; do not manufacture ambiguity merely because a slash occurs. In/within/every/for + N/12 means months, N/7 days and N/52 weeks; distinguish a single review, deadline, duration and recurrence. On + valid day/month is an Australian date, not an interval. Retaining the original numeric notation is preferred when clear; supported named-month or month-interval expansions remain permitted. Never invent a year or change a frequency. Alert only for a real unresolved meaning or conflicting cue, such as isolated review 3/12 or in 9/11 without explanation. Preserve BP ratios and labelled scores; do not flag them as dates or intervals.

Write natural, concise Australian clinical prose, not a rigid word-by-word transcription. Correct spelling, expand shorthand when it helps the recipient, combine related facts and remove repetition without losing distinct findings, source attribution, timing, uncertainty or status. Deduplication of observations within range is permitted when it describes the same assessment; separate timed assessments must stay separate. Avoid robotic labels and repeated sentence fragments in paragraph notes. Preserve distinctions such as no pain reported versus no pain observed. Do not add remained, continued monitoring, stable, normal or other facts unless supported.
Synthetic style example: Source: Post fall day 3 Resident S pain free settled. Obs within range. No pain observed or reported during care and t/f. Tolerates f&f well. Obs within range as recorded. Desired wording: On post-fall day 3, Resident S was settled and pain-free, with no pain observed or reported during care or transfers. Food and fluid intake was well tolerated. Observations were within range as recorded. This is a style example, not facts to copy into other notes.
The independent reviewer must permit both clear familiar-abbreviation retention and faithful expansion, grammatical restructuring and deduplication; these are not omissions when the same meaning is retained. Reject wrong expansion, ambiguous shorthand silently resolved, date/duration swaps, changed frequency, invented findings and loss of distinct assessments.`;
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
 const clearIntervals=[...text.matchAll(/\b(?:every|in|for|after|within|over)\s+(\d{1,2})\/(?:7|52|24|60)\b/gi)].filter(m=>Number(m[1])>0);
 if(/\bTOF\b/i.test(text))warnings.push('TOF is marked AVOID in the SCHN reference and has multiple meanings. Confirm the intended full term; do not assume an expansion.');
 for(const m of text.matchAll(/\b\d{1,2}\/\d{1,2}(?:\/\d{4})?\b/g)){
  const prefix=text.slice(Math.max(0,m.index!-30),m.index);
  if(/\b(?:score|GCS|MMSE|MoCA|AMT|BP|blood pressure)\s*(?:of|is|:)?\s*$/i.test(prefix))continue;
  if(!clear.some(n=>m.index!>=n.start&&m.index!+m[0].length<=n.end)&&!clearIntervals.some(n=>m.index!>=n.index!&&m.index!+m[0].length<=n.index!+n[0].length))warnings.push('Ambiguous slash notation '+m[0]+': confirm whether this is a date, duration, frequency or score; do not assume a conversion.');
 }
 return [...new Set([...warnings,...clinicalLanguageWarnings(input)])];
}

// Textual review alerts, not diagnoses or automatic corrections. No clinical payload is logged.
export function clinicalLanguageWarnings(input:NoteSource):string[]{
 const text=input.source+'\n'+input.context,out:string[]=[];
 const marked=text.match(/\b(?:incident time|event time|time)\s*:\s*(\d{1,2}):(\d{2})\b/i);
 const first=text.match(/\b(?:at|time[: ]+)\s*(\d{1,2}):(\d{2})\b/i);
 const clock=marked||first;
 const event=clock?[Number(clock[1])*60+Number(clock[2])]:[];
 const found=[...text.matchAll(/\bfound\b[^.\n]{0,160}?\b(?:at\s+)?(?:(\d{1,2}):(\d{2})\b|(\d{1,2})(\d{2})\s*(?:hours|hrs|h)\b)/gi)].map(m=>Number(m[1]||m[3])*60+Number(m[2]||m[4]));
 if(event.length&&found.some(t=>!event.includes(t)))out.push('Clarify the recorded incident and discovery times; keep both source times until confirmed. Do not silently choose one.');
 if(/abrasion/i.test(text)&&/fat(?:\s+layer)?\s+(?:exposed|visible)|exposed\s+(?:fat|adipose)/i.test(text))out.push('Review the recorded wound terminology alongside the description of exposed fat. Preserve the description; do not automatically reclassify the wound.');
 if(/pre[ -]?existing|old\s+(?:skin tear|wound|dressing)/i.test(text)&&/abrasion|new\s+(?:skin tear|wound)/i.test(text))out.push('Clarify existing versus new injuries and dressing sites. Do not merge them or assume they describe the same wound.');
 if(/(?:resident|patient)\s+(?:stated|reported|said)/i.test(text)&&/mechanism[^.\n]{0,40}unknown|certainty[^.\n]{0,20}unknown/i.test(text))out.push('Retain the resident-reported account separately from the unconfirmed or unwitnessed mechanism.');
 return out;
}
