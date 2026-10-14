import { NextResponse } from "next/server";
import { integrationStatus } from "@/lib/acheVercelSecrets";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const status = await integrationStatus();
    return NextResponse.json({
      gemini: status.gemini.configured,
      apify: status.apify.configured,
      model: process.env.ACHE_REBRAND_GEMINI_MODEL || "gemini-3.8-flash",
      actor: process.env.ACHE_REBRAND_APIFY_LINKEDIN_ACTOR_ID || "unseenuser/linkedin-profile",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Status das integrações indisponível." }, { status: 503 });
  }
}
