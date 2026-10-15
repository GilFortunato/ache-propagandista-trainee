"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Activity, ArrowRight, CheckCircle2, Link2, LoaderCircle, Sparkles, Target, UserRoundPen } from "lucide-react";

type Dimension = { key: string; label: string; weight: number; score: number | null; status: "evaluated" | "not_evaluated"; rationale: string; evidence: string[]; action: string };
type DevelopmentWeek = { week: number; title: string; focus: string; actions: string[] };
type PlanDay = { day: number; phase: string; title: string; action: string; deliverable: string; minutes: number };
type Plan30Days = { title: string; objective: string; personalized: boolean; generatedWith: "gemini" | "guided"; days: PlanDay[] };
type CareerTransitionReview = {
  targetRole: string;
  headlineStatus: "aligned" | "partially_aligned" | "needs_repositioning" | "not_evaluated";
  headlineLabel: string;
  currentHeadline: string;
  explanation: string;
  transferableStrengths: string[];
  developmentPriorities: string[];
  headlineSuggestions: string[];
  aboutSuggestion: string;
  disclaimer: string;
};
type RebrandResult = {
  careerTransition?: CareerTransitionReview;
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
  const [objective, setObjective] = useState("Estou em transição de carreira e quero me posicionar no LinkedIn para oportunidades como Propagandista Trainee, valorizando minhas experiências anteriores, competências transferíveis e disposição para aprender sobre a área farmacêutica.");
  const [manualContext, setManualContext] = useState("");
  const [result, setResult] = useState<RebrandResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [taskId, setTaskId] = useState<string | null>(null);
  const [quota, setQuota] = useState<{ authenticated: boolean; owner?: boolean; remaining: number | null; storageReady?: boolean; googleReady?: boolean; error?: string } | null>(null);
  const [quotaLoading, setQuotaLoading] = useState(true);
  const [quotaError, setQuotaError] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [completedTaskId, setCompletedTaskId] = useState<string | null>(null);
  const [plan30, setPlan30] = useState<Plan30Days | null>(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [completedDays, setCompletedDays] = useState<number[]>([]);


  const valid = useMemo(() => /^https:\/\/(?:www\.)?linkedin\.com\/in\/[^\s/?#]+\/?(?:[?#].*)?$/i.test(profileUrl.trim()) && objective.trim().length >= 10, [profileUrl, objective]);

  async function loadQuota() {
    setQuotaLoading(true);
    setQuotaError(false);
    try {
      const response = await fetch("/api/rebrand/quota", { cache: "no-store" });
      const status = await response.json();
      if (!status || typeof status.authenticated !== "boolean") throw new Error("Saldo não disponível");
      setQuota(status);
      if (!response.ok) setQuotaError(true);
    } catch {
      setQuota(null);
      setQuotaError(true);
    } finally {
      setQuotaLoading(false);
    }
  }

  useEffect(() => {
    void loadQuota();
    const saved = window.sessionStorage.getItem("ache-manus-active-task")
      || window.sessionStorage.getItem("ache-manus-last-task");
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
        if (!response.ok) {
          // An expired session or an old task from a different account must
          // not freeze the "Gerar" button indefinitely.
          if (response.status === 401 || response.status === 403 || response.status === 404) {
            setTaskId(null);
            setProcessing(false);
            window.sessionStorage.removeItem("ache-manus-last-task");
            if (response.status === 404) window.sessionStorage.removeItem("ache-manus-active-task");
            void loadQuota();
            setError(response.status === 401
              ? "Sua sessão expirou. Entre novamente com Google e recupere seu diagnóstico."
              : response.status === 404
                ? "A pesquisa anterior não pertence a esta conta ou já não está disponível. Você pode gerar um novo diagnóstico se tiver tentativas restantes."
                : "Não foi possível acompanhar a pesquisa nesta sessão.");
            return;
          }
          throw new Error(payload?.error || "Falha ao acompanhar a pesquisa.");
        }
        if (payload.state === "complete" && payload.result) {
          setResult(payload.result as RebrandResult);
          setCompletedTaskId(taskId);
          window.sessionStorage.setItem("ache-manus-last-task", taskId);
          setPlan30(null);
          setCompletedDays([]);
          setPlanError(null);
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
      setError(!/^https:\/\/(?:www\.)?linkedin\.com\/in\/[^\s/?#]+\/?(?:[?#].*)?$/i.test(profileUrl.trim())
        ? "Cole o link público do seu perfil no formato https://www.linkedin.com/in/seu-perfil."
        : "Descreva seu objetivo de transição de carreira em pelo menos 10 caracteres.");
      return;
    }
    if (!quota || quotaLoading || quotaError && !quota.authenticated) {
      setError("Não foi possível confirmar seu acesso. Clique em 'Verificar acesso' e tente novamente.");
      return;
    }
    if (!quota.authenticated) {
      setError("Faça login com Google (ou entre no ADM) para iniciar o diagnóstico. Isso protege suas 3 tentativas.");
      return;
    }
    if (!quota.storageReady) {
      setError("O controle de pesquisas está temporariamente indisponível. Tente novamente mais tarde.");
      return;
    }
    if (!quota.owner && quota.remaining === 0) {
      setError("Suas 3 tentativas terminaram. Não é possível iniciar outra pesquisa nesta conta. Você ainda pode consultar seus diagnósticos anteriores.");
      return;
    }
    if (!quota.owner && (typeof quota.remaining !== "number" || quotaError)) {
      setError("Não foi possível verificar suas tentativas com segurança. Clique em 'Verificar acesso' para tentar novamente.");
      return;
    }
    setError(null);
    setResult(null);
    setPlan30(null);
    setCompletedTaskId(null);
    setCompletedDays([]);
    setPlanError(null);
    window.sessionStorage.removeItem("ache-manus-last-task");
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

  async function generatePlan() {
    if (generatingPlan || plan30) return;
    if (!completedTaskId || !result) {
      setPlanError("Não foi possível recuperar a identificação do diagnóstico anterior. Atualize a página para buscá-lo novamente; isso não usa uma nova tentativa.");
      return;
    }
    setPlanError(null);
    setGeneratingPlan(true);
    try {
      const response = await fetch("/api/rebrand/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: completedTaskId }),
        cache: "no-store",
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error || "Não foi possível gerar seu plano.");
      const value = body.plan as Plan30Days | undefined;
      if (!value || !Array.isArray(value.days) || value.days.length !== 30)
        throw new Error("O plano ainda não está completo. Tente novamente.");
      setPlan30(value);
      const storageKey = "ache-manus-plan-days-" + completedTaskId;
      const existing = window.localStorage.getItem(storageKey);
      if (existing) {
        const parsed: unknown = JSON.parse(existing);
        if (Array.isArray(parsed)) {
          setCompletedDays(parsed.filter((x): x is number => typeof x === "number" && Number.isInteger(x) && x>=1 && x<=30));
        }
      }
    } catch (error) {
      setPlanError(error instanceof Error ? error.message : "Não foi possível gerar o plano agora.");
    } finally {
      setGeneratingPlan(false);
    }
  }

  function toggleDay(day: number, checked: boolean) {
    if (!completedTaskId) return;
    setCompletedDays(previous => {
      const next = checked
        ? [...new Set([...previous, day])].sort((a, b) => a - b)
        : previous.filter(item => item !== day);
      window.localStorage.setItem("ache-manus-plan-days-" + completedTaskId, JSON.stringify(next));
      return next;
    });
  }

  return (
    <div className="rebrandDiagnostic">
      <section className="rebrandFormCard">
        <div className="rebrandCardIcon"><UserRoundPen size={28}/></div>
        <span className="sectionTag acheTag">Diagnóstico LinkedIn com Manus</span>
        <h2>Seu LinkedIn comunica sua transição para Propagandista Trainee?</h2>
        <p>Compare seu título, trajetória e competências transferíveis com o posicionamento desejado para Propagandista Trainee. Receba sugestões de headline, texto Sobre e próximos passos — sem exigir experiência prévia na indústria farmacêutica.</p>

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
          <strong>
            {quotaLoading ? "Verificando acesso e tentativas..."
              : !quota || quotaError && !quota.authenticated ? "Não foi possível verificar seu acesso"
                : !quota.authenticated ? "Faça login para gerar o diagnóstico"
                  : !quota.storageReady || quotaError && !quota.owner ? "Não foi possível confirmar suas tentativas"
                    : quota.owner ? "Sua conta administrativa possui pesquisas ilimitadas"
                      : quota.remaining === 0 ? "Você utilizou suas 3 tentativas"
                        : typeof quota.remaining === "number" ? "Você tem " + quota.remaining + " de 3 tentativas disponíveis"
                          : "Não foi possível consultar suas tentativas"}
          </strong>
          <p>
            {quota?.authenticated && quota.storageReady && !quotaError && quota.remaining === 0 && !quota.owner
              ? "O limite por conta foi atingido. Não será cobrada uma nova pesquisa. Você pode recuperar um diagnóstico anterior, se disponível."
              : !quota?.authenticated
                ? "Conecte sua conta Google ou entre no ADM antes de gerar um diagnóstico."
                : !quota?.owner && quota?.remaining !== null && typeof quota?.remaining === "number"
                  ? "Quando as três tentativas acabarem, não será possível iniciar uma nova pesquisa."
                  : quota?.owner ? "Você pode iniciar novas análises sem descontar tentativas."
                    : "O diagnóstico só começa quando o servidor confirmar seu saldo de pesquisas."}
          </p>
          <div className="rebrandAccessActions">
            {quota && !quota.authenticated && <Link href="/login">Entrar com Google</Link>}
            <button type="button" disabled={quotaLoading} onClick={() => void loadQuota()}>
              {quotaLoading ? "Verificando..." : "Verificar acesso"}
            </button>
          </div>
        </div>
        <p className="rebrandProcessingNotice">Ao clicar em “Gerar meu diagnóstico”, você solicita a pesquisa dos dados profissionais informados pelo Manus e a análise pelo Gemini.</p>
        {processing && <div className="rebrandQuotaInfo" role="status">O Manus está pesquisando. Isso pode levar alguns minutos. Você pode manter a página aberta; acompanhar a tarefa não consome outra pesquisa.</div>}
        {error && <div className="rebrandError" role="alert">{error}</div>}

        <button type="button" onClick={run} disabled={isPending || processing} className="rebrandRun">
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

            <section className="rebrandCareerTransition" aria-labelledby="rebrand-transition-title">
              <div className="rebrandTransitionHeader">
                <span className="sectionTag acheTag">ORIENTAÇÃO PARA MUDANÇA DE CARREIRA</span>
                <h3 id="rebrand-transition-title">Seu LinkedIn para Propagandista Trainee</h3>
                <p>Como seu histórico e seu título atual comunicam a transição — sem precisar já ter atuado na indústria farmacêutica.</p>
              </div>
              {result.careerTransition ? (
                <>
                  <div className="rebrandHeadlineComparison">
                    <div>
                      <small>Título atual do LinkedIn</small>
                      <strong>{result.careerTransition.currentHeadline || "Não recuperado"}</strong>
                    </div>
                    <div>
                      <small>Leitura para o objetivo profissional</small>
                      <strong>{result.careerTransition.headlineLabel}</strong>
                      <p>{result.careerTransition.explanation}</p>
                    </div>
                  </div>
                  {result.careerTransition.headlineSuggestions.length > 0 && (
                    <div className="rebrandHeadlineSuggestions">
                      <h4>Sugestões de título para copiar e adaptar</h4>
                      <p>Exemplos de intenção profissional, não de cargos já exercidos.</p>
                      {result.careerTransition.headlineSuggestions.map((title, i) => (
                        <div className="rebrandHeadlineOption" key={i}>
                          <span>{title}</span>
                          <button type="button" aria-label={"Copiar sugestão de título " + (i + 1)} onClick={() => void navigator.clipboard?.writeText(title)}>
                            Copiar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="rebrandTransitionColumns">
                    <div>
                      <h4>Competências transferíveis com indícios no perfil</h4>
                      {result.careerTransition.transferableStrengths.length ? (
                        <ul>{result.careerTransition.transferableStrengths.map(item => <li key={item}>{item}</li>)}</ul>
                      ) : <p>Não foram recuperados exemplos suficientes. Você pode documentar experiências reais de comunicação, atendimento, vendas, organização ou saúde.</p>}
                    </div>
                    <div>
                      <h4>Como melhorar seu posicionamento</h4>
                      <ul>{result.careerTransition.developmentPriorities.map(item => <li key={item}>{item}</li>)}</ul>
                    </div>
                  </div>
                  <div className="rebrandAboutTemplate">
                    <h4>Modelo para reescrever o “Sobre”</h4>
                    <p>{result.careerTransition.aboutSuggestion}</p>
                    <small>Substitua os campos entre colchetes apenas por informações verdadeiras sobre sua trajetória.</small>
                  </div>
                  <p className="rebrandTransitionDisclaimer">{result.careerTransition.disclaimer}</p>
                </>
              ) : <p>Essa avaliação fica disponível nos diagnósticos gerados após a atualização. Seu plano de desenvolvimento continua acessível.</p>}
            </section>

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

            <section className="rebrandDevelopmentPlan rebrandPlan30">
              <div className="rebrandDevelopmentHeading">
                <div>
                  <span>DESENVOLVIMENTO PROFISSIONAL</span>
                  <h3>Seu plano de 30 dias</h3>
                  <p>Um roteiro diário, prático e adaptado ao diagnóstico. Gerá-lo não consome outra tentativa do Manus.</p>
                </div>
                {plan30 && <button type="button" onClick={() => window.print()} className="rebrandPrintButton">Imprimir / salvar em PDF</button>}
              </div>
              {!plan30 ? (
                <div className="rebrandPlanStart">
                  <p>Transforme os pontos de melhoria em tarefas de 15 a 40 minutos por dia, com uma entrega concreta e revisão do progresso.</p>
                  <button type="button" className="rebrandPlanGenerate" disabled={generatingPlan} onClick={() => void generatePlan()}>
                    {generatingPlan ? <><LoaderCircle className="spin" size={17}/> Preparando 30 dias...</> : <><Sparkles size={17}/> Gerar meu plano de 30 dias</>}
                  </button>
                  {planError && <p className="rebrandError" role="alert">{planError}</p>}
                  <small>A personalização usa o Gemini quando disponível; caso contrário, você recebe um roteiro orientativo completo, sem alterar suas notas.</small>
                </div>
              ) : (
                <>
                  <div className="rebrandPlanProgress">
                    <div><strong>{completedDays.length} de 30 dias concluídos</strong><p>Acompanhe suas tarefas no próprio navegador, sem iniciar novas pesquisas.</p></div>
                    <div className="rebrandPlanProgressBar" role="progressbar" aria-label="Dias concluídos" aria-valuenow={completedDays.length} aria-valuemin={0} aria-valuemax={30}><span style={{ width: (completedDays.length / 30 * 100) + "%" }}/></div>
                  </div>
                  {[
                    { first: 1, last: 7, title: "Semana 1 · Identidade e diagnóstico" },
                    { first: 8, last: 14, title: "Semana 2 · LinkedIn e resultados" },
                    { first: 15, last: 21, title: "Semana 3 · Repertório e relacionamentos" },
                    { first: 22, last: 28, title: "Semana 4 · Comunicação e prática" },
                    { first: 29, last: 30, title: "Dias 29 e 30 · Revisão e continuidade" },
                  ].map(group => (
                    <div className="rebrandPlanPhase" key={group.first}>
                      <h4>{group.title}</h4>
                      <div className="rebrandPlanDays">
                        {plan30.days.filter(day => day.day >= group.first && day.day <= group.last).map(day => (
                          <article key={day.day} className={completedDays.includes(day.day) ? "isComplete" : ""}>
                            <div className="rebrandPlanDayHeader">
                              <strong>Dia {day.day}</strong><span>{day.minutes} min</span>
                            </div>
                            <h5>{day.title}</h5>
                            <p>{day.action}</p>
                            <p className="rebrandPlanDeliverable"><b>Entrega:</b> {day.deliverable}</p>
                            <label className="rebrandDayCheckbox"><input type="checkbox" checked={completedDays.includes(day.day)} onChange={event => toggleDay(day.day, event.target.checked)}/> Concluído</label>
                          </article>
                        ))}
                      </div>
                    </div>
                  ))}
                  <p className="rebrandPlanFootnote">Este plano é orientação de desenvolvimento, não previsão de contratação. Itens sem dados verificáveis devem ser tratados como oportunidades de documentação, não como falta de competência.</p>
                </>
              )}
            </section>
          </>
        )}
      </section>
    </div>
  );
}
