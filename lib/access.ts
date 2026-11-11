// Only Sites-injected identity headers are used. This Site remains owner-private.
// Email allowlisting is for this shared drafting tool, not user-owned record IDs.
export function ownerAccess(identity: {get(name: string): string | null}, ownerEmail?: string) {
  if (!ownerEmail?.trim()) return {allowed:false,status:503,code:'access_configuration',error:'Site access configuration needs repair.'};
  const email=identity.get('oai-authenticated-user-email')?.trim().toLowerCase();
  if (!email) return {allowed:false,status:401,code:'sign_in_required',error:'Sign in to this Site to use AI drafting.'};
  if (email!==ownerEmail.trim().toLowerCase()) return {allowed:false,status:403,code:'access_denied',error:'This private Site is restricted to its owner.'};
  return {allowed:true,status:200,code:'authorized',error:''};
}
