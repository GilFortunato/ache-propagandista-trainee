import { NextResponse } from "next/server";
import { currentResearchIdentity, googleAuthConfigured, GOOGLE_SESSION_COOKIE, googleSessionCookieOptions } from "@/lib/acheGoogleAuth";
export const dynamic = "force-dynamic";
export async function GET() {
  const identity = await currentResearchIdentity();
  return NextResponse.json({
    authenticated: Boolean(identity),
    owner: Boolean(identity?.owner),
    email: identity?.email || null,
    googleReady: googleAuthConfigured(),
  }, { headers: { "Cache-Control": "no-store" } });
}
export async function DELETE(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(GOOGLE_SESSION_COOKIE, "", { ...googleSessionCookieOptions, maxAge: 0 });
  return response;
}
