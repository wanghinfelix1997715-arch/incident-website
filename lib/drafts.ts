import { sections, type Data } from './assessment.ts';
export const keys = ['summary','details','actions','investigation','ecase','gp','nok'] as const;
export type DocKey = typeof keys[number];
export type Docs = Record<DocKey, string>;
export const headings = ['TIME OF INCIDENT','PLACE OF INCIDENT','SITUATION','BACKGROUND','ASSESSMENT','RECOMMENDATIONS / RESULT'] as const;
const text = (v?: string) => (v || '').trim();
const join = (...items: (string | undefined)[]) => items.filter(v => text(v)).map(v => text(v)).join(' ');
const para = (...items: (string | undefined)[]) => items.filter(v => text(v)).map(v => text(v)).join('\n\n');
function status(label: string, value: string | undefined, completed: string) {
  if (value === 'Completed') return completed;
  if (value === 'Pending') return label + ' pending.';
  if (value === 'Not completed') return label + ' not completed.';
  if (value === 'Not indicated') return label + ' recorded as not indicated.';
  return '';
}
export function draft(d: Data): Docs {
  const s = (key: string) => text(d[key]);
  const name = s('resident') || 'Resident';
  const intro = join(d.witness === 'Unwitnessed' ? 'Unwitnessed fall' : d.witness === 'Witnessed' ? 'Witnessed fall' : 'Fall', s('date') ? 'on ' + s('date') : '', s('place') ? 'at ' + s('place') : '', s('time') ? 'at ' + s('time') : '') + '.';
  const position = !s('position') || ['Not recorded','Unknown'].includes(s('position')) ? '' : 'Found ' + s('position').toLowerCase() + '.';
  const mechanism = s('mechanism') && s('mechanism') !== 'Not recorded' ? 'Recorded possible mechanism: ' + s('mechanism') + '.' : '';
  const circumstances = s('suspected') ? 'Suspected contributing circumstances: ' + s('suspected') : '';
  const certainty = ['Known','Suspected','Unknown'].includes(s('certainty')) ? 'Mechanism certainty: '+s('certainty').toLowerCase()+'.' : '';
  const narrative = join(intro, position, s('found'), mechanism, certainty, s('account'), circumstances);
  const head = d.head === 'Denied by resident' ? 'Resident denied head strike.' : d.head === 'Confirmed / witnessed' ? 'Head strike confirmed.' : d.head === 'Witnessed no strike' ? 'No head strike witnessed.' : d.head === 'Suspected' ? 'Head strike suspected.' : d.head === 'Unknown' ? 'Head strike status unknown.' : '';
  const loc = d.loc === 'No reported LOC' ? 'No loss of consciousness reported.' : d.loc === 'Yes' ? 'Loss of consciousness reported.' : '';
  const pain = d.pain === 'Denied' ? 'Resident denied pain or discomfort.' : d.pain === 'Reported' ? 'Pain reported.' : d.pain === 'Unable to assess' ? 'Unable to assess pain.' : '';
  const injury = d.injury === 'No injury identified' ? 'No injury identified on assessment.' : d.injury === 'Yes' ? 'Injury identified.' : d.injury === 'Uncertain' ? 'Injury status uncertain.' : '';
  const obs = [['BP', d.bp],['HR', d.hr],['RR', d.rr],['SpO₂', d.spo2],['Temperature', d.temp],['BGL',d.bgl]].filter(([,v]) => text(v)).map(([k,v])=>k+' '+text(v)).join(', ');
  const pupils = d.pupils === 'Normal' ? 'Pupils assessed as normal.' : d.pupils === 'Abnormal' ? 'Abnormal pupil findings documented.' : '';
  const cognition = d.cognition === 'At baseline' ? 'Cognition and neurological status at baseline.' : d.cognition === 'New change' ? 'New cognition or neurological change documented.' : '';
  const rom = d.rom === 'At baseline' ? 'ROM remained at baseline.' : d.rom === 'New restriction' ? 'New ROM restriction documented.' : '';
  const strength = d.strength === 'At baseline' ? 'Limb strength at baseline.' : d.strength === 'Pre-existing weakness unchanged' ? 'Pre-existing weakness unchanged.' : d.strength === 'New weakness' ? 'New limb weakness documented.' : '';
  const weight = d.weight === 'At baseline' ? 'Weight bearing at baseline.' : d.weight === 'Reduced' ? 'Reduced weight bearing post-fall.' : d.weight === 'Unable' ? 'Unable to weight bear post-fall.' : '';
  const walking = d.walking === 'Mobilised at baseline' ? 'Mobilised at baseline after the fall.' : d.walking === 'Reduced mobility' ? 'Reduced mobility after the fall.' : d.walking === 'Unable to weight bear' ? 'Unable to weight bear after the fall.' : d.walking === 'Not mobilised' ? 'Not mobilised after the fall.' : '';
  const mobilised = d.mobilised === 'Yes' ? 'Mobilised following the fall.' : d.mobilised === 'No' ? 'Did not mobilise following the fall.' : '';
  const assessment = join(head, loc, injury, s('injurydetail'), pain, s('paindetail'), s('gcs') ? 'GCS '+s('gcs')+'.' : '', pupils, cognition, s('neuro'), rom, strength, s('limbdetail'), weight, walking, mobilised, s('walkingdetail'), obs ? 'Initial observations: '+obs+'.' : '');
  const medication = join(d.anticoag === 'Yes' ? 'On anticoagulant therapy.' : d.anticoag === 'No' ? 'Not on anticoagulant therapy.' : '',d.antiplatelet === 'Yes' ? 'On antiplatelet therapy.' : d.antiplatelet === 'No' ? 'Not on antiplatelet therapy.' : '',s('mednotes'));
  const background = join(s('baseline'), medication, s('limbdetail'));
  const neuro = d.neuroobs === 'Commenced' ? 'Neurological observations commenced.' : d.neuroobs === 'Pending' ? 'Neurological observations pending.' : d.neuroobs === 'Not commenced' ? 'Neurological observations not commenced.' : '';
  const hospital = d.hospital === 'Yes' ? 'Hospital transfer documented.' : d.hospital === 'Pending' ? 'Hospital transfer pending.' : '';
  const notifications = join(status('GP notification',d.gp,'GP informed.'),status('NOK notification',d.nok,'NOK informed.'),status('FRAT review',d.frat,'FRAT reviewed and updated.'),s('gpadvice') ? 'GP advice: '+s('gpadvice') : '',s('nokadvice') ? 'NOK response: '+s('nokadvice') : '',s('notificationdetail'));
  const transfer = s('transfermethod') && d.transfermethod !== 'Not transferred' ? 'Assisted transfer: '+s('transfermethod').toLowerCase()+'.' : '';
  const actions = join(s('actions'), transfer, s('transfer'),s('treatment'),s('otheractions'),neuro,s('visual'),s('investigations'),hospital,s('transferdetail'));
  const reassessment = s('reassessment') ? 'Subsequent reassessment: '+s('reassessment') : '';
  const follow = join(s('prevention'),s('followup'));
  const investigation = para(join(narrative, s('cause') ? 'Possible contributing factors: '+s('cause') : ''),assessment,actions,notifications,follow,reassessment);
  const ecase = headings.map((h,i)=>h+':\n'+[join(s('date'),s('time')),s('place'),narrative,background,para(assessment,reassessment),para(actions,notifications,follow)][i]).join('\n\n');
  // Brief emails retain significant findings, uncertainty and later changes, rather than omit risk to save words.
  const gp = para('Dear Doctor,',name+' — '+intro,join(assessment,medication),reassessment,join(actions,s('gpadvice'),s('followup')),'Please review and advise if further management is required.','Kind regards,\nRN');
  const familyFindings = join(head.replace('Resident denied head strike.','They denied hitting their head.'),loc,injury,s('injurydetail'),pain.replace('Resident denied pain or discomfort.','They reported no pain or discomfort.'),s('paindetail'),cognition,strength,weight,walking,s('walkingdetail'));
  const nok = para('Dear Family,','I am writing to inform you that '+name+' had a fall'+(s('date')?' on '+s('date'):'')+(s('time')?' at approximately '+s('time'):'')+(s('place')?' at '+s('place'):'')+'.',familyFindings,reassessment,join(s('actions'),neuro,s('visual'),hospital,s('transferdetail'),s('nokadvice')),s('followup'),'Kind regards,\nRegistered Nurse');
  return {summary:intro,details:narrative,actions:para(assessment,actions,notifications,reassessment),investigation,ecase,gp,nok};
}
export function getWarnings(d: Data): string[] {
  const w: string[]=[];
  if(!text(d.time)) w.push('Incident time not recorded');
  if(!text(d.date)) w.push('Incident date not recorded');
  if(!text(d.place)) w.push('Location not recorded');
  if(!text(d.gcs)) w.push('GCS not entered; no normal GCS is assumed');
  if(!d.injury || ['Not assessed','Uncertain'].includes(d.injury)) w.push('Injury assessment not confirmed');
  if(!d.head || ['Not recorded','Unknown'].includes(d.head)) w.push('Head strike status not confirmed');
  if(!d.pain || d.pain==='Not assessed') w.push('Pain assessment not recorded');
  if(![d.bp,d.hr,d.rr,d.spo2,d.temp].some(text)) w.push('Initial vital signs not entered');
  if(d.head==='Confirmed / witnessed'||d.loc==='Yes'||d.strength==='New weakness'||d.cognition==='New change'||d.weight==='Unable'||d.walking==='Unable to weight bear') w.push('Risk findings entered: verify documented escalation against facility policy');
  if(d.anticoag==='Yes'||d.antiplatelet==='Yes') w.push('Anticoagulant / antiplatelet status recorded: verify escalation and medical advice');
  if([d.gp,d.nok,d.frat].includes('Completed')) w.push('Confirm GP/NOK/FRAT actions before copy');
  return w;
}
export function mergeDrafts(current: Partial<Docs>, next: Docs, edited: Set<string>): Docs {
  return Object.fromEntries(keys.map(k=>[k,edited.has(k)&&typeof current[k]==='string'?current[k]:next[k]])) as Docs;
}
export function validData(input: unknown): input is Data {
  if(!input||typeof input!=='object'||Array.isArray(input)) return false;
  const allowed=new Set<string>(sections.flatMap(s=>s.fields.map(f=>f[0])));
  return Object.entries(input).every(([k,v])=>allowed.has(k)&&typeof v==='string'&&v.length<=8000);
}
// The AI may adjust punctuation, whitespace and these equivalent phrases only.
// Fail closed on unsupported facts, omitted content, reordered chronology or structure.
function normalise(v:string) {
 return v.toLowerCase().replace(/range of motion/g,'rom').replace(/next of kin/g,'nok').replace(/general practitioner/g,'gp').replace(/neurological observations/g,'neuro obs').replace(/denied pain or discomfort/g,'reported no pain or discomfort').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
}
export function validateAI(candidate: unknown, canonical: Docs, requireEcaseHeadings = true): candidate is Docs {
  if(!candidate||typeof candidate!=='object'||Array.isArray(candidate))return false;
  const c=candidate as Record<string,unknown>;
  return Object.keys(c).length===keys.length && keys.every(k=>typeof c[k]==='string' && (c[k] as string).length<100000 && normalise(c[k] as string)===normalise(canonical[k]) && JSON.stringify((c[k] as string).match(/\d+(?:[.:/%-]\d+)*[%°]?/g))===JSON.stringify(canonical[k].match(/\d+(?:[.:/%-]\d+)*[%°]?/g))) && (!requireEcaseHeadings || headings.every((h,i)=>typeof c.ecase==='string' && (i===0||c.ecase.indexOf(headings[i-1]+':')<c.ecase.indexOf(h+':')) && c.ecase.includes(h+':')));
}
