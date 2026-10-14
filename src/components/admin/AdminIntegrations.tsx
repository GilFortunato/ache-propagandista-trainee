"use client";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, ExternalLink, KeyRound, RefreshCcw, ShieldCheck, Trash2, LogOut, CircleHelp } from "lucide-react";

type Provider = "apify" | "gemini";
type ProviderStatus = { configured: boolean; origin: string; updatedAt?: string | null };
type Data = { connected: boolean; apify: ProviderStatus; gemini: ProviderStatus };
type Health = {
  status: "connected" | "disconnected" | "not_configured";
  ok: boolean;
  message: string;
  checkedAt: string;
};

const services: { id: Provider; title: string; description: string; hint: string }[] = [
  { id: "apify", title: "Apify", description: "Coleta dados públicos de perfis do LinkedIn usados no diagnóstico.", hint: "Token de API da conta Apify" },
  { id: "gemini", title: "Gemini", description: "Gera a leitura textual e recomendações de desenvolvimento profissional.", hint: "Chave de API do Google AI Studio" },
];

async function postAction(payload: Record<string, unknown>) {
  const response = await fetch("/api/admin/integrations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result?.error || "Não foi possível acessar a integração.");
  return result;
}

function StatusIndicator({ health, checking }: { health: Health | null; checking: boolean }) {
  const status = checking ? "checking" : (health?.status || "unchecked");
  const label = status === "checking" ? "Verificando..."
    : status === "connected" ? "Conexão OK"
    : status === "disconnected" ? "Falha de conexão"
    : status === "not_configured" ? "Sem chave"
    : "Não verificada";
  const Icon = status === "connected" ? CheckCircle2 : status === "disconnected" ? AlertCircle : CircleHelp;
  return <span className={"acheAdminHealthBadge acheAdminHealth-" + status} role="status"><Icon size={15} />{label}</span>;
}

export default function AdminIntegrations() {
  const [data, setData] = useState<Data | null>(null);
  const [keys, setKeys] = useState<Record<Provider, string>>({ apify: "", gemini: "" });
  const [busy, setBusy] = useState<Provider | null>(null);
  const [notice, setNotice] = useState<Record<Provider, string>>({ apify: "", gemini: "" });
  const [globalError, setGlobalError] = useState("");
  const [show, setShow] = useState<Record<Provider, boolean>>({ apify: false, gemini: false });
  const [health, setHealth] = useState<Record<Provider, Health | null>>({ apify: null, gemini: null });
  const [checking, setChecking] = useState<Record<Provider, boolean>>({ apify: false, gemini: false });
  const [checkingAll, setCheckingAll] = useState(false);

  async function refresh() {
    const response = await fetch("/api/admin/integrations", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result?.error || "Falha ao consultar integrações.");
    setData(result as Data);
  }

  async function reconnectAll() {
    setCheckingAll(true);
    setChecking({ apify: true, gemini: true });
    setGlobalError("");
    try {
      const result = await postAction({ action: "reconnect_all" }) as { providers: Record<Provider, Health> };
      setHealth(result.providers);
    } catch (error) {
      setGlobalError(error instanceof Error ? error.message : "Falha ao verificar as conexões.");
      setHealth({ apify: null, gemini: null });
    } finally {
      setCheckingAll(false);
      setChecking({ apify: false, gemini: false });
    }
  }

  useEffect(() => {
    // First display saved-key metadata, then verify live provider health.
    void refresh().catch((error) => {
      setGlobalError(error instanceof Error ? error.message : "Não foi possível carregar as integrações.");
    }).finally(() => { void reconnectAll(); });
    // This startup check intentionally runs only once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function reconnectOne(provider: Provider) {
    if (busy || checkingAll || checking[provider]) return;
    setChecking((old) => ({ ...old, [provider]: true }));
    setNotice((old) => ({ ...old, [provider]: "" }));
    try {
      const result = await postAction({ action: "reconnect", provider }) as Health;
      setHealth((old) => ({ ...old, [provider]: result }));
    } catch (error) {
      setHealth((old) => ({ ...old, [provider]: {
        status: "disconnected", ok: false, checkedAt: new Date().toISOString(),
        message: error instanceof Error ? error.message : "Não foi possível verificar a conexão.",
      } }));
    } finally {
      setChecking((old) => ({ ...old, [provider]: false }));
    }
  }

  async function change(provider: Provider, action: "save" | "remove" | "test") {
    if (busy || checkingAll || checking.apify || checking.gemini) return;
    if (action === "save" && keys[provider].trim().length < 12) {
      setNotice((old) => ({ ...old, [provider]: "Cole uma chave válida para salvar." }));
      return;
    }
    if (action === "test" && !keys[provider].trim()) {
      setNotice((old) => ({ ...old, [provider]: "Digite uma nova chave para testá-la ou use Reconectar para verificar a chave salva." }));
      return;
    }
    if (action === "remove" && !window.confirm("Remover esta chave? A integração ficará indisponível até cadastrar outra.")) return;
    setBusy(provider);
    setNotice((old) => ({ ...old, [provider]: "" }));
    try {
      const result = await postAction({ provider, action, key: keys[provider] });
      if (action === "test") {
        setNotice((old) => ({
          ...old, [provider]: (result.message || "Teste realizado.") + " Este teste não salva a chave digitada.",
        }));
        return;
      }
      setKeys((old) => ({ ...old, [provider]: "" }));
      await refresh();
      if (action === "remove") {
        setHealth((old) => ({ ...old, [provider]: {
          status: "not_configured", ok: false, checkedAt: new Date().toISOString(),
          message: "Chave removida. Cadastre uma nova para conectar.",
        } }));
        setNotice((old) => ({ ...old, [provider]: "Chave removida." }));
        return;
      }
      // After saving, immediately verify the actual stored credential, not the
      // text from the input, so that the displayed status means "connection OK".
      const status = await postAction({ action: "reconnect", provider }) as Health;
      setHealth((old) => ({ ...old, [provider]: status }));
      setNotice((old) => ({ ...old, [provider]: status.ok
        ? "Chave salva e conexão validada."
        : "Chave salva, mas a conexão ainda precisa de atenção." }));
    } catch (error) {
      setNotice((old) => ({ ...old, [provider]: error instanceof Error ? error.message : "Falha ao conectar." }));
      // Failed save/verification must not preserve a previous positive status.
      if (action === "save") setHealth((old) => ({ ...old, [provider]: null }));
    } finally {
      setBusy(null);
    }
  }

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    window.location.replace("/admin/login");
  }

  const connected = services.filter((service) => health[service.id]?.status === "connected").length;
  const tested = services.filter((service) => health[service.id] !== null).length;
  const anyChecking = checkingAll || checking.apify || checking.gemini || Boolean(busy);

  return (
    <section className="acheAdminIntegrations">
      <div className="acheAdminIntHeader">
        <div>
          <span className="acheAdminKicker"><ShieldCheck size={16} /> Configuração protegida</span>
          <h2>Integrações e chaves de API</h2>
          <p>Veja se cada conexão está funcionando e troque as credenciais do Apify e do Gemini quando precisar.</p>
        </div>
        <button className="acheAdminLogout" onClick={() => void logout()}><LogOut size={16} /> Sair do ADM</button>
      </div>

      <div className="acheAdminHealthOverview" aria-live="polite">
        <div>
          <strong>Saúde das integrações</strong>
          <p>{checkingAll ? "Conferindo Apify e Gemini..." : tested === 2
            ? connected + " de 2 conexões funcionando"
            : "Verifique as conexões para conferir o status atual."}</p>
          <small>Os testes consultam as APIs e não executam diagnósticos pagos.</small>
        </div>
        <button type="button" onClick={() => void reconnectAll()} disabled={anyChecking}>
          <RefreshCcw size={17} className={checkingAll ? "acheAdminSpin" : undefined} />
          {checkingAll ? "Reconectando..." : "Reconectar todos"}
        </button>
      </div>

      {data && !data.connected && (
        <div className="acheAdminSetup" role="status">
          <strong>Ativação inicial necessária para salvar ou remover chaves</strong>
          <p>Você pode verificar as chaves que já estiverem no ambiente. Para salvar e trocar chaves por aqui, configure a variável <code>ACHE_VERCEL_API_TOKEN</code> nas variáveis de ambiente de produção da Vercel e faça um redeploy.</p>
          <a href="https://vercel.com/gilfortunatos-projects/ache-propagandista-trainee/settings/environment-variables" target="_blank" rel="noreferrer">Abrir configurações da Vercel <ExternalLink size={15} /></a>
        </div>
      )}

      {globalError && <p className="acheAdminGlobalError" role="alert">{globalError}</p>}
      <div className="acheAdminServices">
        {services.map((service) => {
          const saved = data?.[service.id];
          const currentHealth = health[service.id];
          return (
            <article key={service.id} className="acheAdminService">
              <div className="acheAdminServiceTitle">
                <span className="acheAdminKeyIcon"><KeyRound size={22} /></span>
                <div><h3>{service.title}</h3><p>{service.description}</p></div>
                <StatusIndicator health={currentHealth} checking={checking[service.id]} />
              </div>

              <div className="acheAdminConnectionDetail" aria-live="polite">
                <strong>{saved?.configured ? "Chave cadastrada" : "Chave não cadastrada"}</strong>
                <p>{checking[service.id] ? "Consultando a API..." : currentHealth?.message || "Aguardando verificação."}</p>
                {currentHealth?.checkedAt && !checking[service.id] && (
                  <small>Última verificação: {new Date(currentHealth.checkedAt).toLocaleString("pt-BR")}</small>
                )}
              </div>

              <label htmlFor={"ache-" + service.id + "-key"}>Nova chave {service.title}</label>
              <div className="acheAdminSecretInput">
                <input id={"ache-" + service.id + "-key"} type={show[service.id] ? "text" : "password"}
                  autoComplete="off" spellCheck={false} placeholder={saved?.configured ? "Cole aqui para substituir a chave atual" : service.hint}
                  value={keys[service.id]}
                  onChange={(event) => setKeys((old) => ({ ...old, [service.id]: event.target.value }))} />
                <button type="button" aria-label={show[service.id] ? "Ocultar chave digitada" : "Mostrar chave digitada"} onClick={() => setShow((old) => ({ ...old, [service.id]: !old[service.id] }))}>
                  {show[service.id] ? "Ocultar" : "Mostrar"}
                </button>
              </div>

              <div className="acheAdminActions">
                <button type="button" className="acheAdminReconnect" disabled={anyChecking} onClick={() => void reconnectOne(service.id)}>
                  <RefreshCcw size={15} className={checking[service.id] ? "acheAdminSpin" : undefined} /> Reconectar
                </button>
                <button className="acheAdminSave" type="button" disabled={anyChecking || !data?.connected} onClick={() => void change(service.id, "save")}>
                  <KeyRound size={15} /> {busy === service.id ? "Processando..." : saved?.configured ? "Substituir chave" : "Salvar chave"}
                </button>
                <button type="button" disabled={anyChecking || !keys[service.id].trim()} onClick={() => void change(service.id, "test")}>
                  <CheckCircle2 size={15} /> Testar nova chave
                </button>
                {saved?.configured && <button className="acheAdminRemove" type="button" disabled={anyChecking || !data?.connected} onClick={() => void change(service.id, "remove")}>
                  <Trash2 size={15} /> Remover
                </button>}
              </div>
              {saved?.updatedAt && <p className="acheAdminUpdated">Última alteração da chave: {new Date(saved.updatedAt).toLocaleString("pt-BR")}</p>}
              {notice[service.id] && <p className="acheAdminNotice" role="status">{notice[service.id]}</p>}
            </article>
          );
        })}
      </div>
      <div className="acheAdminFootnote">
        <ShieldCheck size={18} />
        <p><strong>Reconectar</strong> testa a autenticação e o acesso ao serviço; não altera as chaves nem executa extração de LinkedIn ou geração de conteúdo. Uma conexão OK não garante que uma execução futura esteja livre de limites de quota, cobrança ou falhas temporárias.</p>
      </div>
    </section>
  );
}
