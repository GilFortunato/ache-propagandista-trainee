import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { adminSession } from "@/lib/acheAdminAuth";

export const GOOGLE_SESSION_COOKIE = "ache_google_session";
export const GOOGLE_OAUTH_COOKIE = "ache_google_oauth";
const MAX_SESSION_MS = 7 * 24 * 60 * 60 * 1000;

function secret() {
  return process.env.ACHE_AUTH_SESSION_SECRET;
}
export function googleAuthConfigured() {
  return Boolean(process.env.ACHE_GOOGLE_CLIENT_ID && process.env.ACHE_GOOGLE_CLIENT_SECRET &&
    process.env.ACHE_GOOGLE_REDIRECT_URI?.startsWith("https://") && (secret()?.length || 0) >= 32);
}
function sign(payload: string) {
  if (!secret()) throw new Error("Google auth is not configured");
  const key = secret();
  if (!key) throw new Error("Google auth is not configured");
  return createHmac("sha256", key).update(payload).digest("base64url");
}
function validSignature(payload: string, sig: string) {
  const a = Buffer.from(sig), b = Buffer.from(sign(payload));
  return a.length === b.length && timingSafeEqual(a,b);
}
type GoogleIdentity = { sub: string; email: string; exp: number };
export function encodeGoogleSession(sub: string, email: string) {
  const payload = Buffer.from(JSON.stringify({ sub, email, exp: Date.now() + MAX_SESSION_MS })).toString("base64url");
  return payload + "." + sign(payload);
}
export async function currentGoogleUser(): Promise<GoogleIdentity | null> {
  if (!googleAuthConfigured()) return null;
  const store = await cookies();
  const token = store.get(GOOGLE_SESSION_COOKIE)?.value;
  if (!token) return null;
  const pieces = token.split(".");
  if (pieces.length !== 2 || !validSignature(pieces[0], pieces[1])) return null;
  try {
    const data = JSON.parse(Buffer.from(pieces[0], "base64url").toString("utf8")) as GoogleIdentity;
    if (!data || typeof data.sub !== "string" || !/^[\dA-Za-z_-]{5,150}$/.test(data.sub) ||
        typeof data.email !== "string" || data.email.length > 254 ||
        !Number.isSafeInteger(data.exp) || data.exp < Date.now() || data.exp > Date.now() + MAX_SESSION_MS)
      return null;
    return data;
  } catch { return null; }
}
export async function currentResearchIdentity(): Promise<{ id: string; owner: boolean; email?: string } | null> {
  if (await adminSession()) return { id: "admin", owner: true };
  const user = await currentGoogleUser();
  if (!user) return null;
  const ownerEmail = process.env.ACHE_OWNER_GOOGLE_EMAIL?.trim().toLowerCase();
  return { id: "google:" + user.sub, email: user.email, owner: Boolean(ownerEmail && user.email.toLowerCase() === ownerEmail) };
}
export function createOAuthState() {
  const state = randomBytes(24).toString("base64url");
  const nonce = randomBytes(24).toString("base64url");
  const verifier = randomBytes(48).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ state, nonce, verifier, exp: Date.now() + 10 * 60 * 1000 })).toString("base64url");
  return { state, nonce, verifier, cookie: payload + "." + sign(payload) };
}
export function verifyOAuthState(value: string | undefined, state: string) {
  if (!value || !googleAuthConfigured()) return null;
  const pieces = value.split(".");
  if (pieces.length !== 2 || !validSignature(pieces[0], pieces[1])) return null;
  try {
    const data = JSON.parse(Buffer.from(pieces[0], "base64url").toString("utf8")) as {
      state: string; nonce: string; verifier: string; exp: number
    };
    if (!data || data.state !== state || data.exp < Date.now() || data.exp > Date.now() + 10 * 60 * 1000) return null;
    return data;
  } catch { return null; }
}
export const googleSessionCookieOptions = {
  httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/",
};
