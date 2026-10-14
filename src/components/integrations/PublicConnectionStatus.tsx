"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, CircleHelp, RefreshCcw } from "lucide-react";

type Provider = "apify" | "gemini";
type Connection = {
  status: "connected" | "disconnected" | "not_configured";
  message: string;
  checkedAt: string;
};
type HealthResponse = {
  providers: Record<Provider, Connection>;
  refreshSeconds: number;
};

const services: { id: Provider; name: string; description: string }[] = [
  { id: "apify", name: "LinkedIn (Apify)", description: "Leitura de perfis públicos" },
  { id: "gemini", name: "Inteligência artificial (Gemini)", description: "Análise e recomendações" },
];

function connectionLabel(status: Connection["status"] | "checking" | "unknown") {
  switch (status) {
    case "connected": return "Conexão OK";
    case "disconnected": return "Indisponível";
    case "not_configured": return "Não configurada";
    case "checking": return "Verificando...";
    default: return "Aguardando teste";
  }
}

function ConnectionBadge({ status }: { status: Connection["status"] | "checking" | "unknown" }) {
  const Icon = status === "connected" ? CheckCircle2 : status === "disconnected" ? AlertCircle : CircleHelp;
  return <span className={"achePublicConnectionBadge achePublicConnection-" + status} role="status">
    <Icon size={15} aria-hidden="true" /> {connectionLabel(status)}
  </span>;
}

export function PublicConnectionStatus({ compact = false }: { compact?: boolean }) {
  const [health, setHealth] = useState<Record<Provider, Connection | null>>({ apify: null, gemini: null });
  const [loading, setLoading] = useState<Record<Provider, boolean>>({ apify: false, gemini: false });
  const [error, setError] = useState("");

  async function reconnect(provider?: Provider) {
    setError("");
    const providers: Provider[] = provider ? [provider] : ["apify", "gemini"];
    setLoading((old) => ({ ...old, ...Object.fromEntries(providers.map((id) => [id, true])) }));
    try {
      // This GET is shared and server-cached for 30 seconds to prevent
      // visitors repeatedly querying providers or burning API quota.
      const response = await fetch("/api/integrations/health", { cache: "no-store" });
      const result = await response.json() as HealthResponse & { error?: string };
      if (!response.ok) throw new Error(result.error || "Não foi possível consultar as conexões.");
      if (!result.providers?.apify || !result.providers?.gemini) throw new Error("Resposta incompleta do servidor.");
      setHealth((old) => provider
        ? { ...old, [provider]: result.providers[provider] }
        : result.providers);
    } catch (err) {
      const message = err instanceof Error ? err.message : "O teste de conexão falhou.";
      setError(message);
      setHealth((old) => ({
        ...old,
        ...Object.fromEntries(providers.map((id) => [id, {
          status: "disconnected",
          message: "Não foi possível consultar o status agora.",
          checkedAt: new Date().toISOString(),
        }])),
      }));
    } finally {
      setLoading((old) => ({ ...old, ...Object.fromEntries(providers.map((id) => [id, false])) }));
    }
  }

  useEffect(() => {
    void reconnect();
    // Initial connection test runs once when the shared widget mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isBusy = loading.apify || loading.gemini;
  const readyCount = services.filter((service) => health[service.id]?.status === "connected").length;
  const checked = services.every((service) => health[service.id] !== null);

  return (
    <section className={"achePublicConnections" + (compact ? " achePublicConnectionsCompact" : "")} aria-label="Status das conexões do programa">
      <div className="achePublicConnectionsHeader">
        <div>
          <span className="achePublicConnectionsEyebrow">Disponível para todos os participantes</span>
          <h2>Conexões do programa</h2>
          <p>{checked ? readyCount + " de 2 serviços conectados" : "Verificando Apify e Gemini..."}</p>
        </div>
        <button type="button" className="achePublicReconnectAll" disabled={isBusy} onClick={() => void reconnect()}>
          <RefreshCcw size={17} className={isBusy ? "achePublicSpin" : undefined} aria-hidden="true" />
          {isBusy ? "Verificando..." : "Reconectar todos"}
        </button>
      </div>
      <div className="achePublicConnectionsGrid">
        {services.map((service) => {
          const current = health[service.id];
          const pending = loading[service.id];
          return <article className="achePublicConnectionCard" key={service.id}>
            <div className="achePublicConnectionTop">
              <div><h3>{service.name}</h3><p>{service.description}</p></div>
              <ConnectionBadge status={pending ? "checking" : (current?.status || "unknown")} />
            </div>
            <p className="achePublicConnectionMessage">{pending ? "Consultando o serviço..." : current?.message || "Aguardando verificação."}</p>
            <div className="achePublicConnectionFooter">
              {current?.checkedAt && <small>Verificado: {new Date(current.checkedAt).toLocaleString("pt-BR")}</small>}
              <button type="button" disabled={isBusy} onClick={() => void reconnect(service.id)}>
                <RefreshCcw size={15} aria-hidden="true" /> Reconectar
              </button>
            </div>
          </article>;
        })}
      </div>
      {error && <p className="achePublicConnectionError" role="alert">{error}</p>}
      <p className="achePublicConnectionsNote">
        Essas conexões são compartilhadas pelo programa. Reconectar verifica novamente a disponibilidade; não muda sua conta ou as chaves de acesso. O resultado pode permanecer em cache por até 30 segundos. Se continuar indisponível, avise a equipe do Aché.
      </p>
    </section>
  );
}
