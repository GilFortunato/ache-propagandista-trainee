import { NextResponse } from "next/server";
import { currentResearchIdentity, googleAuthConfigured } from "@/lib/acheGoogleAuth";
import { quotaFor, researchStorageReady } from "@/lib/rebrand/usage";
export const dynamic = "force-dynamic";
export async function GET() {
  const identity = await currentResearchIdentity();
  if (!identity) return NextResponse.json({
    authenticated: false, googleReady: googleAuthConfigured(), storageReady: researchStorageReady(), remaining: null, limit: 3,
  }, { headers: { "Cache-Control": "no-store" } });
  if (!researchStorageReady()) return NextResponse.json({
    authenticated: true, owner: identity.owner, storageReady: false, remaining: null,
    error: "O banco de pesquisas ainda não foi conectado à plataforma.",
  }, { status: 503, headers: { "Cache-Control": "no-store" } });
  try {
    const quota = await quotaFor(identity);
    return NextResponse.json({ authenticated: true, owner: identity.owner, storageReady: true, ...quota }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ authenticated: true, error: "Não foi possível consultar o saldo de pesquisas." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
