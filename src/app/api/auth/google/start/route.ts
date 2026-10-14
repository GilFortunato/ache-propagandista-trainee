import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createOAuthState, googleAuthConfigured, GOOGLE_OAUTH_COOKIE, googleSessionCookieOptions } from "@/lib/acheGoogleAuth";

export const runtime = "nodejs";
export async function GET() {
  if (!googleAuthConfigured()) {
    return NextResponse.json({ error: "Login Google ainda não configurado. A administração precisa cadastrar as credenciais OAuth da aplicação." }, { status: 503 });
  }
  const { state, nonce, verifier, cookie } = createOAuthState();
  const params = new URLSearchParams({
    client_id: process.env.ACHE_GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.ACHE_GOOGLE_REDIRECT_URI!,
    response_type: "code",
    scope: "openid email profile",
    state,
    nonce,
    code_challenge: createHash("sha256").update(verifier).digest("base64url"),
    code_challenge_method: "S256",
    prompt: "select_account",
  });
  const response = NextResponse.redirect("https://accounts.google.com/o/oauth2/v2/auth?" + params.toString());
  response.cookies.set(GOOGLE_OAUTH_COOKIE, cookie, { ...googleSessionCookieOptions, maxAge: 10 * 60 });
  return response;
}
