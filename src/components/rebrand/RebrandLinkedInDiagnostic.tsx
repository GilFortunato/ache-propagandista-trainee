"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Activity, ArrowRight, CheckCircle2, Link2, LoaderCircle, Sparkles, Target, UserRoundPen } from "lucide-react";

type Dimension = { key: string; label: string; weight: number; score: number | null; status: "evaluated" | "not_evaluated"; rationale: string; evidence: string[]; action: string };
type DevelopmentWeek = { week: number; title: string; focus: string; actions: string[] };
type RebrandResult = {
  profileName?: string;
  headline?: string;
  overallScore: number | null;
  scoreCoverage: number;
  dataOrigin: "linkedin" | "manual";
  aiUsed: boolean;
  limitations: string[];
  collected: { profile: boolean; posts: boolean; experiences: number; education: number };
  developmentPlan: DevelopmentWeek[];
  generatedAt: string;
  classification: string;
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  dimensions: Dimension[];
  nextBestAction: { title: string; reason: string; actions: string[] };
  source: "linkedin+ai" | "linkedin+local" | "manual+ai" | "manual+local";
};

export function RebrandLinkedInDiagnostic() {
  const [profileUrl, setProfileUrl] = useState("");
  const [objective, setObjective] = useState("Fortalecer meu posicionamento profissional para oportunidades como Propagandista Trainee, destacando comunicação, relacionamento, conhecimento em saúde, capacidade de aprendizado e orientação para resultados.");
  const [manualContext, setManualContext] = useState("");
  const [result, setResult] = useState<RebrandResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [taskId, setTaskId] = useState<string | null>(null);
  const [quota, setQuota] = useState<{ authenticated: boolean; owner?: boolean; remaining: number | null; storageReady?: boolean; googleReady?: boolean } | null>(null);
  const [processing, setProcessing] = useState(false);

  const valid = useMemo(() => /^https:\/\/(?:www\.)?linkedin\.com\/in\/[^\s/?#]+\/?(?:[?#].*)?$/i.test(profileUrl.trim()) && objective.trim().length >= 10, [profileUrl, objective]);

  async function loadQuota() {
    try {
      const response = await fetch("/api/rebrand/quota", { cache: "no-store" });
      const status = await response.json();
      setQuota(status);
    } catch {
      setQuota(null);
    }
  }

  useEffect(() => {
    void loadQuota();
    const saved = window.sessionStorage.getItem("ache-manus-active-task");
    if (saved && /^[a-zA-Z0-9_-]{8,120}$/.test(saved)) {
      setTaskId(saved);
      setProcessing(true);
    }
  }, []);

  useEffect(() => {
    if (!taskId) return;
    let alive = true;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const poll = async () => {
      try {
        const response = await fetch("/api/rebrand/linkedin?taskId=" + encodeURIComponent(taskId), { cache: "no-store" });
        const payload = await response.json();
        if (!alive) return;
        if (!response.ok) throw new Error(payload?.error || "Falha ao acompanhar a pesquisa.");
        if (payload.state === "complete" && payload.result) {
          setResult(payload.result as RebrandResult);
          setTaskId(null);
          setProcessing(false);
          window.sessionStorage.removeItem("ache-manus-active-task");
          void loadQuota();
          return;
        }
        if (payload.state === "failed") {
          setError(payload.error || "O Manus não conseguiu obter evidências suficientes.");
          setTaskId(null);
          setProcessing(false);
          window.sessionStorage.removeItem("ache-manus-active-task");
          void loadQuota();
          return;
        }
      } catch (error) {
        if (!alive) return;
        setError(error instanceof Error ? error.message : "Não foi possível acompanhar a pesquisa.");
        // Keep the task ID: the provider may still be working. The participant
        // can retry by reloading without creating/charging another task.
      }
      if (alive) timeout = setTimeout(poll, 8000);
    };
    void poll();
    return () => { alive = false; if (timeout) clearTimeout(timeout); };
  }, [taskId]);

  function run() {
    if (!valid) {
      setError("Informe uma URL válida do LinkedIn e mantenha um objetivo profissional claro.");
      return;
    }
    if (!quota?.authenticated) {
      setError("Entre com sua conta Google para iniciar a pesquisa.");
      return;
    }
    if (!quota.owner && quota.remaining === 0) {
      setError("Suas 3 tentativas terminaram. Não é possível iniciar outra pesquisa nesta conta.");
      return;
    }
    setError(null);
    setResult(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/rebrand/linkedin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Clicking the clearly described action opts in to the Manus/Gemini analysis.
          // The server still rejects requests without this explicit action signal.
          body: JSON.stringify({ profileUrl, objective, manualContext, consent: true }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error || "Não foi possível iniciar a pesquisa Manus.");
        if (payload.state !== "processing" || !payload.taskId) throw new Error("Resposta inesperada do Manus.");
        setProcessing(true);
        setTaskId(payload.taskId);
        window.sessionStorage.setItem("ache-manus-active-task", payload.taskId);
        void loadQuota();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível iniciar a pesquisa Manus.");
      }
    });
  }

  return (
    <div className="rebrandDiagnostic">
      <section className="rebrandFormCard">
        <div className="rebrandCardIcon"><UserRoundPen size={28}/></div>
        <span className="sectionTag acheTag">Diagnóstico LinkedIn com Manus</span>
        <h2>Como seu perfil comunica seu potencial para a carreira de Propagandista?</h2>
        <p>O Manus pesquisa fontes públicas do perfil; o Gemini organiza recomendações. Sem evidência verificável, não atribuímos nota. O objetivo é desenvolvimento profissional, não seleção de candidatos.</p>

        <label>
          URL do LinkedIn
          <div className="rebrandInputWrap"><Link2 size={18}/><input value={profileUrl} onChange={(e)=>setProfileUrl(e.target.value)} placeholder="https://www.linkedin.com/in/seu-perfil"/></div>
        </label>
        <label>
          Seu objetivo
          <textarea value={objective} onChange={(e)=>setObjective(e.target.value)} rows={4}/>
        </label>
        <label>
          Contexto opcional
          <textarea value={manualContext} onChange={(e)=>setManualContext(e.target.value)} rows={4} placeholder="Se a coleta do LinkedIn falhar, descreva sua trajetória real aqui para receber orientações qualitativas, sem nota. Ex.: experiências em atendimento, educação ou vendas."/>
        </label>

        <div className="rebrandQuotaInfo rebrandAttemptsNotice" role="status" aria-live="polite">
          {!quota
            ? "Consultando suas tentativas..."
            : !quota.authenticated
              ? "Faça login com Google para ter acesso às suas 3 tentativas."
              : quota.owner
                ? "Sua conta tem pesquisas ilimitadas."
                : typeof quota.remaining === "number"
                  ? quota.remaining === 0
                    ? "Suas 3 tentativas terminaram. Você não pode iniciar outras pesquisas."
                    : "Você tem " + quota.remaining + " de 3 tentativas disponíveis. Quando acabarem, não poderá fazer novas pesquisas."
                  : "Não foi possível consultar suas tentativas."}
          {quota && !quota.authenticated && <p><Link href="/login">Entrar com Google</Link></p>}
        </div>
        <p className="rebrandProcessingNotice">Ao clicar em “Gerar meu diagnóstico”, você solicita a pesquisa dos dados profissionais informados pelo Manus e a análise pelo Gemini.</p>
        {processing && <div className="rebrandQuotaInfo" role="status">O Manus está pesquisando. Isso pode levar alguns minutos. Você pode manter a página aberta; acompanhar a tarefa não consome outra pesquisa.</div>}
        {error && <div className="rebrandError" role="alert">{error}</div>}

        <button type="button" onClick={run} disabled={isPending || processing || !valid || !quota?.authenticated || (!quota.owner && quota.remaining === 0)} className="rebrandRun">
          {isPending || processing ? <><LoaderCircle className="spin" size={18}/> {processing ? "Pesquisando no Manus..." : "Iniciando pesquisa..."}</> : <>Gerar meu diagnóstico <ArrowRight size={18}/></>}
        </button>
      </section>

      <section className="rebrandResultArea">
        {!result ? (
          <div className="rebrandEmpty">
            <Sparkles size={36}/>
            <h3>Seu diagnóstico aparecerá aqui.</h3>
            <p>A leitura será orientada à construção de marca profissional para a jornada de Propagandista Trainee.</p>
          </div>
        ) : (
          <>
            <div className="rebrandEvidenceNotice" role="status">
              <div className="rebrandEvidenceTop">
                <div>
                  <strong>{result.dataOrigin === "linkedin" ? "Perfil público recuperado" : "LinkedIn não verificado"}</strong>
                  <p>{result.dataOrigin === "linkedin" ? "A avaliação usa exclusivamente evidências públicas recuperadas do perfil. O objetivo informado não aumenta a pontuação." : "Não foi possível coletar evidências do LinkedIn. As recomendações são qualitativas e não representam uma avaliação verificada do perfil."}</p>
                </div>
                <span>{result.scoreCoverage}% de cobertura</span>
              </div>
              <p className="rebrandEvidenceMeta">Fonte: {result.dataOrigin === "linkedin" ? "LinkedIn" : "Contexto informado manualmente"} · Interpretação: {result.aiUsed ? "IA com metodologia fixa" : "metodologia local"} · Experiências: {result.collected.experiences} · Publicações: {result.collected.posts ? "recuperadas" : "não recuperadas"}</p>
              {result.limitations.length ? <ul>{result.limitations.map((item) => <li key={item}>{item}</li>)}</ul> : null}
            </div>

            <div className="rebrandScoreCard">
              <div>
                <span className="sectionTag acheTag">Leitura geral</span>
                <h2>{result.profileName || "Seu perfil"}</h2>
                {result.headline && <p>{result.headline}</p>}
              </div>
              <div className="rebrandScore">{result.overallScore === null ? <><strong className="rebrandNoScore">N/A</strong><small>{result.classification}</small></> : <><strong>{result.overallScore}</strong><span>/100</span><small>{result.classification}</small></>}</div>
            </div>

            <div className="rebrandSummary"><Activity size={23}/><p>{result.summary}</p></div>

            <div className="rebrandDimensions">
              {result.dimensions.map((item) => (
                <article key={item.label}>
                  <div><strong>{item.label}</strong><span>{item.score === null ? "Não avaliado" : item.score + "/100"}</span></div>
                  {item.score !== null ? <div className="rebrandMeter"><i style={{width: item.score + "%"}}/></div> : null}
                  <p>{item.rationale}</p>
                  {item.evidence.length ? <div className="rebrandDimensionEvidence"><strong>Evidências</strong>{item.evidence.map((itemEvidence) => <p key={itemEvidence}>{itemEvidence}</p>)}</div> : null}
                  <small>{item.action}</small>
                </article>
              ))}
            </div>

            <div className="rebrandLists">
              <article><h3>Forças</h3>{result.strengths.map(x=><p key={x}><CheckCircle2 size={16}/>{x}</p>)}</article>
              <article><h3>Lacunas</h3>{result.gaps.map(x=><p key={x}><Target size={16}/>{x}</p>)}</article>
              <article><h3>Recomendações</h3>{result.recommendations.map(x=><p key={x}><ArrowRight size={16}/>{x}</p>)}</article>
            </div>

            <div className="rebrandNextAction">
              <span>Próximo melhor movimento</span>
              <h3>{result.nextBestAction.title}</h3>
              <p>{result.nextBestAction.reason}</p>
              <ol>{result.nextBestAction.actions.map(x=><li key={x}>{x}</li>)}</ol>
            </div>

            <section className="rebrandDevelopmentPlan">
              <div className="rebrandDevelopmentHeading">
                <div><span>PLANO DE DESENVOLVIMENTO</span><h3>Próximas quatro semanas</h3><p>Um roteiro de evolução do perfil e das competências profissionais, não um compromisso de contratação.</p></div>
                <button type="button" onClick={() => window.print()} className="rebrandPrintButton">Imprimir / salvar em PDF</button>
              </div>
              <div className="rebrandWeekGrid">
                {result.developmentPlan.map((week) => <article key={week.week}>
                  <span>Semana {week.week} · {week.focus}</span>
                  <h4>{week.title}</h4>
                  <ul>{week.actions.map((action) => <li key={action}>{action}</li>)}</ul>
                </article>)}
              </div>
            </section>
          </>
        )}
      </section>
    </div>
  );
}
