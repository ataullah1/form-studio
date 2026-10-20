CREATE TABLE app.quote_requests (
  id UUID PRIMARY KEY,
  reference VARCHAR(32) NOT NULL UNIQUE,
  idempotency_key UUID NOT NULL UNIQUE,
  fingerprint CHAR(64) NOT NULL,
  configuration JSONB NOT NULL,
  catalog_version VARCHAR(32) NOT NULL,
  estimated_total_cents INTEGER NOT NULL CHECK (estimated_total_cents >= 0),
  source_public_id VARCHAR(32),
  status VARCHAR(16) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW','REVIEWING','CLOSED')),
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE app.quote_contacts (
  quote_id UUID PRIMARY KEY REFERENCES app.quote_requests(id) ON DELETE CASCADE ON UPDATE CASCADE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(254) NOT NULL,
  company VARCHAR(120) NOT NULL,
  country VARCHAR(100) NOT NULL,
  message VARCHAR(1000) NOT NULL,
  expires_at TIMESTAMPTZ(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '5 days')
);
CREATE INDEX quote_contacts_expires_at_idx ON app.quote_contacts(expires_at);
ALTER TABLE app.quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.quote_contacts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON app.quote_requests, app.quote_contacts FROM PUBLIC;
DO $$ DECLARE r TEXT; BEGIN
 FOREACH r IN ARRAY ARRAY['anon','authenticated'] LOOP
  IF EXISTS (SELECT FROM pg_roles WHERE rolname=r) THEN
   EXECUTE format('REVOKE ALL ON app.quote_requests, app.quote_contacts FROM %I',r);
  END IF;
 END LOOP;
END $$;
GRANT SELECT, INSERT ON app.quote_requests TO form_studio_runtime;
GRANT INSERT ON app.quote_contacts TO form_studio_runtime;
CREATE POLICY quote_runtime_read ON app.quote_requests FOR SELECT TO form_studio_runtime USING (true);
CREATE POLICY quote_runtime_insert ON app.quote_requests FOR INSERT TO form_studio_runtime WITH CHECK (true);
CREATE POLICY contact_runtime_insert ON app.quote_contacts FOR INSERT TO form_studio_runtime WITH CHECK (expires_at <= CURRENT_TIMESTAMP + INTERVAL '5 days 1 second');
CREATE FUNCTION app.purge_expired_demo_contacts() RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, app AS $$
DECLARE removed INTEGER;
BEGIN
 DELETE FROM app.quote_contacts WHERE expires_at <= CURRENT_TIMESTAMP;
 GET DIAGNOSTICS removed = ROW_COUNT;
 DELETE FROM app.rate_buckets WHERE window_start < CURRENT_TIMESTAMP - INTERVAL '1 day';
 RETURN removed;
END $$;
REVOKE ALL ON FUNCTION app.purge_expired_demo_contacts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.purge_expired_demo_contacts() TO form_studio_runtime;
