import {draftWoundProse} from './wound-prose.ts';
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
const sentence=(text:string)=>text&&!/[.!?]$/.test(text)?text+'.':text;
export function draftIncident(p:Pathway,d:Data):Docs{
 if(p==='fall')return draft(d);
 if(p==='wound')return draftWoundProse(d);
 return draftInfection(d);
}

const infectionStatusText:Record<string,string>={
 Suspected:'A possible infection was documented',
 'Clinician-diagnosed':'An infection was diagnosed by a clinician',
 'Laboratory-confirmed':'An infection was laboratory-confirmed',
 Uncertain:'The infection status was uncertain',
};
const specimenStatusText:Record<string,string>={
 'Awaiting request / order':'A test request or order is awaited.',
 Ordered:'Testing was ordered.',
 'Collection pending':'Specimen collection is pending.',
 Collected:'A specimen was collected.',
 'Result pending':'Result pending.',
 Resulted:'A test result was received.',
 'Not required':'Testing was recorded as not required.',
};
const contactStatusText:Record<string,string>={
 Pending:'GP or clinician contact is pending.',
 'Notified — awaiting response':'The GP or clinician was notified. Staff are awaiting response.',
 'Advice received':'Advice was received from the GP or clinician.',
 Reviewed:'A GP or clinician review was documented.',
 'Not required':'GP or clinician contact was recorded as not required.',
};

function draftInfection(d:Data):Docs{
 const s=(key:string)=>value(d,key);
 const raw=(key:string)=>sentence(s(key));
 const when=join(s('date')&&'on '+s('date'),s('time')&&'at '+s('time'),s('place')&&'in '+s('place'));
 const site=s('infectionType');
 const status=s('infectionStatus');
 const knownSite=['Urinary','Respiratory','Gastrointestinal'].includes(site);
 const concern=status==='Suspected'&&knownSite
  ?'Suspected '+site.toLowerCase()+' infection was documented'
  :infectionStatusText[status]||'An infection concern was documented';
 const summary=join(sentence(join(concern,when)),site==='Source unknown'?'The source was recorded as unknown.':
  site&&!(status==='Suspected'&&knownSite)?sentence('The recorded site category was '+site.toLowerCase()):'');
 const pain={Denied:'The resident denied pain or discomfort.',Reported:'Pain or discomfort was reported.',Observed:'Pain or discomfort was observed.','Unable to assess':'Pain or discomfort could not be assessed.'}[s('pain')]||'';
 const findings=join(raw('symptoms'),s('baselineChange')&&sentence('A change from baseline was recorded: '+s('baselineChange')),raw('observations'),pain,raw('painDetail'),raw('assessment'));
 const diagnosis=join(raw('account'),raw('diagnosisSource'));
 const background=join(raw('baseline'),s('exposureStatus')&&sentence('The exposure or outbreak link was recorded as '+s('exposureStatus').toLowerCase()),raw('exposure'),raw('preferences'));
 const reviewNeed={Yes:'Medical review was considered necessary.','No at present':'Medical review was not considered necessary at present.',Unsure:'The need for medical review was uncertain.'}[s('gpRequired')]||'';
 const details=paragraphs(join(s('identified')&&sentence('Identification or reporting was recorded at '+s('identified')),diagnosis,s('source')&&sentence('The information was sourced from '+s('source'))),findings,background,join(s('severity')&&sentence('Severity was recorded as '+s('severity').toLowerCase()),raw('severityReason'),reviewNeed,raw('reviewReason')));
 const clinicalCare=(forRecipient=false)=>{
  const status=(key:string)=>forRecipient&&s(key)==='Not required'?'':s(key);
  return join(raw('care'),
   status('precautionStatus')&&sentence('Additional precautions were recorded as '+status('precautionStatus').toLowerCase()),raw('precautions'),
   specimenStatusText[status('specimenStatus')],raw('specimen'),raw('results'),
   status('treatmentStatus')&&sentence('Treatment was recorded as '+status('treatmentStatus').toLowerCase()),raw('medication'),raw('response'));
 };
 const transfer={Pending:'Hospital transfer is pending.',Arranged:'A hospital transfer was arranged.',Transferred:'The resident was transferred to hospital.','Not required':'Hospital transfer was recorded as not required.'}[s('hospital')]||'';
 const communications=join(contactStatusText[s('gp')],raw('gpContact'),raw('gpAdvice'),
  s('nok')&&sentence('Family notification was recorded as '+s('nok').toLowerCase()),raw('nokContact'),
  s('management')&&sentence('Management or infection-control notification was recorded as '+s('management').toLowerCase()),
  raw('managementContact'),transfer,raw('escalation'));
 const actions=paragraphs(clinicalCare(),communications);
 const later=raw('later');
 const planned=s('planned')&&sentence('The following actions are planned: '+s('planned'));
 const investigation=paragraphs(summary,details,actions,later,join(raw('resultReview'),raw('contributors'),
  s('suspected')&&sentence('A possible contributor or source was recorded: '+s('suspected')),raw('prevention'),planned,raw('followup')));

 const name=s('resident')||'Resident';
 const advice=['Advice received','Reviewed'].includes(s('gp'))?raw('gpAdvice'):'';
 const escalation=join(['Arranged','Transferred'].includes(s('hospital'))?transfer:'',raw('escalation'));
 const request=s('gpRequired')==='Yes'?(raw('reviewReason')||'Please review and advise.'):'';
 const gp=paragraphs('Dear Doctor,',name+' — '+summary,join(diagnosis,findings,raw('baseline'),raw('preferences')),
  clinicalCare(true),join(advice,escalation,later),join(planned,raw('followup')),request,'Kind regards,\nRN');
 const nok=paragraphs('Dear Family,','I am writing to update you about '+name+'. '+summary,
  join(raw('symptoms'),raw('baselineChange'),pain),join(raw('care'),raw('response'),advice,escalation),later,raw('followup'),
  'Kind regards,\nRegistered Nurse');
 return {summary,details,actions,investigation,ecase:investigation,gp,nok};
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
