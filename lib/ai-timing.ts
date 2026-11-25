// Each provider stage gets its own window. The browser must outlive both.
export const AI_STAGE_TIMEOUT_MS=90000;
export const AI_CLIENT_TIMEOUT_MS=2*AI_STAGE_TIMEOUT_MS+15000;
export type AIStage='writing'|'review';
export class AIStageTimeout extends Error {
 readonly code='provider_timeout';
 readonly status=504;
 readonly stage:AIStage;
 constructor(stage:AIStage){
  super(stage==='writing'?'AI drafting timed out before returning a complete draft.':'The independent AI source review timed out. The draft has not passed review.');
  this.stage=stage;
 }
}
export async function runAIStage<T>(operation:'incident_rewrite'|'incident_review'|'targeted_note'|'note_review',action:(signal:AbortSignal)=>Promise<T>):Promise<T>{
 const stage:AIStage=operation.endsWith('review')?'review':'writing';
 const controller=new AbortController();
 const started=Date.now();
 let timer:ReturnType<typeof setTimeout>|undefined;
 let code='failed';
 try{
  const deadline=new Promise<never>((_resolve,reject)=>{
   timer=setTimeout(()=>{const failure=new AIStageTimeout(stage);controller.abort(failure);reject(failure);},AI_STAGE_TIMEOUT_MS);
  });
  const value=await Promise.race([action(controller.signal),deadline]);
  code='completed';
  return value;
 }catch(error){
  if(controller.signal.aborted){code='timeout';throw new AIStageTimeout(stage);}
  throw error;
 }finally{
  clearTimeout(timer);
  // Deliberately exclude source, candidate, error text, identity and credentials.
  console.info(JSON.stringify({event:'care_ai_stage',operation,stage,code,durationMs:Date.now()-started}));
 }
}
