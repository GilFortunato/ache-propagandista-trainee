import { NextResponse } from "next/server";

type LinkedInProfile = Record<string, unknown>;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as null | { profileUrl?: string; objective?: string; manualContext?: string };
  if (!body?.profileUrl || !/linkedin\.com\/in\//i.test(body.profileUrl)) {
    return NextResponse.json({ error: "Informe uma URL válida de perfil do LinkedIn." }, { status: 400 });
  }
  if (!body.objective || body.objective.trim().length < 10) {
    return NextResponse.json({ error: "Informe um objetivo profissional mais claro." }, { status: 400 });
  }

  const profile = await collectLinkedIn(body.profileUrl).catch(() => null);
  const normalized = normalizeProfile(profile, body.manualContext || "");
  const result = await analyzeWithGemini({ profileUrl: body.profileUrl, objective: body.objective, manualContext: body.manualContext || "", profile: normalized }).catch(() => null);

  if (result) {
    return NextResponse.json({ ...result, source: profile ? "linkedin+ai" : "manual+ai" });
  }

  return NextResponse.json({ ...localAssessment(normalized, body.objective, body.manualContext || ""), source: profile ? "linkedin+local" : "manual+local" });
}

async function collectLinkedIn(profileUrl: string): Promise<LinkedInProfile | null> {
  const token = process.env.ACHE_REBRAND_APIFY_TOKEN;
  if (!token) return null;
  const actor = process.env.ACHE_REBRAND_APIFY_LINKEDIN_ACTOR_ID || "unseenuser/linkedin-profile";
  const actorId = encodeURIComponent(actor);
  const endpoint = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}&timeout=90`;

  const payloads = [
    { profileUrls: [profileUrl] },
    { urls: [profileUrl] },
    { startUrls: [{ url: profileUrl }] },
  ];

  for (const payload of payloads) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    }).catch(() => null);
    if (!response?.ok) continue;
    const items = await response.json().catch(() => []);
    if (Array.isArray(items) && items[0] && typeof items[0] === "object") return items[0] as LinkedInProfile;
  }
  return null;
}

function normalizeProfile(profile: LinkedInProfile | null, manualContext: string) {
  const text = (key: string) => typeof profile?.[key] === "string" ? String(profile[key]).trim() : "";
  const list = (key: string) => Array.isArray(profile?.[key]) ? profile![key] : [];
  const experiences = list("experience").length ? list("experience") : list("experiences");
  return {
    name: text("fullName") || text("name") || text("firstName"),
    headline: text("headline") || text("title"),
    about: text("about") || text("summary"),
    location: text("location"),
    experiences,
    education: list("education"),
    skills: list("skills"),
    manualContext,
  };
}

async function analyzeWithGemini(input: { profileUrl: string; objective: string; manualContext: string; profile: ReturnType<typeof normalizeProfile> }) {
  const key = process.env.ACHE_REBRAND_GEMINI_API_KEY;
  if (!key) return null;
  const model = process.env.ACHE_REBRAND_GEMINI_MODEL || "gemini-2.5-flash";
  const prompt = `Você é especialista sênior em LinkedIn, marca profissional e desenvolvimento de carreira.

Avalie o perfil para DESENVOLVIMENTO de marca pessoal na carreira de Propagandista Trainee. Não use a análise como decisão de contratação, triagem ou ranqueamento de candidatura.

Contexto da função:
- comunicação clara e persuasiva;
- relacionamento com profissionais de saúde e diferentes públicos;
- aprendizado contínuo e domínio de informação técnica;
- organização, autonomia e capacidade de planejamento;
- ética, credibilidade e postura profissional;
- orientação para resultados;
- capacidade de traduzir informação complexa para linguagem clara.

Regras:
- use apenas os dados fornecidos abaixo;
- não invente experiências, métricas ou competências;
- ausência de dado significa "não evidenciado", não incapacidade;
- seja construtivo, específico e executável;
- responda APENAS JSON válido.

Objetivo profissional:
${input.objective}

URL:
${input.profileUrl}

Contexto adicional:
${input.manualContext || "não informado"}

Dados públicos recuperados:
${JSON.stringify(input.profile, null, 2)}

Formato:
{
  "profileName": "",
  "headline": "",
  "overallScore": 0,
  "classification": "",
  "summary": "",
  "strengths": ["", ""],
  "gaps": ["", ""],
  "recommendations": ["", ""],
  "dimensions": [
    {"label":"Clareza de posicionamento","score":0,"rationale":"","action":""},
    {"label":"Aderência à carreira de Propagandista","score":0,"rationale":"","action":""},
    {"label":"Provas e experiências","score":0,"rationale":"","action":""},
    {"label":"Comunicação profissional","score":0,"rationale":"","action":""},
    {"label":"Presença e conteúdo","score":0,"rationale":"","action":""},
    {"label":"Relacionamento e networking","score":0,"rationale":"","action":""}
  ],
  "nextBestAction":{"title":"","reason":"","actions":["","",""]}
}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.2 } }),
    cache: "no-store",
  });
  if (!response.ok) return null;
  const json = await response.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") return null;
  const parsed = JSON.parse(text);
  return sanitize(parsed, input.profile);
}

function sanitize(value: any, profile: ReturnType<typeof normalizeProfile>) {
  const clamp = (n: unknown) => Math.max(0, Math.min(100, Number(n) || 0));
  const strings = (x: unknown) => Array.isArray(x) ? x.filter(v => typeof v === "string" && v.trim()).slice(0,6) : [];
  const dims = Array.isArray(value?.dimensions) ? value.dimensions.slice(0,6).map((d:any)=>({ label:String(d?.label||"Dimensão"), score:clamp(d?.score), rationale:String(d?.rationale||""), action:String(d?.action||"") })) : [];
  return {
    profileName: String(value?.profileName || profile.name || ""),
    headline: String(value?.headline || profile.headline || ""),
    overallScore: clamp(value?.overallScore),
    classification: String(value?.classification || "Em desenvolvimento"),
    summary: String(value?.summary || "Diagnóstico concluído."),
    strengths: strings(value?.strengths),
    gaps: strings(value?.gaps),
    recommendations: strings(value?.recommendations),
    dimensions: dims,
    nextBestAction: {
      title: String(value?.nextBestAction?.title || "Ajustar o posicionamento"),
      reason: String(value?.nextBestAction?.reason || "A clareza do perfil sustenta as demais ações."),
      actions: strings(value?.nextBestAction?.actions).slice(0,5),
    },
  };
}

function localAssessment(profile: ReturnType<typeof normalizeProfile>, objective: string, manualContext: string) {
  const evidence = [profile.headline, profile.about, manualContext].filter(Boolean).join(" ").toLowerCase();
  const hasHeadline = profile.headline.length > 20;
  const hasAbout = profile.about.length > 80;
  const hasExperience = Array.isArray(profile.experiences) && profile.experiences.length > 0;
  const keywords = ["comunica", "relacion", "venda", "saúde", "saude", "cliente", "resultado", "meta", "trein", "apresent", "negocia"];
  const hits = keywords.filter(k => evidence.includes(k)).length;
  const clarity = hasHeadline ? 72 : 42;
  const fit = Math.min(88, 42 + hits * 5);
  const proof = hasExperience ? 70 : manualContext.length > 30 ? 58 : 35;
  const communication = hasAbout ? 72 : hasHeadline ? 58 : 40;
  const content = 45;
  const networking = 45;
  const dimensions = [
    ["Clareza de posicionamento", clarity, hasHeadline ? "A headline oferece um ponto de partida para entender o posicionamento." : "A clareza da proposta profissional ainda não está evidenciada.", "Explique em uma frase o que você faz, para quem e qual valor entrega."],
    ["Aderência à carreira de Propagandista", fit, hits ? "Há sinais textuais relacionados a comunicação, relacionamento, saúde, vendas ou resultados." : "Aderência ainda pouco evidenciada nos dados disponíveis.", "Traga experiências reais que demonstrem comunicação, relacionamento, aprendizado técnico e resultados."],
    ["Provas e experiências", proof, hasExperience ? "Há experiências recuperadas para sustentar a narrativa." : "Poucas provas foram recuperadas automaticamente.", "Inclua contexto, ação e resultado verificável em cada experiência relevante."],
    ["Comunicação profissional", communication, hasAbout ? "A seção de apresentação fornece material para avaliar sua narrativa." : "A narrativa profissional ainda pode ganhar profundidade.", "Use o Sobre para conectar trajetória, competências e objetivo profissional."],
    ["Presença e conteúdo", content, "Sem evidência suficiente de conteúdo recente nesta execução.", "Compartilhe aprendizados e reflexões profissionais apenas quando tiver algo concreto a acrescentar."],
    ["Relacionamento e networking", networking, "Sem evidência suficiente de interações públicas nesta execução.", "Construa rede com profissionais e temas relacionados a saúde, comunicação e relacionamento."],
  ].map(([label,score,rationale,action])=>({label:String(label),score:Number(score),rationale:String(rationale),action:String(action)}));
  const overallScore = Math.round(dimensions.reduce((s,d)=>s+d.score,0)/dimensions.length);
  return {
    profileName: profile.name,
    headline: profile.headline,
    overallScore,
    classification: overallScore >= 75 ? "Posicionamento consistente" : overallScore >= 55 ? "Boa base, com espaço para fortalecer" : "Em construção",
    summary: `O perfil apresenta uma base de marca profissional que pode ser fortalecida para comunicar melhor sua aderência à carreira de Propagandista Trainee. O objetivo informado — ${objective} — deve aparecer de forma coerente na headline, no Sobre e nas experiências, sempre sustentado por fatos reais.`,
    strengths: hasHeadline ? ["Já existe uma headline que pode ser refinada como proposta de valor."] : ["Há um objetivo profissional claro para orientar a revisão do perfil."],
    gaps: ["Evidenciar melhor experiências e resultados ligados a comunicação, relacionamento e aprendizado.", "Tornar mais explícita a conexão entre trajetória e a carreira de Propagandista Trainee."],
    recommendations: ["Reescrever a headline com foco em proposta de valor e competências comprováveis.", "Revisar o Sobre em três blocos: trajetória, competências e direção profissional.", "Transformar descrições de experiência em evidências: contexto + ação + resultado."],
    dimensions,
    nextBestAction: { title: "Reestruturar headline e Sobre", reason: "São as áreas que mais rapidamente melhoram a clareza do posicionamento sem inventar nenhuma experiência.", actions: ["Liste 3 competências que você consegue provar com exemplos reais.", "Reescreva a headline conectando função, valor e especialidade.", "Reescreva o Sobre ligando trajetória, competências e objetivo de carreira."] },
  };
}
