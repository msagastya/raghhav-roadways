-- Align production users table with the Prisma schema used by login.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS profile_photo_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS verified_email BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_phone BOOLEAN NOT NULL DEFAULT false;

-- Supabase RLS denies anon/authenticated access, but the backend connects as
-- app_user through the pooler and needs direct database access.
DO $$
DECLARE
  t record;
BEGIN
  FOR t IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', t.schemaname, t.tablename);

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = t.schemaname
        AND tablename = t.tablename
        AND policyname = 'app_user_full_access'
    ) THEN
      EXECUTE format(
        'CREATE POLICY app_user_full_access ON %I.%I FOR ALL TO app_user USING (true) WITH CHECK (true)',
        t.schemaname,
        t.tablename
      );
    END IF;
  END LOOP;
END $$;
