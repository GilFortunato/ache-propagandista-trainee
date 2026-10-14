import "server-only";

export type Provider = "apify" | "gemini";
export const PROVIDERS: Record<Provider, string> = {
  apify: "ACHE_REBRAND_APIFY_TOKEN",
  gemini: "ACHE_REBRAND_GEMINI_API_KEY",
};

type RemoteVariable = { id: string; key: string; value?: string; target?: string[] | string; updatedAt?: number };
type RemoteList = { envs?: RemoteVariable[] };

export class VaultConfigurationError extends Error {
  constructor(message = "A integração segura com a Vercel ainda não foi configurada no servidor.") {
    super(message);
    this.name = "VaultConfigurationError";
  }
}

export function vaultConfigured() {
  return Boolean(
    (process.env.ACHE_VERCEL_API_TOKEN?.length ?? 0) > 15
    && process.env.ACHE_VERCEL_PROJECT_ID
    && process.env.ACHE_VERCEL_TEAM_ID,
  );
}

function config() {
  const token = process.env.ACHE_VERCEL_API_TOKEN;
  const project = process.env.ACHE_VERCEL_PROJECT_ID;
  const team = process.env.ACHE_VERCEL_TEAM_ID;
  if (!token || !project || !team) throw new VaultConfigurationError();
  return { token, project, team };
}

function endpoint(suffix = "", query = "") {
  const { project, team } = config();
  return "https://api.vercel.com/v10/projects/" + encodeURIComponent(project) + "/env" + suffix
    + "?teamId=" + encodeURIComponent(team) + (query ? "&" + query : "");
}

async function requestVercel(url: string, init: RequestInit = {}) {
  const { token } = config();
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    signal: AbortSignal.timeout(12000),
    cache: "no-store",
  });
  if (!response.ok) {
    console.error("[ache-integrations] Vercel API status", response.status);
    throw new Error(response.status === 401 || response.status === 403
      ? "A autorização da Vercel não tem permissão para ler ou atualizar as variáveis deste projeto."
      : "Não foi possível acessar as credenciais do projeto na Vercel.");
  }
  return response;
}

async function getVariables(): Promise<RemoteVariable[]> {
  const response = await requestVercel(endpoint("", "decrypt=true"));
  const body = await response.json() as RemoteList;
  if (!Array.isArray(body?.envs)) throw new Error("A Vercel retornou uma lista de configurações inválida.");
  return body.envs.filter((item) => item && (Array.isArray(item.target) ? item.target.includes("production") : item.target === "production"));
}

function newest(variables: RemoteVariable[], key: string) {
  return variables.filter((item) => item.key === key).sort((a,b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0] || null;
}

export async function integrationStatus() {
  if (!vaultConfigured()) {
    return {
      connected: false,
      apify: { configured: Boolean(process.env.ACHE_REBRAND_APIFY_TOKEN), origin: "deployment" },
      gemini: { configured: Boolean(process.env.ACHE_REBRAND_GEMINI_API_KEY), origin: "deployment" },
    };
  }
  const vars = await getVariables();
  const summarize = (provider: Provider) => {
    const item = newest(vars, PROVIDERS[provider]);
    return {
      configured: Boolean(item && typeof item.value === "string" && item.value.length >= 8),
      origin: "vercel",
      updatedAt: item?.updatedAt ? new Date(item.updatedAt).toISOString() : null,
    };
  };
  return { connected: true, apify: summarize("apify"), gemini: summarize("gemini") };
}

export async function resolveProviderKey(provider: Provider) {
  // When the live vault exists, it is authoritative. Never fall back to a stale
  // value from a previous deployment after a key has been removed.
  if (!vaultConfigured()) return process.env[PROVIDERS[provider]] || null;
  const vars = await getVariables();
  const value = newest(vars, PROVIDERS[provider])?.value;
  return typeof value === "string" && value.length >= 8 ? value : null;
}

export async function saveProviderKey(provider: Provider, value: string) {
  if (!vaultConfigured()) throw new VaultConfigurationError();
  const key = PROVIDERS[provider];
  if (!value || value.trim().length < 12 || value.length > 1000) throw new Error("A chave precisa ter entre 12 e 1000 caracteres.");
  // Upsert changes the credential immediately in the management API. The
  // diagnostic reads it live, without waiting for another build or deployment.
  await requestVercel(endpoint("", "upsert=true"), {
    method: "POST",
    body: JSON.stringify({ key, value: value.trim(), type: "encrypted", target: ["production"] }),
  });
}

export async function removeProviderKey(provider: Provider) {
  if (!vaultConfigured()) throw new VaultConfigurationError();
  const vars = await getVariables();
  const item = newest(vars, PROVIDERS[provider]);
  if (!item) return;
  // The deletion endpoint is version 9, unlike list and create (v10).
  const { project, team } = config();
  const url = "https://api.vercel.com/v9/projects/" + encodeURIComponent(project) + "/env/"
    + encodeURIComponent(item.id) + "?teamId=" + encodeURIComponent(team);
  await requestVercel(url, { method: "DELETE" });
}

export type ProviderHealth = {
  status: "connected" | "disconnected" | "not_configured";
  ok: boolean;
  message: string;
  checkedAt: string;
};

// This validates provider authentication/endpoint reachability, not a paid
// LinkedIn extraction or a billed Gemini content generation.
export async function testProviderKey(provider: Provider, candidate?: string): Promise<ProviderHealth> {
  const checkedAt = new Date().toISOString();
  let key: string | null;
  try {
    key = candidate || await resolveProviderKey(provider);
  } catch {
    return {
      status: "disconnected",
      ok: false,
      message: "Não foi possível consultar a chave salva. Verifique o acesso do projeto às variáveis na Vercel.",
      checkedAt,
    };
  }

  if (!key) return {
    status: "not_configured",
    ok: false,
    message: "Nenhuma chave cadastrada. Salve uma credencial antes de reconectar.",
    checkedAt,
  };

  const selectedGeminiModel = process.env.ACHE_REBRAND_GEMINI_MODEL || "gemini-2.5-flash";
  const geminiModel = selectedGeminiModel.replace(/^models\\//, "");
  const validGeminiModel = /^[a-zA-Z0-9._-]+$/.test(geminiModel) ? geminiModel : "gemini-2.5-flash";
  const url = provider === "apify"
    ? "https://api.apify.com/v2/users/me"
    : "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(validGeminiModel);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: provider === "apify" ? { Authorization: "Bearer " + key } : { "x-goog-api-key": key },
      signal: AbortSignal.timeout(12000),
      cache: "no-store",
    });
    if (response.ok) return {
      status: "connected",
      ok: true,
      message: provider === "apify"
        ? "Autenticação confirmada pela API do Apify."
        : "Autenticação e acesso ao modelo " + validGeminiModel + " confirmados.",
      checkedAt,
    };
    const message = response.status === 401 || response.status === 403
      ? "Credencial recusada ou sem permissão para acessar o serviço."
      : response.status === 404 && provider === "gemini"
        ? "O modelo " + validGeminiModel + " não foi encontrado para esta chave."
        : response.status === 429
          ? "O provedor limitou as solicitações. Tente novamente mais tarde."
          : "O provedor retornou HTTP " + response.status + " ao verificar a conexão.";
    return { status: "disconnected", ok: false, message, checkedAt };
  } catch {
    return {
      status: "disconnected",
      ok: false,
      message: "Não foi possível acessar o provedor. Verifique a disponibilidade da API e tente novamente.",
      checkedAt,
    };
  }
}

export async function reconnectAllProviders(): Promise<Record<Provider, ProviderHealth>> {
  const [apify, gemini] = await Promise.all([testProviderKey("apify"), testProviderKey("gemini")]);
  return { apify, gemini };
}
