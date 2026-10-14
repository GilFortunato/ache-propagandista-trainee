import { NextResponse } from "next/server";
import { adminSession, validOrigin } from "@/lib/acheAdminAuth";
import { integrationStatus, removeProviderKey, saveProviderKey, testProviderKey, type Provider, vaultConfigured } from "@/lib/acheVercelSecrets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };

function provider(value: unknown): value is Provider {
  return value === "apify" || value === "gemini";
}

export async function GET() {
  if (!await adminSession()) return NextResponse.json({ error: "Acesso ADM necessário." }, { status: 401, headers });
  try {
    return NextResponse.json(await integrationStatus(), { headers });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Falha ao consultar integrações." }, { status: 503, headers });
  }
}

export async function POST(request: Request) {
  if (!await adminSession()) return NextResponse.json({ error: "Acesso ADM necessário." }, { status: 401, headers });
  if (!validOrigin(request)) return NextResponse.json({ error: "Origem inválida." }, { status: 403, headers });
  if (!vaultConfigured()) return NextResponse.json({
    error: "Configuração inicial pendente: cadastre ACHE_VERCEL_API_TOKEN no painel da Vercel e faça um novo deploy da produção.",
  }, { status: 503, headers });
  const body = await request.json().catch(() => null);
  if (!provider(body?.provider)) return NextResponse.json({ error: "Provedor inválido." }, { status: 400, headers });
  const action = body?.action;
  const key = typeof body?.key === "string" ? body.key.trim() : "";
  try {
    if (action === "save") {
      await saveProviderKey(body.provider, key);
      return NextResponse.json({ message: "Chave atualizada com segurança. O próximo diagnóstico já utilizará a nova credencial." }, { headers });
    }
    if (action === "remove") {
      await removeProviderKey(body.provider);
      return NextResponse.json({ message: "Chave removida. O diagnóstico não utilizará essa integração." }, { headers });
    }
    if (action === "test") {
      if (key.length > 1000) return NextResponse.json({ error: "Chave muito longa." }, { status: 400, headers });
      return NextResponse.json(await testProviderKey(body.provider, key || undefined), { headers });
    }
    return NextResponse.json({ error: "Ação inválida." }, { status: 400, headers });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível alterar a integração." }, { status: 503, headers });
  }
}
