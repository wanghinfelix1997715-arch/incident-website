export type Data = Record<string, string>;
export const sections = [{
  title: 'Incident details',
  sub: 'Where, when and what happened',
  fields: [['resident', 'Resident name', 'text'], ['date', 'Incident date', 'date'], ['time', 'Time of incident', 'time'], ['place', 'Location', 'text'], ['witness', 'Witnessed?', 'select', 'Not recorded|Witnessed|Unwitnessed|Unknown'], ['position', 'Position found', 'select', 'Not recorded|Supine|Prone|Side lying|Sitting|Other'], ['mechanism', 'Possible mechanism', 'select', 'Not recorded|Walking / tripping|Transfer|Stairs / height|Found on floor — unknown|Other'], ['certainty', 'Mechanism certainty', 'select', 'Not recorded|Known|Suspected|Unknown'], ['account', 'Incident narrative / resident account', 'textarea'], ['found', 'How resident was found / surroundings', 'textarea'], ['suspected', 'Suspected contributing circumstances (if any)', 'textarea']]
}, {
  title: 'Clinical assessment',
  sub: 'Findings and initial observations',
  fields: [['head', 'Head strike', 'select', 'Not recorded|Denied by resident|Confirmed / witnessed|Witnessed no strike|Suspected|Unknown'], ['loc', 'Loss of consciousness', 'select', 'Not recorded|No reported LOC|Yes|Unknown|Not assessed'], ['injury', 'Injury identified', 'select', 'Not assessed|No injury identified|Yes|Uncertain'], ['injurydetail', 'Injury description', 'textarea'], ['pain', 'Pain', 'select', 'Not assessed|Denied|Reported|Unable to assess'], ['paindetail', 'Pain site / score / management', 'textarea'], ['gcs', 'GCS (only if assessed)', 'text'], ['pupils', 'Pupils', 'select', 'Not assessed|Normal|Abnormal'], ['cognition', 'Cognition / neurological changes', 'select', 'Not assessed|At baseline|New change'], ['neuro', 'Neurological findings', 'textarea'], ['bp', 'BP', 'text'], ['hr', 'HR', 'text'], ['rr', 'RR', 'text'], ['spo2', 'SpO₂', 'text'], ['temp', 'Temperature', 'text'], ['bgl', 'BGL (if checked)', 'text']]
}, {
  title: 'Mobility & risk',
  sub: 'Baseline compared with post-fall',
  fields: [['baseline', 'Relevant baseline / history', 'textarea'], ['rom', 'ROM', 'select', 'Not assessed|At baseline|New restriction|Unknown'], ['strength', 'Limb strength', 'select', 'Not assessed|At baseline|Pre-existing weakness unchanged|New weakness|Unknown'], ['limbdetail', 'Limb / ROM detail', 'textarea'], ['weight', 'Weight bearing', 'select', 'Not assessed|At baseline|Reduced|Unable'], ['mobilised', 'Mobilised after fall', 'select', 'Not assessed|Yes|No'], ['walking', 'Post-fall mobility', 'select', 'Not assessed|Mobilised at baseline|Reduced mobility|Unable to weight bear|Not mobilised'], ['walkingdetail', 'Mobility details / aid', 'textarea'], ['anticoag', 'Anticoagulants', 'select', 'Not confirmed|No|Yes'], ['antiplatelet', 'Antiplatelets', 'select', 'Not confirmed|No|Yes'], ['mednotes', 'Medication / bleeding history', 'textarea'], ['cause', 'Possible cause / risk factors', 'textarea']]
}, {
  title: 'Immediate actions',
  sub: 'What was actually done',
  fields: [['actions', 'Immediate assistance / positioning', 'textarea'], ['transfermethod', 'Assisted transfer method', 'select', 'Not recorded|Hoist|Assisted stand|Other|Not transferred'], ['transfer', 'Transfer / hoist details', 'textarea'], ['treatment', 'Treatment / first aid', 'textarea'], ['otheractions', 'Other completed interventions', 'textarea'], ['neuroobs', 'Neurological observations', 'select', 'Not recorded|Commenced|Not commenced|Pending'], ['visual', 'Additional monitoring', 'textarea'], ['investigations', 'Investigations / samples collected', 'textarea']]
}, {
  title: 'Notifications',
  sub: 'Communication and escalation',
  fields: [['gp', 'GP informed', 'select', 'Completed|Not completed|Pending|Not indicated'], ['nok', 'NOK informed', 'select', 'Completed|Not completed|Pending|Not indicated'], ['hospital', 'Hospital transfer', 'select', 'No|Yes|Pending'], ['gpadvice', 'GP advice / response', 'textarea'], ['nokadvice', 'NOK discussion / response', 'textarea'], ['notificationdetail', 'GP / NOK advice and notification details', 'textarea'], ['transferdetail', 'Transfer / escalation details', 'textarea']]
}, {
  title: 'Investigation & follow-up',
  sub: 'Factors, prevention and review',
  fields: [['frat', 'FRAT reviewed and updated', 'select', 'Completed|Not completed|Pending|Not indicated'], ['prevention', 'Prevention / environmental measures', 'textarea'], ['followup', 'Investigation and follow-up narrative', 'textarea'], ['reassessment', 'Later reassessment (time and findings)', 'textarea']]
}] as const;
export const empty: Data = {
  gp: 'Completed',
  nok: 'Completed',
  frat: 'Completed'
};
export const example: Data = {
  ...empty,
  resident: 'Resident A (synthetic)',
  date: '2026-10-20',
  time: '16:45',
  place: 'Level 2 — bottom of staircase',
  witness: 'Unwitnessed',
  position: 'Supine',
  mechanism: 'Stairs / height',
  account: 'Resident called for assistance and was found below a short staircase with an overturned 4WW. Resident reported visiting another resident before using the lift to an unfamiliar level. Denied head strike and stated that they landed on their bottom.',
  suspected: 'Possible attempted stair descent with 4WW; exact mechanism unknown.',
  head: 'Denied by resident',
  injury: 'Uncertain',
  pain: 'Denied',
  bp: '108/68',
  hr: '79',
  rr: '20',
  spo2: '94%',
  temp: '36.2',
  rom: 'At baseline',
  strength: 'Pre-existing weakness unchanged',
  limbdetail: 'Mild pre-existing right lower limb weakness.',
  walking: 'Mobilised at baseline',
  walkingdetail: 'Able to stand and mobilise with 4WW without discomfort.',
  anticoag: 'No',
  actions: 'Repositioned for comfort on floor while awaiting hoist.',
  transfer: 'Hoisted into wheelchair and transferred to dining room.',
  neuroobs: 'Commenced',
  visual: '30-minute visual checks for five days commenced.',
  investigations: 'MSU collected to investigate possible UTI.',
  cause: 'Unfamiliar environment; possible stair use with 4WW.',
  followup: 'Review environmental access and falls risk prevention.'
};

