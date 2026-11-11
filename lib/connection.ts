export type Connection = 'checking'|'ready'|'sign_in_required'|'access_denied'|'missing_key'|'error';
export function connectionState(status: number, body: {configured?:boolean}): Connection {
  if(status===401)return 'sign_in_required';
  if(status===403)return 'access_denied';
  if(status!==200)return 'error';
  return body.configured===true?'ready':body.configured===false?'missing_key':'error';
}
export const connectionMessage:Record<Connection,string>={
  checking:'Checking server AI connection…',
  ready:'Server key is configured. Generate with AI to verify the OpenAI response.',
  sign_in_required:'Site sign-in was not recognised. This does not mean your API key is missing.',
  access_denied:'This private Site is restricted to its owner.',
  missing_key:'The server reports that OPENAI_API_KEY is not configured.',
  error:'Could not check the server connection. Your key has not been classified as missing.'
};
