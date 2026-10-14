import { NextResponse } from "next/server";
import { integrationStatus } from "@/lib/acheVercelSecrets";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const status = await integrationStatus();
    return NextResponse.json({
      gemini: status.gemini.configured,
      manus: status.manus.configured,
      model: process.env.ACHE_REBRAND_GEMINI_MODEL || "gemini-2.5-flash",
      researchProvider: "manus",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Status das integrações indisponível." }, { status: 503 });
  }
}
