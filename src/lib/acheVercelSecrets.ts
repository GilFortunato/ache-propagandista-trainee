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
type ApiError = {
  status?: unknown;
  message?: unknown;
  details?: Array<{ reason?: unknown }>;
};

function safeApiError(raw: unknown): ApiError {
  if (!raw || typeof raw !== "object") return {};
  const error = (raw as { error?: unknown }).error;
  return error && typeof error === "object" ? error as ApiError : {};
}

/**
 * Maps third-party errors to actionable, fixed messages in Portuguese.
 * Never reflect raw provider responses or API keys back to the browser.
 */
function providerFailure(provider: Provider, code: number, error: ApiError): string {
  if (provider === "apify") {
    if (code === 401) return "Token de API Apify inválido ou revogado. No Apify Console, vá em Settings > API & Integrations, copie um API token ativo e substitua a chave aqui.";
    if (code === 403) return "A Apify reconheceu a requisição, mas recusou a permissão. Confira se o token da conta tem acesso à API.";
    if (code === 429) return "Limite de chamadas da Apify atingido. Aguarde e tente reconectar.";
    if (code >= 500) return "Serviço Apify temporariamente indisponível. Tente novamente em alguns minutos.";
    return "A Apify recusou o teste (HTTP " + code + "). Cadastre o token de API da conta, não o ID de um Actor.";
  }

  const providerStatus = typeof error.status === "string" ? error.status.toUpperCase() : "";
  const providerMessage = typeof error.message === "string" ? error.message.toLowerCase() : "";
  const reasons = Array.isArray(error.details)
    ? error.details.map((detail) => typeof detail?.reason === "string" ? detail.reason.toUpperCase() : "")
    : [];

  if (
    reasons.some((reason) => /API_KEY_INVALID|API_KEY_EXPIRED|INVALID_API_KEY/.test(reason))
    || /api key not valid|api key is invalid|invalid api key|api_key_invalid|key has expired/.test(providerMessage)
  ) return "Chave Gemini inválida ou expirada. Gere uma nova chave de API em aistudio.google.com/api-keys e substitua a chave cadastrada.";

  if (
    reasons.some((reason) => /API_KEY_LEAKED|API_KEY_REPORTED|API_KEY_BLOCKED/.test(reason))
    || /api key was reported as leaked|key was blocked|blocked api key/.test(providerMessage)
  ) return "Esta chave Gemini foi bloqueada pelo Google. Gere uma nova chave de API no Google AI Studio.";

  if (
    reasons.some((reason) => /API_KEY_HTTP_REFERRER_BLOCKED|API_KEY_IP_ADDRESS_BLOCKED|API_KEY_SERVICE_BLOCKED|API_KEY_(ANDROID|IOS)_APP_BLOCKED/.test(reason))
    || /requests from referer|ip address.*not allowed|api key.*restriction|api key.*not authorized/.test(providerMessage)
  ) return "As restrições desta chave impedem o acesso do servidor. No Google AI Studio, verifique se ela é uma chave para a Gemini API e se suas restrições permitem chamadas do backend.";

  if (providerStatus === "SERVICE_DISABLED" || /api has not been used in project|it is disabled|api.*not enabled/.test(providerMessage))
    return "A API Generative Language (Gemini) está desativada para o projeto da chave. Habilite-a no Google Cloud/AI Studio e tente novamente.";

  if (providerStatus === "FAILED_PRECONDITION" || /billing.*(not enabled|disabled|required)|project.*not active/.test(providerMessage))
    return "O projeto Google desta chave não atende a um pré-requisito (como faturamento ou ativação da API). Confira o projeto no Google AI Studio.";

  if (code === 401 || code === 403 || providerStatus === "PERMISSION_DENIED")
    return "A Gemini API recusou a credencial ou suas permissões (HTTP " + code + "). Gere uma chave de API válida no Google AI Studio e confira as restrições.";

  if (code === 404)
    return "O modelo Gemini configurado não está disponível para esta chave. Verifique o modelo habilitado no Google AI Studio.";

  if (code === 429 || providerStatus === "RESOURCE_EXHAUSTED")
    return "A cota da API Gemini foi atingida. Confira os limites e o faturamento do projeto.";

  if (code >= 500) return "O serviço Gemini está temporariamente indisponível. Tente novamente.";

  if (code === 400)
    return "A API Gemini retornou HTTP 400: chave, projeto ou parâmetros da chamada não aceitos. Confira se a chave é do Google AI Studio, se a API está habilitada e se o modelo está acessível.";

  return "A Gemini API recusou o teste (HTTP " + code + "). Confira a chave, o projeto e as permissões no Google AI Studio.";
}

export async function testProviderKey(provider: Provider, candidate?: string): Promise<ProviderHealth> {
  const checkedAt = new Date().toISOString();
  let key: string | null;
  try {
    key = candidate || await resolveProviderKey(provider);
  } catch {
    return {
      status: "disconnected",
      ok: false,
      message: "A chave foi salva, mas o servidor não conseguiu consultar a credencial na Vercel. Verifique o token de gerenciamento do projeto.",
      checkedAt,
    };
  }

  if (!key) {
    return { status: "not_configured", ok: false, message: "Chave não cadastrada.", checkedAt };
  }

  // New Google AI Studio projects can no longer access legacy 2.5 models.
  // Keep the analysis and connection probe on the same supported default.
  const configuredModel = process.env.ACHE_REBRAND_GEMINI_MODEL || "gemini-3.8-flash";
  const geminiModel = configuredModel.startsWith("models/") ? configuredModel.slice(7) : configuredModel;
  const validGeminiModel = /^[a-zA-Z0-9._-]+$/.test(geminiModel) ? geminiModel : "gemini-3.8-flash";

  const url = provider === "apify"
    ? "https://api.apify.com/v2/users/me"
    : "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(validGeminiModel);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: provider === "apify"
        ? { Authorization: "Bearer " + key }
        : { "x-goog-api-key": key },
      signal: AbortSignal.timeout(12000),
      cache: "no-store",
    });

    if (response.ok) {
      return {
        status: "connected",
        ok: true,
        message: provider === "apify"
          ? "Apify online: token validado pela API."
          : "Gemini online: chave autenticada e modelo " + validGeminiModel + " acessível.",
        checkedAt,
      };
    }

    // A 400 can represent invalid key, denied origin, disabled API, etc.
    // Read only structured error codes and map them to fixed safe messages.
    const raw: unknown = await response.json().catch(() => null);
    const message = providerFailure(provider, response.status, safeApiError(raw));
    return { status: "disconnected", ok: false, message, checkedAt };
  } catch {
    return {
      status: "disconnected",
      ok: false,
      message: "Falha de conexão ou tempo limite ao acessar o provedor. Tente novamente em instantes.",
      checkedAt,
    };
  }
}

export async function reconnectAllProviders(): Promise<Record<Provider, ProviderHealth>> {
  const [apify, gemini] = await Promise.all([testProviderKey("apify"), testProviderKey("gemini")]);
  return { apify, gemini };
}
