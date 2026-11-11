import { env } from 'cloudflare:workers';
import { headers } from 'next/headers';
import { ownerAccess } from '../../../lib/access';
import { handleGenerate } from '../../../lib/generate';
export async function POST(request: Request) {
 const runtime=env as unknown as Record<string,string|undefined>;
 const access=ownerAccess(await headers(),runtime.AFTERFALL_OWNER_EMAIL);
 if(!access.allowed)return Response.json({code:access.code,error:access.error},{status:access.status,headers:{'Cache-Control':'no-store'}});
 return handleGenerate(request,{key:runtime.OPENAI_API_KEY,model:runtime.OPENAI_MODEL},true);
}
