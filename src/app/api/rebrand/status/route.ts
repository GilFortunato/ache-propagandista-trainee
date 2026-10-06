import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    gemini: Boolean(process.env.ACHE_REBRAND_GEMINI_API_KEY),
    apify: Boolean(process.env.ACHE_REBRAND_APIFY_TOKEN),
    model: process.env.ACHE_REBRAND_GEMINI_MODEL || "gemini-2.5-flash",
    actor: process.env.ACHE_REBRAND_APIFY_LINKEDIN_ACTOR_ID || "unseenuser/linkedin-profile",
  });
}
