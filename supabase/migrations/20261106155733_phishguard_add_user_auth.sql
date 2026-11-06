/*
# Convert phishguard_analyses to per-user (authenticated, owner-scoped)

## Summary
PhishGuard Mini is adding a login screen. The `phishguard_analyses` table was
previously single-tenant (open to anon). It now becomes owner-scoped: each
authenticated user can only see and manage their own analyses. Existing
orphaned test rows (no owner) are removed since they belong to no user.

## Changes
1. Columns
   - Add `user_id` (uuid) to `phishguard_analyses`.
   - Remove orphaned rows that have no owner (leftover test data).
   - Set `user_id` NOT NULL with DEFAULT `auth.uid()` so client inserts that
     omit `user_id` still satisfy the INSERT policy.
   - Add foreign key `user_id` -> `auth.users(id)` ON DELETE CASCADE.
2. Security
   - Revoke all privileges from `anon` (the app now requires sign-in).
   - Grant SELECT, INSERT, UPDATE, DELETE to `authenticated` only.
   - Replace the four open `anon_*` policies with four owner-scoped
     `authenticated` policies using `auth.uid() = user_id`.
3. Notes
   - The edge function no longer persists rows server-side; the authenticated
     frontend inserts each analysis after receiving the verdict.
   - `user_id` defaults to `auth.uid()` so the client insert
     `.insert({ message, verdict, ... })` succeeds without threading user_id.
*/

-- 1. Add the owner column (nullable first so old rows don't break)
ALTER TABLE phishguard_analyses
  ADD COLUMN IF NOT EXISTS user_id uuid;

-- 2. Remove orphaned rows that belong to no user (development/test data only)
DELETE FROM phishguard_analyses WHERE user_id IS NULL;

-- 3. Lock the column: NOT NULL + default to the current authenticated user
ALTER TABLE phishguard_analyses
  ALTER COLUMN user_id SET DEFAULT auth.uid();

ALTER TABLE phishguard_analyses
  ALTER COLUMN user_id SET NOT NULL;

-- 4. Foreign key to auth.users, cascading deletes when a user is removed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'phishguard_analyses_user_id_fkey'
  ) THEN
    ALTER TABLE phishguard_analyses
      ADD CONSTRAINT phishguard_analyses_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 5. Revoke anon access — the app now requires an authenticated session
REVOKE SELECT, INSERT, UPDATE, DELETE ON phishguard_analyses FROM anon;

-- 6. Grant CRUD to authenticated users only
GRANT SELECT, INSERT, UPDATE, DELETE ON phishguard_analyses TO authenticated;

-- 7. Replace open policies with owner-scoped ones
DROP POLICY IF EXISTS "anon_select_analyses" ON phishguard_analyses;
DROP POLICY IF EXISTS "anon_insert_analyses" ON phishguard_analyses;
DROP POLICY IF EXISTS "anon_update_analyses" ON phishguard_analyses;
DROP POLICY IF EXISTS "anon_delete_analyses" ON phishguard_analyses;

CREATE POLICY "select_own_analyses"
ON phishguard_analyses FOR SELECT
TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_analyses"
ON phishguard_analyses FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_analyses"
ON phishguard_analyses FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_analyses"
ON phishguard_analyses FOR DELETE
TO authenticated USING (auth.uid() = user_id);
