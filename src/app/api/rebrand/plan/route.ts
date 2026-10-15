import { NextRequest, NextResponse } from "next/server";
import { currentResearchIdentity } from "@/lib/acheGoogleAuth";
import { findManusTask, persist30DayPlan, researchStorageReady } from "@/lib/rebrand/usage";
import { generate30DayPlan, isPlan30Days } from "@/lib/rebrand/plan30";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "no-store" };

export async function POST(request: NextRequest) {
  const identity = await currentResearchIdentity();
  if (!identity) return NextResponse.json({ error: "Faça login para gerar seu plano de 30 dias." }, { status: 401, headers });
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return NextResponse.json({ error: "Origem inválida." }, { status: 403, headers });
  if (!researchStorageReady()) return NextResponse.json({ error: "Banco de pesquisas não disponível." }, { status: 503, headers });

  const body = await request.json().catch(() => null) as { taskId?: unknown } | null;
  const taskId = body?.taskId;
  if (typeof taskId !== "string" || !/^[a-zA-Z0-9_-]{8,120}$/.test(taskId))
    return NextResponse.json({ error: "Identificador do diagnóstico inválido." }, { status: 400, headers });

  try {
    const task = await findManusTask(taskId, identity);
    if (!task || task.status !== "complete" || !task.result_json || typeof task.result_json !== "object")
      return NextResponse.json({ error: "Conclua seu diagnóstico antes de gerar o plano." }, { status: 404, headers });

    const report = task.result_json as Record<string, unknown>;
    if (isPlan30Days(report.plan30Days))
      return NextResponse.json({ plan: report.plan30Days, cached: true, remainingSearchesUnchanged: true }, { headers });

    // Gemini is used only for the plan, not for another Manus research.
    // A guided 30-day plan is returned if Gemini is unavailable.
    const plan = await generate30DayPlan(report, task.objective, task.manual_context);
    await persist30DayPlan(taskId, identity, plan);
    const updated = await findManusTask(taskId, identity);
    const latest = updated?.result_json && typeof updated.result_json === "object"
      ? (updated.result_json as Record<string, unknown>).plan30Days : null;
    return NextResponse.json({
      plan: isPlan30Days(latest) ? latest : plan,
      cached: false,
      remainingSearchesUnchanged: true,
    }, { headers });
  } catch (error) {
    console.error("[rebrand] Plan generation failed", { type: error instanceof Error ? error.name : "unknown" });
    return NextResponse.json({ error: "Não foi possível gerar o plano agora. Tente novamente sem consumir uma nova pesquisa." }, { status: 503, headers });
  }
}
