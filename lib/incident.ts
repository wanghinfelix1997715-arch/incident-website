import { sections as fallSections, empty, example, type Data } from './assessment.ts';
import { draft, getWarnings, validData, validateAI, type Docs } from './drafts.ts';
export type Pathway = 'fall' | 'wound' | 'infection';
export type Section = {title:string;sub:string;fields:readonly (readonly string[])[]};
const field=(id:string,label:string,kind='textarea',options?:string):readonly string[]=>options?[id,label,kind,options]:[id,label,kind];
const select=(id:string,label:string,options:string)=>field(id,label,'select','Not recorded|'+options);
const statusOptions='Pending|Notified — awaiting response|Advice received|Reviewed|Not required';
const notificationOptions='Pending|Informed|Not required';
const actionOptions='Pending|Completed|Declined|Not required';
const woundFields=[
 field('type','Injury type','select','Not recorded|Skin tear|Abrasion|Laceration|Bruise|Pressure injury|Other|Uncertain'),
 field('site','Site and side','text'),field('size','Length × width (cm); depth only if assessed','text'),
 field('classification','Classification system and category (if assessed)','text'),
 select('loss','Flap / skin loss','No flap loss|Partial flap loss|Total flap loss|Uncertain|Not assessed'),
 field('appearance','Wound appearance, bleeding and exudate'),field('skin','Surrounding skin'),
 select('pain','Pain','Denied|Reported|Observed|Unable to assess|Not assessed'),field('painDetail','Pain details / score'),field('other','Other assessed findings')
];
const sharedIncident=[field('resident','Resident name / identifier','text'),field('date','Event / onset date (approximate or unknown allowed)','text'),field('time','Event / onset time','text'),field('identified','Discovery / report date and time if different','text'),field('place','Location','text')];
const notifications:Section={title:'Notifications & review',sub:'Contact, advice and review are different actions',fields:[select('gp','GP / clinician contact and review',statusOptions),field('gpContact','GP contact time, method and reason'),field('gpAdvice','Advice received / review findings, clinician and time'),select('nok','NOK notification',notificationOptions),field('nokContact','NOK contact time, method and response'),select('management','Management / infection-control lead notification',notificationOptions),field('managementContact','Other notifications, time and response'),select('hospital','Hospital transfer','Pending|Arranged|Transferred|Not required'),field('escalation','Escalation reason, advice source and details')]};
const follow:Section={title:'Investigation & follow-up',sub:'Evidence, prevention, later findings and outstanding work',fields:[field('contributors','Established contributing factors and supporting evidence'),field('suspected','Suspected contributors / possible source and uncertainty'),field('prevention','Prevention measures actually implemented'),field('planned','Planned actions — not yet completed'),field('followup','Monitoring, review and outstanding tasks (person / timeframe if known)'),field('later','Later reassessment — time and findings')]};
const severity=[select('severity','Severity — user assessment','Minor|Moderate|Major|Extreme|Unconfirmed'),field('severityReason','Severity rationale'),select('gpRequired','Medical review considered necessary','Yes|No at present|Unsure'),field('reviewReason','Reason / urgency of review')];
export function woundCount(d:Data):number {return /^([1-9]|1[0-9]|20)$/.test(d.woundCount||'1')?Number(d.woundCount||1):1;}
export function incidentSections(p:Pathway,d:Data={}):readonly Section[]{
 if(p==='fall')return fallSections;
 if(p==='wound')return [
 {title:'Incident details',sub:'Where, when, what happened and source',fields:[...sharedIncident,select('witness','Witnessed?','Witnessed|Unwitnessed|Unknown'),select('certainty','Mechanism certainty','Known|Suspected|Unknown'),field('account','Factual account / resident report'),field('source','Source of account')]},
 {title:'Wound assessment',sub:'Record each injury separately; do not infer findings',fields:Array.from({length:woundCount(d)},(_,i)=>woundFields.map(f=>[`wound_${i}_${f[0]}`,`Wound ${i+1} — ${f[1]}`,...f.slice(2)])).flat()},
 {title:'Background & severity',sub:'Baseline risks and user-selected severity',fields:[field('baseline','Relevant baseline, conditions, medications and risk factors'),...severity]},
 {title:'Immediate actions',sub:'Record actual care separately from plans',fields:[field('assessment','RN assessment — findings and time'),field('care','First aid, cleansing / bleeding management actually performed'),field('dressing','Dressing applied — site, type and time'),field('medication','Analgesia / medication — actual status and supplied details'),field('response','Observed response to care'),select('planStatus','Wound chart / care plan','Created|Updated|Pending|Not required'),field('plan','Wound chart / care plan details and review instructions'),select('photo','Photograph status',actionOptions),field('photoDetail','Photograph documentation details (no upload)')]},notifications,follow];
 return [
 {title:'Infection details',sub:'Onset, discovery and the source of the assessment',fields:[...sharedIncident,select('infectionType','Suspected / diagnosed site','Urinary|Respiratory|Gastrointestinal|Skin / wound|Other|Source unknown'),select('infectionStatus','Infection status','Suspected|Clinician-diagnosed|Laboratory-confirmed|Uncertain'),field('diagnosisSource','Assessment / diagnosis source and date'),field('account','What prompted the concern?'),field('source','Source of information')]},
 {title:'Clinical assessment',sub:'Document observed / reported signs and baseline changes',fields:[field('symptoms','Symptoms / signs — urinary, respiratory, gastrointestinal, skin or other; include timing and source'),field('baselineChange','New changes from baseline — cognition, behaviour, mobility or intake'),field('observations','Observations and time — temperature, BP, HR, RR, SpO₂, oxygen use or others only if assessed'),select('pain','Pain / discomfort','Denied|Reported|Observed|Unable to assess|Not assessed'),field('painDetail','Pain details'),field('assessment','Other assessed findings and time')]},
 {title:'Background & context',sub:'Relevant history, exposure and severity assessment',fields:[field('baseline','Relevant baseline, conditions, devices, recent hospital attendance or antimicrobial course'),select('exposureStatus','Exposure / outbreak link','Confirmed|Suspected|Unknown'),field('exposure','Exposure / outbreak details and source'),field('preferences','Relevant allergies and documented care preferences'),...severity]},
 {title:'Immediate actions',sub:'Actual care, precautions, specimens and treatment status',fields:[field('care','Care / assistance actually provided and time'),select('precautionStatus','Additional precautions',actionOptions),field('precautions','Precautions actually commenced, start time and advice source'),select('specimenStatus','Tests / specimens','Awaiting request / order|Ordered|Collection pending|Collected|Result pending|Resulted|Not required'),field('specimen','Tests / specimens — type, collection time and details'),field('results','Results received, date/time and clinician interpretation if documented'),select('treatmentStatus','Treatment','Prescribed|Commenced|Administered|Withheld|Declined|Pending|Completed|Not required'),field('medication','Treatment details, prescription / administration times and advice source'),field('response','Observed response')]},notifications,{...follow,fields:[field('resultReview','Who reviewed results, when and documented advice'),...follow.fields]}];
}
export function initialIncident(p:Pathway):Data{return p==='fall'?{...empty}:p==='wound'?{woundCount:'1'}:{};}
const value=(d:Data,k:string)=>{const v=(d[k]||'').trim();return ['Not recorded','Not assessed','Unconfirmed'].includes(v)?'':v;};
const join=(...v:string[])=>v.filter(Boolean).join(' ');
const paragraphs=(...v:string[])=>v.filter(Boolean).join('\n\n');
const sentence=(label:string,v:string)=>v?`${label}: ${v}${/[.!?]$/.test(v)?'':'.'}`:'';
export function draftIncident(p:Pathway,d:Data):Docs{
 if(p==='fall')return draft(d);
 const s=(k:string)=>value(d,k);
 const labelled=(k:string,label:string)=>sentence(label,s(k));
 const name=s('resident')||'Resident';
 const summary=join(p==='wound'?'Wound / skin injury identified.':`${s('infectionStatus')||'Infection concern'}${s('infectionType')?' — '+s('infectionType'):''}.`,s('date')?'Date: '+s('date')+'.':'',s('time')?'Time: '+s('time')+'.':'',s('place')?'Location: '+s('place')+'.':'');
 const wounds=p==='wound'?Array.from({length:woundCount(d)},(_,i)=>{
  const outputLabels:Record<string,string>={size:'Wound dimensions',classification:'Recorded classification',other:'Other findings'};
  const parts=woundFields.map(f=>sentence(outputLabels[f[0]]||f[1],s(`wound_${i}_${f[0]}`))).filter(Boolean);
  return parts.length?`Wound ${i+1}. ${parts.join(' ')}`:'';
 }).filter(Boolean).join('\n\n'):'';
 const background=join(labelled('baseline','Relevant baseline / background'),labelled('exposureStatus','Exposure / outbreak link'),labelled('exposure','Exposure details'),labelled('preferences','Allergies / care preferences'));
 const findings=join(labelled('symptoms','Symptoms / signs'),labelled('baselineChange','Change from baseline'),labelled('observations','Observations'),labelled('pain','Pain / discomfort'),labelled('painDetail','Pain details'),labelled('assessment','RN assessment'));
 const details=paragraphs(join(labelled('identified','Identified / reported'),labelled('witness','Witness status'),labelled('certainty','Mechanism certainty'),s('account'),labelled('source','Source of account'),labelled('diagnosisSource','Assessment / diagnosis source')),wounds,findings,background,join(labelled('severity','User-selected severity'),labelled('severityReason','Severity rationale'),labelled('gpRequired','Medical review considered necessary'),labelled('reviewReason','Review reason / urgency')));
 const completed=join(labelled('care','Care actually provided'),labelled('dressing','Dressing applied'),labelled('medication','Medication / treatment details'),labelled('treatmentStatus','Treatment status'),labelled('response','Observed response'),labelled('planStatus','Wound chart / care plan status'),labelled('plan','Wound chart / care plan details'),labelled('photo','Photograph status'),labelled('photoDetail','Photograph details'),labelled('precautionStatus','Additional precaution status'),labelled('precautions','Recorded precautions'),labelled('specimenStatus','Test / specimen status'),labelled('specimen','Test / specimen details'),labelled('results','Results received'));
 const notifications=join(labelled('gp','GP / clinician status'),labelled('gpContact','GP contact'),labelled('gpAdvice','GP advice / review'),labelled('nok','NOK notification'),labelled('nokContact','NOK communication'),labelled('management','Management / infection-control notification'),labelled('managementContact','Other communication'),labelled('hospital','Hospital transfer status'),labelled('escalation','Escalation details'));
 const subsequent=labelled('later','Subsequent reassessment');
 const followup=join(labelled('resultReview','Result review'),labelled('contributors','Established contributing factors'),labelled('suspected','Suspected contributors / possible source'),labelled('prevention','Prevention implemented'),labelled('planned','Planned — not yet completed'),labelled('followup','Follow-up / outstanding work'));
 const actions=paragraphs(completed,notifications);
 const investigation=paragraphs(summary,details,actions,subsequent,followup);
 // Investigation already consolidates the four sections: avoid repeating them in the progress note.
 const ecase=investigation;
 const gp=paragraphs('Dear Doctor,',name+' — '+summary,join(s('account'),labelled('diagnosisSource','Assessment / diagnosis source')),paragraphs(wounds,findings,background),join(completed,labelled('gp','GP / clinician status'),labelled('gpAdvice','Advice / review'),labelled('hospital','Hospital transfer'),s('escalation')),subsequent,join(s('planned'),s('followup')),'Please review the documented concerns and advise as appropriate.','Kind regards,\nRN');
 const familyFindings=p==='wound'?Array.from({length:woundCount(d)},(_,i)=>{
  const finding=join(s(`wound_${i}_type`),s(`wound_${i}_site`)?'at '+s(`wound_${i}_site`):'',s(`wound_${i}_pain`)?'Pain assessment: '+s(`wound_${i}_pain`)+'.':'',s(`wound_${i}_painDetail`));
  return finding?sentence('Injury '+(i+1),finding):'';
 }).filter(Boolean).join(' '):join(s('symptoms'),s('baselineChange'),labelled('pain','Pain / discomfort'),s('painDetail'));
 const familyCare=join(s('care'),labelled('dressing','Dressing applied'),labelled('treatmentStatus','Treatment status'),s('response'),labelled('gp','Medical contact / review status'),s('gpAdvice'),labelled('hospital','Hospital transfer status'),s('escalation'));
 const nok=paragraphs('Dear Family,','I am writing to update you about '+name+'. '+summary,familyFindings,familyCare,subsequent,join(s('planned'),s('followup')),'Kind regards,\nRegistered Nurse');
 return {summary,details,actions,investigation,ecase,gp,nok};
}
export function incidentWarnings(p:Pathway,d:Data):string[]{
 if(p==='fall')return getWarnings(d);
 const w:string[]=[];
 if(!value(d,'date'))w.push('Event / onset date not entered.');
 if(!value(d,'time'))w.push('Event / onset time not entered.');
 if(!value(d,'place'))w.push('Location not entered.');
 if(!value(d,'gp'))w.push('GP contact / review status not recorded.');
 if(!value(d,'nok'))w.push('NOK notification status not recorded.');
 if(!value(d,'severity'))w.push('Severity is unconfirmed; only the user can select it.');
 if(p==='wound')for(let i=0;i<woundCount(d);i++){
  if(!value(d,`wound_${i}_site`))w.push(`Wound ${i+1}: site and side not entered.`);
  const c=value(d,`wound_${i}_classification`).toLowerCase(),loss=value(d,`wound_${i}_loss`);
  if(c&&loss&&((/istap.*(?:type\s*)?1\b/.test(c)&&['Partial flap loss','Total flap loss'].includes(loss))||(/istap.*(?:type\s*)?2\b/.test(c)&&loss!=='Partial flap loss')||(/istap.*(?:type\s*)?3\b/.test(c)&&loss!=='Total flap loss')))w.push(`Wound ${i+1}: classification and flap-loss description may conflict; review without automatic correction.`);
 }
 if(p==='infection'&&!value(d,'infectionStatus'))w.push('Infection status not recorded; no diagnosis is inferred.');
 if(value(d,'gpAdvice')&&!['Advice received','Reviewed'].includes(d.gp))w.push('Advice / findings entered: verify GP contact and review status.');
 return w;
}
export function validIncident(p:Pathway,input:unknown):input is Data{
 if(p==='fall')return validData(input);
 if(!input||typeof input!=='object'||Array.isArray(input))return false;
 const d=input as Data;
 if(d.woundCount!==undefined&&(p!=='wound'||!/^([1-9]|1[0-9]|20)$/.test(d.woundCount)))return false;
 const fields=incidentSections(p,d).flatMap(s=>s.fields);
 const allowed=new Map(fields.map(f=>[f[0],f]));
 return Object.entries(d).every(([k,v])=>{
  if(typeof v!=='string'||v.length>8000)return false;
  if(k==='woundCount')return p==='wound';
  const f=allowed.get(k);return !!f&&(f[2]!=='select'||v===''||f[3].split('|').includes(v));
 });
}
export function validateIncidentAI(p:Pathway,candidate:unknown,canonical:Docs):candidate is Docs{return validateAI(candidate,canonical,p==='fall');}
export function incidentExample(p:Pathway):Data{
 if(p==='fall')return {...example};
 if(p==='wound')return {woundCount:'1',resident:'Resident W (synthetic)',date:'2026-11-12',time:'14:00',place:'Dining area',certainty:'Known',account:'Accidental contact with a visitor’s walker while seated.',wound_0_type:'Skin tear',wound_0_site:'left lower leg',wound_0_size:'2 x 2 cm',wound_0_skin:'Dry, fragile surrounding skin.',dressing:'A non-adherent dressing was applied.',planStatus:'Created',plan:'Wound care plan created.',nok:'Informed',nokContact:'NOK emailed at 14:20.'};
 return {resident:'Resident I (synthetic)',date:'2026-11-12',time:'10:00',place:'Resident room',infectionType:'Urinary',infectionStatus:'Suspected',symptoms:'Resident reported pain when passing urine at 10:00.',observations:'10:10 — temperature 37.8°C, BP 120/72.',specimenStatus:'Result pending',specimen:'MSU collected at 10:20.',gp:'Notified — awaiting response',gpContact:'GP emailed at 10:30 requesting review.',nok:'Pending',followup:'Await pathology result and GP advice.'};
}
