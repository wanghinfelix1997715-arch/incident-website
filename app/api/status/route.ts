import { env } from 'cloudflare:workers';
import { headers } from 'next/headers';
import { ownerAccess } from '../../../lib/access';
export async function GET() {
 const runtime=env as unknown as Record<string,string|undefined>;
 const access=ownerAccess(await headers(),runtime.AFTERFALL_OWNER_EMAIL);
 if(!access.allowed)return Response.json({code:access.code,error:access.error},{status:access.status,headers:{'Cache-Control':'no-store'}});
 return Response.json({configured:!!runtime.OPENAI_API_KEY,authenticated:true},{headers:{'Cache-Control':'no-store'}});
}
