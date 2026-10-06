"use client";

import { useMemo, useState, useTransition } from "react";
import { Activity, ArrowRight, CheckCircle2, Link2, LoaderCircle, Sparkles, Target, UserRoundPen } from "lucide-react";

type Dimension = { label: string; score: number; rationale: string; action: string };
type RebrandResult = {
  profileName?: string;
  headline?: string;
  overallScore: number;
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

  const valid = useMemo(() => /linkedin\.com\/in\//i.test(profileUrl) && objective.trim().length >= 10, [profileUrl, objective]);

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
        <p>Usamos sinais públicos do perfil para avaliar clareza, aderência, provas, comunicação e próximos passos. O foco aqui é desenvolvimento profissional — não ranqueamento de candidatura.</p>

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
          <textarea value={manualContext} onChange={(e)=>setManualContext(e.target.value)} rows={4} placeholder="Ex.: experiência em vendas, saúde, atendimento, relacionamento, projetos, resultados ou algo que queira destacar."/>
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
            <div className="rebrandScoreCard">
              <div>
                <span className="sectionTag acheTag">Leitura geral</span>
                <h2>{result.profileName || "Seu perfil"}</h2>
                {result.headline && <p>{result.headline}</p>}
              </div>
              <div className="rebrandScore"><strong>{result.overallScore}</strong><span>/100</span><small>{result.classification}</small></div>
            </div>

            <div className="rebrandSummary"><Activity size={23}/><p>{result.summary}</p></div>

            <div className="rebrandDimensions">
              {result.dimensions.map((item) => (
                <article key={item.label}>
                  <div><strong>{item.label}</strong><span>{item.score}/100</span></div>
                  <div className="rebrandMeter"><i style={{width:`${item.score}%`}}/></div>
                  <p>{item.rationale}</p>
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
          </>
        )}
      </section>
    </div>
  );
}
