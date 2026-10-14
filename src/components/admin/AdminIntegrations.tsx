"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, KeyRound, RefreshCcw, ShieldCheck, Trash2, LogOut } from "lucide-react";

type Provider = "apify" | "gemini";
type Status = { configured: boolean; origin: string; updatedAt?: string | null };
type Data = { connected: boolean; apify: Status; gemini: Status };

const services: { id: Provider; title: string; description: string; hint: string }[] = [
  { id: "apify", title: "Apify", description: "Coleta dados públicos de perfis do LinkedIn usados no diagnóstico.", hint: "Token de API da conta Apify" },
  { id: "gemini", title: "Gemini", description: "Gera a leitura textual e recomendações de desenvolvimento profissional.", hint: "Chave de API do Google AI Studio" },
];

export default function AdminIntegrations() {
  const [data, setData] = useState<Data | null>(null);
  const [keys, setKeys] = useState<Record<Provider,string>>({ apify: "", gemini: "" });
  const [busy, setBusy] = useState<Provider | null>(null);
  const [notice, setNotice] = useState<Record<Provider,string>>({ apify: "", gemini: "" });
  const [globalError, setGlobalError] = useState("");
  const [show, setShow] = useState<Record<Provider,boolean>>({ apify: false, gemini: false });

  async function refresh() {
    const response = await fetch("/api/admin/integrations", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result?.error || "Falha ao consultar integrações.");
    setData(result);
  }
  useEffect(() => {
    void refresh().catch((error) => setGlobalError(error instanceof Error ? error.message : "Não foi possível carregar integrações."));
  }, []);

  async function change(provider: Provider, action: "save" | "remove" | "test") {
    if (busy) return;
    if (action === "save" && keys[provider].trim().length < 12) {
      setNotice((old) => ({ ...old, [provider]: "Cole uma chave válida para salvar." }));
      return;
    }
    if (action === "remove" && !window.confirm("Remover esta chave? A integração ficará indisponível até cadastrar outra.")) return;
    setBusy(provider);
    setNotice((old) => ({ ...old, [provider]: "" }));
    try {
      const response = await fetch("/api/admin/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, action, key: keys[provider] }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Não foi possível executar a operação.");
      setNotice((old) => ({ ...old, [provider]: result.message || (result.ok ? "Conexão validada." : result.message || "Conexão não validada.") }));
      if (action !== "test") {
        setKeys((old) => ({ ...old, [provider]: "" }));
        await refresh();
      }
    } catch (error) {
      setNotice((old) => ({ ...old, [provider]: error instanceof Error ? error.message : "Falha ao conectar." }));
    } finally {
      setBusy(null);
    }
  }

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    window.location.replace("/admin/login");
  }

  return (
    <section className="acheAdminIntegrations">
      <div className="acheAdminIntHeader">
        <div>
          <span className="acheAdminKicker"><ShieldCheck size={16} /> Configuração protegida</span>
          <h2>Integrações e chaves de API</h2>
          <p>Cadastre ou troque as credenciais do Apify e do Gemini. Nunca exibimos novamente uma chave armazenada.</p>
        </div>
        <button className="acheAdminLogout" onClick={() => void logout()}><LogOut size={16} /> Sair do ADM</button>
      </div>

      {data && !data.connected && (
        <div className="acheAdminSetup" role="status">
          <strong>Ativação inicial necessária</strong>
          <p>A proteção por senha já está pronta. Para salvar e trocar chaves por aqui, configure uma única vez a variável <code>ACHE_VERCEL_API_TOKEN</code> nas variáveis de ambiente de produção da Vercel e faça um redeploy. Use um token com acesso apenas ao escopo necessário do projeto.</p>
          <a href="https://vercel.com/gilfortunatos-projects/ache-propagandista-trainee/settings/environment-variables" target="_blank" rel="noreferrer">Abrir configurações da Vercel <ExternalLink size={15} /></a>
        </div>
      )}
      {globalError && <p className="acheAdminGlobalError" role="alert">{globalError}</p>}
      <div className="acheAdminServices">
        {services.map((service) => {
          const status = data?.[service.id];
          return (
            <article key={service.id} className="acheAdminService">
              <div className="acheAdminServiceTitle">
                <span className="acheAdminKeyIcon"><KeyRound size={22} /></span>
                <div><h3>{service.title}</h3><p>{service.description}</p></div>
                {status?.configured ? <span className="acheAdminConnected"><CheckCircle2 size={14} /> Cadastrada</span> : <span className="acheAdminDisconnected">Sem chave</span>}
              </div>
              <label htmlFor={"ache-" + service.id + "-key"}>Nova chave {service.title}</label>
              <div className="acheAdminSecretInput">
                <input id={"ache-" + service.id + "-key"} type={show[service.id] ? "text" : "password"}
                  autoComplete="off" spellCheck={false} placeholder={status?.configured ? "Cole aqui para substituir a chave atual" : service.hint}
                  value={keys[service.id]}
                  onChange={(event) => setKeys((old) => ({ ...old, [service.id]: event.target.value }))} />
                <button type="button" aria-label={show[service.id] ? "Ocultar chave digitada" : "Mostrar chave digitada"} onClick={() => setShow((old) => ({ ...old, [service.id]: !old[service.id] }))}>
                  {show[service.id] ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              <div className="acheAdminActions">
                <button className="acheAdminSave" type="button" disabled={Boolean(busy) || !data?.connected} onClick={() => void change(service.id,"save")}>
                  <KeyRound size={15} /> {busy === service.id ? "Processando..." : status?.configured ? "Substituir chave" : "Salvar chave"}
                </button>
                <button type="button" disabled={Boolean(busy) || !data?.connected} onClick={() => void change(service.id,"test")}><RefreshCcw size={15} /> Testar conexão</button>
                {status?.configured && <button className="acheAdminRemove" type="button" disabled={Boolean(busy) || !data?.connected} onClick={() => void change(service.id,"remove")}><Trash2 size={15} /> Remover</button>}
              </div>
              {status?.updatedAt && <p className="acheAdminUpdated">Última alteração: {new Date(status.updatedAt).toLocaleString("pt-BR")}</p>}
              {notice[service.id] && <p className="acheAdminNotice" role="status">{notice[service.id]}</p>}
            </article>
          );
        })}
      </div>
      <div className="acheAdminFootnote">
        <ShieldCheck size={18} />
        <p>As chaves são gravadas como variáveis criptografadas de produção na Vercel. Somente a sessão administrativa pode alterar essas credenciais. Novos diagnósticos consultam a versão atual sem precisar publicar código novo.</p>
      </div>
    </section>
  );
}
