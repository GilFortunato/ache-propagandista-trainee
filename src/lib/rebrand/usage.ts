import "server-only";
import { neon } from "@neondatabase/serverless";
export const MAX_FREE_RESEARCH = 3;
type Identity = { id: string; owner: boolean; email?: string };

export class ResearchStorageUnavailable extends Error {
  constructor() { super("O controle seguro de pesquisas ainda não foi configurado. A administração precisa ativar o banco de dados do ReBrand."); }
}
function db() {
  const url = process.env.ACHE_REBRAND_DATABASE_URL || process.env.DATABASE_URL;
  if (!url?.startsWith("postgres")) throw new ResearchStorageUnavailable();
  return neon(url);
}
export function researchStorageReady() {
  return Boolean((process.env.ACHE_REBRAND_DATABASE_URL || process.env.DATABASE_URL)?.startsWith("postgres"));
}

export async function quotaFor(identity: Identity) {
  if (identity.owner) return { limit: null, used: 0, remaining: null, unlimited: true };
  const sql = db();
  const rows = await sql.query("SELECT used FROM ache_rebrand_usage WHERE user_id=$1 LIMIT 1", [identity.id]);
  const used = Number(rows[0]?.used || 0);
  return { limit: MAX_FREE_RESEARCH, used, remaining: Math.max(0, MAX_FREE_RESEARCH - used), unlimited: false };
}

export async function reserveResearch(identity: Identity): Promise<{ allowed: boolean; remaining: number | null }> {
  const sql = db();
  if (identity.owner) return { allowed: true, remaining: null };
  // Atomic conflict update: two simultaneous requests cannot exceed the limit.
  const rows = await sql.query(
    "INSERT INTO ache_rebrand_usage (user_id,used) VALUES ($1,1) " +
    "ON CONFLICT (user_id) DO UPDATE SET used=ache_rebrand_usage.used+1, updated_at=now() " +
    "WHERE ache_rebrand_usage.used < $2 RETURNING used",
    [identity.id,MAX_FREE_RESEARCH],
  );
  if (!rows.length) return { allowed: false, remaining: 0 };
  return { allowed: true, remaining: MAX_FREE_RESEARCH - Number(rows[0].used) };
}

export async function refundResearch(identity: Identity) {
  if (identity.owner) return;
  const sql = db();
  await sql.query("UPDATE ache_rebrand_usage SET used=GREATEST(used-1,0),updated_at=now() WHERE user_id=$1", [identity.id]);
}

export async function saveManusTask(input: {
  taskId: string; identity: Identity; profileUrl: string; objective: string; manualContext: string;
}) {
  const sql = db();
  await sql.query(
    "INSERT INTO ache_rebrand_tasks (task_id,user_id,profile_url,objective,manual_context) VALUES ($1,$2,$3,$4,$5)",
    [input.taskId,input.identity.id,input.profileUrl,input.objective,input.manualContext],
  );
}

export type TaskRow = {
  task_id: string; user_id: string; profile_url: string; objective: string; manual_context: string;
  status: string; result_json: unknown; created_at: string;
};
export async function findManusTask(taskId: string, identity: Identity): Promise<TaskRow | null> {
  const sql = db();
  const rows = await sql.query(
    "SELECT task_id,user_id,profile_url,objective,manual_context,status,result_json,created_at " +
    "FROM ache_rebrand_tasks WHERE task_id=$1 AND user_id=$2 LIMIT 1",
    [taskId,identity.id],
  );
  return rows.length ? rows[0] as TaskRow : null;
}
export async function setManusTaskResult(taskId: string, identity: Identity, status: "complete" | "failed", result: unknown) {
  const sql = db();
  await sql.query(
    "UPDATE ache_rebrand_tasks SET status=$1,result_json=$2::jsonb,updated_at=now() WHERE task_id=$3 AND user_id=$4",
    [status,JSON.stringify(result),taskId,identity.id],
  );
}

/** Store one plan in the existing report JSON. No schema change or additional Manus task. */
export async function persist30DayPlan(taskId: string, identity: Identity, plan: unknown) {
  const sql = db();
  const rows = await sql.query(
    "UPDATE ache_rebrand_tasks SET result_json=jsonb_set(result_json, '{plan30Days}', $3::jsonb, true),updated_at=now() " +
    "WHERE task_id=$1 AND user_id=$2 AND status='complete' " +
    "AND result_json->'plan30Days' IS NULL RETURNING task_id",
    [taskId, identity.id, JSON.stringify(plan)],
  );
  return rows.length > 0;
}
