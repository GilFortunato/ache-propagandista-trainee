"use client";

import { useMemo, useState, useTransition } from "react";
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

  const valid = useMemo(() => /^https:\/\/(?:www\.)?linkedin\.com\/in\/[^\s/?#]+\/?(?:[?#].*)?$/i.test(profileUrl.trim()) && objective.trim().length >= 10, [profileUrl, objective]);

  function run() {
    if (!valid) {
      setError("Informe uma URL válida do LinkedIn e mantenha um objetivo profissional claro.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/rebrand/linkedin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileUrl, objective, manualContext }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error || "Não foi possível concluir a avaliação.");
        setResult(payload);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível concluir a avaliação.");
      }
    });
  }

  return (
    <div className="rebrandDiagnostic">
      <section className="rebrandFormCard">
        <div className="rebrandCardIcon"><UserRoundPen size={28}/></div>
        <span className="sectionTag acheTag">Diagnóstico de LinkedIn</span>
        <h2>Como seu perfil comunica seu potencial para a carreira de Propagandista?</h2>
        <p>Analisamos apenas evidências realmente recuperadas do perfil. Dados ausentes ficam como não avaliados e nunca viram nota baixa. O foco é desenvolvimento profissional — não seleção ou ranqueamento de candidaturas.</p>

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

        {error && <div className="rebrandError">{error}</div>}

        <button type="button" onClick={run} disabled={isPending || !valid} className="rebrandRun">
          {isPending ? <><LoaderCircle className="spin" size={18}/> Analisando perfil...</> : <>Gerar meu diagnóstico <ArrowRight size={18}/></>}
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
