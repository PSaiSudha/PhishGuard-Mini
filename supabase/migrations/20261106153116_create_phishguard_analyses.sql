/*
# Create phishguard_analyses table (single-tenant, no auth)

1. New Tables
- `phishguard_analyses`
  - `id` (uuid, primary key)
  - `message` (text, not null) — the SMS or email message the user submitted for analysis
  - `verdict` (text, not null) — the prediction result: 'safe' or 'suspicious'
  - `risk_score` (integer, not null, 0-100) — numeric confidence/risk score
  - `reasons` (jsonb, not null default '[]') — array of human-readable reasons that contributed to the verdict
  - `message_type` (text, not null default 'text') — the category of message analyzed ('sms' or 'email')
  - `created_at` (timestamptz, default now()) — when the analysis was performed

2. Security
- Enable RLS on `phishguard_analyses`.
- Grant CRUD to `anon` + `authenticated` so the anon-key frontend can reach the table.
- Allow anon + authenticated full CRUD because the data is intentionally shared/public (no-auth demo app).
- Add an index on `created_at` to speed up history ordering.

3. Important Notes
- This is a single-tenant application with no sign-in screen, so the anon role must have access.
- All policies use `USING (true)` / `WITH CHECK (true)` because every analysis is intentionally public/shared.
- No user_id column is needed since there is no authentication.
*/

CREATE TABLE IF NOT EXISTS phishguard_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  verdict text NOT NULL CHECK (verdict IN ('safe', 'suspicious')),
  risk_score integer NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
  message_type text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'sms', 'email')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE phishguard_analyses ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON phishguard_analyses TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_analyses" ON phishguard_analyses;
CREATE POLICY "anon_select_analyses"
ON phishguard_analyses FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_analyses" ON phishguard_analyses;
CREATE POLICY "anon_insert_analyses"
ON phishguard_analyses FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_analyses" ON phishguard_analyses;
CREATE POLICY "anon_update_analyses"
ON phishguard_analyses FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_analyses" ON phishguard_analyses;
CREATE POLICY "anon_delete_analyses"
ON phishguard_analyses FOR DELETE
TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS phishguard_analyses_created_at_idx
ON phishguard_analyses (created_at DESC);
