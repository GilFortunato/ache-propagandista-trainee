-- Execute once in the dedicated Neon Postgres database connected to Aché.
-- Persistent, concurrency-safe limits: 3 Manus research tasks per Google account.
CREATE TABLE IF NOT EXISTS ache_rebrand_usage (
  user_id text PRIMARY KEY,
  used integer NOT NULL DEFAULT 0 CHECK (used >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS ache_rebrand_tasks (
  task_id text PRIMARY KEY,
  user_id text NOT NULL,
  profile_url text NOT NULL,
  objective text NOT NULL,
  manual_context text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing','complete','failed')),
  result_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ache_rebrand_tasks_user_time_idx ON ache_rebrand_tasks(user_id, created_at DESC);
