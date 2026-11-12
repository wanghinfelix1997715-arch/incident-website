import type {Data} from './assessment.ts';
import type {Docs} from './drafts.ts';

// Only connector wording is authored here. Free-text findings/treatments remain source text.
const present=(v:string)=>!['Not recorded','Not assessed','Unconfirmed'].includes(v);
const end=(v:string)=>v?`${v}${/[.!?]$/.test(v)?'':'.'}`:'';
const clause=(v:string)=>/^[A-Z][a-z]/.test(v)?v[0].toLowerCase()+v.slice(1):v;
const join=(...v:string[])=>v.filter(Boolean).join(' ');
const paragraphs=(...v:string[])=>v.filter(Boolean).join('\n\n');
const injuryDescriptions:Record<string,string>={'Skin tear':'a skin tear',Abrasion:'an abrasion',Laceration:'a laceration',Bruise:'a bruise','Pressure injury':'a pressure injury',Other:'another injury',Uncertain:'an injury of uncertain type'};
export function draftWoundProse(d:Data):Docs{
 const s=(k:string)=>{const v=(d[k]||'').trim();return present(v)?v:'';};
 const raw=(k:string)=>end(s(k));
 const contextual=(k:string,prefix:string)=>s(k)?end(prefix+clause(s(k))):'';
 const name=s('resident')||'the resident';
 const count=/^([1-9]|1[0-9]|20)$/.test(d.woundCount||'1')?Number(d.woundCount||1):1;
 const summary=end(join(`A wound / skin injury was identified for ${name}`,s('date')?'on '+s('date'):'',s('time')?'at '+s('time'):'',s('place')?'in '+s('place'):''));
 const wounds=Array.from({length:count},(_,i)=>{
  const w=(k:string)=>s(`wound_${i}_${k}`);
  if(!['type','site','size','classification','loss','appearance','skin','pain','painDetail','other'].some(k=>w(k)))return '';
  const identity=end(`Wound ${i+1} was documented${w('type')?' as '+injuryDescriptions[w('type')]:''}${w('site')?' on the '+w('site'):''}`);
  const size=w('size')?end('It measured '+w('size')):'';
  const classification=w('classification')?end('The recorded classification was '+w('classification')):'';
  const loss=w('loss')?end(w('loss')==='Uncertain'?'The extent of flap / skin loss was uncertain':w('loss')+' was documented'):'';
  const appearance=end(w('appearance'));
  const skin=w('skin')?end('The surrounding skin was described as '+clause(w('skin'))):'';
  const pain:Record<string,string>={Denied:'The resident denied pain.',Reported:'Pain was reported.',Observed:'Signs of pain were observed.'};
  // Use a grammatical clause without converting an unassessable finding into a negative.
  const painText=w('pain')==='Unable to assess'?'The resident was unable to be assessed for pain.':pain[w('pain')]||'';
  return join(identity,size,classification,loss,appearance,skin,painText,w('painDetail')?end('Additional pain assessment details were recorded as “'+w('painDetail')+'”'):'',end(w('other')));
 }).filter(Boolean).join('\n\n');
 const mechanism:Record<string,string>={Known:'The mechanism was documented as known.',Suspected:'The mechanism was suspected, not confirmed.',Unknown:'The mechanism was unknown.'};
 const event=join(contextual('identified','The injury was identified / reported '),s('witness')?end('The event was '+s('witness').toLowerCase()):'',mechanism[s('certainty')]||'',raw('account'),contextual('source','The account was provided by '));
 const assessment=contextual('assessment','The RN assessment recorded ');
 const severity=join(s('severity')?end('The severity was assessed as '+s('severity')):'',raw('severityReason'),s('gpRequired')==='Yes'?'Medical review was considered necessary.':s('gpRequired')==='No at present'?'Medical review was not considered necessary at present.':s('gpRequired')==='Unsure'?'The need for medical review was uncertain.':'',raw('reviewReason'));
 const details=paragraphs(event,wounds,assessment,contextual('baseline','Relevant background included '),severity);
 const plan:Record<string,string>={Created:'A wound care plan was created.',Updated:'The wound care plan was updated.',Pending:'The wound care plan is pending.','Not required':'A wound care plan was documented as not required.'};
 const photo:Record<string,string>={Completed:'A wound photograph was taken.',Pending:'A wound photograph is pending.',Declined:'A wound photograph was declined.','Not required':'A wound photograph was documented as not required.'};
 const care=join(raw('care'),raw('dressing'),raw('medication'),contextual('response','The response to care was recorded as '),plan[s('planStatus')]||'',contextual('plan','The wound care plan specified '),photo[s('photo')]||'',raw('photoDetail'));
 const gpStatus:Record<string,string>={Pending:'GP / clinician contact is pending.','Notified — awaiting response':'The GP was notified and a response is awaited.','Advice received':'Advice was received from the GP / clinician.',Reviewed:'The resident was reviewed by the GP / clinician.','Not required':'GP / clinician contact was documented as not required.'};
 const nokStatus:Record<string,string>={Pending:'NOK notification is pending.',Informed:'NOK was informed.','Not required':'NOK notification was documented as not required.'};
 const management:Record<string,string>={Pending:'Management / infection-control notification is pending.',Informed:'Management / infection control was informed.','Not required':'Management / infection-control notification was documented as not required.'};
 const hospital:Record<string,string>={Pending:'Hospital transfer is pending.',Arranged:'Hospital transfer was arranged.',Transferred:'The resident was transferred to hospital.','Not required':'Hospital transfer was documented as not required.'};
 const notRequired=s('management')==='Not required'&&s('hospital')==='Not required';
 const contacts=join(gpStatus[s('gp')]||'',/^(?:GP|The GP|Doctor|Dr)\b/i.test(s('gpContact'))?raw('gpContact'):contextual('gpContact','The recorded GP contact was '),contextual('gpAdvice','Documented advice / review findings were '),nokStatus[s('nok')]||'',/^(?:NOK|The NOK|Next of kin)\b/i.test(s('nokContact'))?raw('nokContact'):contextual('nokContact','The recorded NOK communication was '),notRequired?'Management notification and hospital transfer were documented as not required.':join(management[s('management')]||'',hospital[s('hospital')]||''),raw('managementContact'),raw('escalation'));
 const actions=paragraphs(care,contacts);
 const later=contextual('later','On subsequent reassessment, ');
 const follow=join(contextual('contributors','Established contributing factors were '),contextual('suspected','Possible contributors remained unconfirmed: '),contextual('prevention','Prevention measures implemented were '),contextual('planned','Actions planned but not yet completed were '),contextual('followup','Follow-up was documented as '));
 const investigation=paragraphs(summary,details,actions,later,follow);
 // Recipient drafts are summaries, not copies of the incident report or notification checklist.
 const careSource=join(s('care'),s('dressing'));
 const uncertainCare=/\b(?:not|no|pending|planned|awaiting|declined|refused|unable|yet|will|to be)\b/i.test(careSource);
 const cleaned=!uncertainCare&&/\b(?:cleaned|cleansed|used.{0,25}\bclean(?:se)?|cleansing (?:performed|completed))\b/i.test(careSource);
 const dressed=!uncertainCare&&(!!s('dressing')||/\bdressing (?:was )?applied\b/i.test(s('care')));
 const simpleCare=cleaned&&dressed?'The area was cleaned and dressed.':cleaned?'The area was cleaned.':dressed?'A dressing was applied.':'';
 const significantTransfer=['Pending','Arranged','Transferred'].includes(s('hospital'))?hospital[s('hospital')]:'';
 const reviewRequest=s('gpRequired')==='Yes'?join(raw('reviewReason'),/\b(?:please|request|advise)\b/i.test(s('reviewReason'))?'':'Please review the documented wound concerns and advise as appropriate.'):'';
 const gpCare=join(raw('care'),raw('dressing'),raw('medication'),contextual('response','The response to care was recorded as '),['Created','Updated','Pending'].includes(s('planStatus'))?plan[s('planStatus')]:'',contextual('plan','The wound care plan specified '));
 const gp=paragraphs('Dear Doctor,',summary,join(raw('account'),contextual('source','The account was provided by ')),wounds,join(assessment,contextual('baseline','Relevant background included ')),gpCare,raw('gpAdvice'),join(significantTransfer,raw('escalation')),later,join(raw('planned'),raw('followup')),reviewRequest,'Kind regards,\nRN');
 const familyFindings=Array.from({length:count},(_,i)=>{
  const type=s(`wound_${i}_type`),site=s(`wound_${i}_site`),pain=s(`wound_${i}_pain`);
  const description=join(injuryDescriptions[type]||'a wound',site?'at '+site:'');
  const injury=type||site?end(count>1?'Injury '+(i+1)+': '+description:'The injury was '+description):'';
  return join(injury,pain==='Denied'?'No pain was reported.':pain==='Reported'?'Pain was reported.':pain==='Observed'?'Signs of pain were observed.':pain==='Unable to assess'?'It was not possible to assess pain.':'');
 }).filter(Boolean).join(' ');
 const familyPlan=['Created','Updated'].includes(s('planStatus'))?'A wound care plan is in place.':'';
 const nok=paragraphs('Dear Family,','I am writing to update you about '+name+'.',join(raw('account'),familyFindings),join(simpleCare,familyPlan),join(['Advice received','Reviewed'].includes(s('gp'))?raw('gpAdvice'):'',significantTransfer,raw('escalation')),later,join(raw('planned'),raw('followup')),'Kind regards,\nRegistered Nurse');

 return {summary,details,actions,investigation,ecase:investigation,gp,nok};
}
