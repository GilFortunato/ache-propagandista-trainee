import { NextRequest, NextResponse } from "next/server";
import { GOOGLE_OAUTH_COOKIE, GOOGLE_SESSION_COOKIE, googleAuthConfigured, googleSessionCookieOptions, verifyOAuthState, encodeGoogleSession } from "@/lib/acheGoogleAuth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const base = new URL(process.env.ACHE_PUBLIC_URL || "https://ache-propagandista-trainee.vercel.app");
  const target = new URL("/rebrand", base);
  const fail = (message: string) => {
    const response = NextResponse.redirect(new URL("/login?error=" + encodeURIComponent(message), base));
    response.cookies.set(GOOGLE_OAUTH_COOKIE, "", { ...googleSessionCookieOptions, maxAge: 0 });
    return response;
  };
  if (!googleAuthConfigured()) return fail("Login Google indisponível.");
  const error = request.nextUrl.searchParams.get("error");
  if (error) return fail("A autenticação Google foi cancelada.");
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const original = verifyOAuthState(request.cookies.get(GOOGLE_OAUTH_COOKIE)?.value, state || "");
  if (!code || code.length > 2048 || !original) return fail("Sessão de login expirada. Tente novamente.");
  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.ACHE_GOOGLE_CLIENT_ID!,
        client_secret: process.env.ACHE_GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.ACHE_GOOGLE_REDIRECT_URI!,
        grant_type: "authorization_code",
        code_verifier: original.verifier,
      }),
      signal: AbortSignal.timeout(12000),
      cache: "no-store",
    });
    if (!tokenResponse.ok) return fail("Não foi possível autenticar pelo Google.");
    const tokens = await tokenResponse.json() as { id_token?: string };
    if (!tokens.id_token) return fail("O Google não retornou a identidade da conta.");
    const identityResponse = await fetch(
      "https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(tokens.id_token),
      { signal: AbortSignal.timeout(12000), cache: "no-store" },
    );
    if (!identityResponse.ok) return fail("Não foi possível validar a identidade do Google.");
    const identity = await identityResponse.json() as Record<string, unknown>;
    if (identity.aud !== process.env.ACHE_GOOGLE_CLIENT_ID ||
        (identity.iss !== "https://accounts.google.com" && identity.iss !== "accounts.google.com") ||
        identity.nonce !== original.nonce ||
        identity.email_verified !== "true" && identity.email_verified !== true ||
        typeof identity.sub !== "string" || typeof identity.email !== "string") {
      return fail("Identidade Google não validada.");
    }
    const response = NextResponse.redirect(target);
    response.cookies.set(GOOGLE_OAUTH_COOKIE, "", { ...googleSessionCookieOptions, maxAge: 0 });
    response.cookies.set(GOOGLE_SESSION_COOKIE, encodeGoogleSession(identity.sub, identity.email), {
      ...googleSessionCookieOptions, maxAge: 7 * 24 * 60 * 60,
    });
    return response;
  } catch {
    return fail("Falha temporária no login Google. Tente novamente.");
  }
}
