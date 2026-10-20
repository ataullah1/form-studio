CREATE SCHEMA IF NOT EXISTS app;
REVOKE ALL ON SCHEMA app FROM PUBLIC;
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'form_studio_runtime') THEN
    CREATE ROLE form_studio_runtime NOLOGIN;
  END IF;
END $$;
CREATE TABLE app.shared_configurations (
  public_id VARCHAR(32) PRIMARY KEY,
  idempotency_key UUID NOT NULL UNIQUE,
  fingerprint CHAR(64) NOT NULL,
  configuration JSONB NOT NULL,
  schema_version INTEGER NOT NULL,
  catalog_version VARCHAR(32) NOT NULL,
  estimated_total_cents INTEGER NOT NULL CHECK (estimated_total_cents >= 0),
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE app.rate_buckets (
  key VARCHAR(80) PRIMARY KEY,
  window_start TIMESTAMPTZ(3) NOT NULL,
  count INTEGER NOT NULL CHECK (count > 0)
);
ALTER TABLE app.shared_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.rate_buckets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA app FROM PUBLIC;
DO $$ BEGIN
  IF to_regclass('public._prisma_migrations') IS NOT NULL THEN
    REVOKE ALL ON TABLE public._prisma_migrations FROM PUBLIC;
  END IF;
END $$;
DO $$ DECLARE r TEXT; BEGIN
  FOREACH r IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('REVOKE ALL ON SCHEMA app FROM %I', r);
      EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA app FROM %I', r);
      IF to_regclass('public._prisma_migrations') IS NOT NULL THEN
        EXECUTE format('REVOKE ALL ON TABLE public._prisma_migrations FROM %I', r);
      END IF;
    END IF;
  END LOOP;
END $$;
GRANT USAGE ON SCHEMA app TO form_studio_runtime;
GRANT SELECT, INSERT ON app.shared_configurations TO form_studio_runtime;
GRANT SELECT, INSERT, UPDATE ON app.rate_buckets TO form_studio_runtime;
CREATE POLICY runtime_read ON app.shared_configurations FOR SELECT TO form_studio_runtime USING (true);
CREATE POLICY runtime_insert ON app.shared_configurations FOR INSERT TO form_studio_runtime WITH CHECK (true);
CREATE POLICY runtime_rate ON app.rate_buckets TO form_studio_runtime USING (true) WITH CHECK (true);
CREATE FUNCTION app.reject_snapshot_mutation() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Shared configurations are immutable'; END $$;
CREATE TRIGGER immutable_snapshot BEFORE UPDATE OR DELETE ON app.shared_configurations
  FOR EACH ROW EXECUTE FUNCTION app.reject_snapshot_mutation();
REVOKE ALL ON FUNCTION app.reject_snapshot_mutation() FROM PUBLIC;
