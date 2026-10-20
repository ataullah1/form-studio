DO $$ BEGIN
 IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='form_studio_admin_web') THEN
  CREATE ROLE form_studio_admin_web NOLOGIN;
 END IF;
END $$;
GRANT USAGE ON SCHEMA app TO form_studio_admin_web;
ALTER TABLE app.quote_requests ADD COLUMN status_version INTEGER NOT NULL DEFAULT 0;
CREATE TABLE app.admin_sessions (
 token_hash CHAR(64) PRIMARY KEY,
 user_id VARCHAR(255) NOT NULL,
 expires_at TIMESTAMPTZ(3) NOT NULL
);
CREATE TABLE app.admin_login_flows (
 state_hash CHAR(64) PRIMARY KEY,
 binding_hash CHAR(64) NOT NULL,
 verifier VARCHAR(128) NOT NULL,
 nonce VARCHAR(64) NOT NULL,
 expires_at TIMESTAMPTZ(3) NOT NULL
);
CREATE TABLE app.quote_status_history (
 id UUID PRIMARY KEY,
 quote_id UUID NOT NULL REFERENCES app.quote_requests(id) ON DELETE CASCADE,
 actor_id VARCHAR(255) NOT NULL,
 from_status VARCHAR(16) NOT NULL CHECK(from_status IN ('NEW','REVIEWING','CLOSED')),
 to_status VARCHAR(16) NOT NULL CHECK(to_status IN ('NEW','REVIEWING','CLOSED')),
 version INTEGER NOT NULL,
 created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(quote_id,version)
);
CREATE INDEX quote_requests_inbox_idx ON app.quote_requests(status,created_at DESC,id);
CREATE INDEX admin_sessions_expiry_idx ON app.admin_sessions(expires_at);
CREATE INDEX admin_login_flows_expiry_idx ON app.admin_login_flows(expires_at);
REVOKE ALL ON app.admin_sessions, app.admin_login_flows, app.quote_status_history FROM PUBLIC;
ALTER TABLE app.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.admin_login_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.quote_status_history ENABLE ROW LEVEL SECURITY;
GRANT SELECT,INSERT,DELETE ON app.admin_sessions,app.admin_login_flows TO form_studio_admin_web;
GRANT SELECT ON app.quote_requests,app.quote_contacts,app.quote_status_history TO form_studio_admin_web;
GRANT UPDATE(status,status_version) ON app.quote_requests TO form_studio_admin_web;
GRANT INSERT ON app.quote_status_history TO form_studio_admin_web;
CREATE POLICY admin_sessions_access ON app.admin_sessions TO form_studio_admin_web USING(true) WITH CHECK(true);
CREATE POLICY admin_flows_access ON app.admin_login_flows TO form_studio_admin_web USING(true) WITH CHECK(true);
CREATE POLICY admin_quotes_read ON app.quote_requests FOR SELECT TO form_studio_admin_web USING(true);
CREATE POLICY admin_quotes_update ON app.quote_requests FOR UPDATE TO form_studio_admin_web USING(true) WITH CHECK(true);
CREATE POLICY admin_contacts_read ON app.quote_contacts FOR SELECT TO form_studio_admin_web USING(expires_at > CURRENT_TIMESTAMP);
CREATE POLICY admin_history_read ON app.quote_status_history FOR SELECT TO form_studio_admin_web USING(true);
CREATE POLICY admin_history_insert ON app.quote_status_history FOR INSERT TO form_studio_admin_web WITH CHECK(true);
-- Extend the existing narrow scheduled cleanup; neither web role gains arbitrary DELETE.
CREATE OR REPLACE FUNCTION app.purge_expired_demo_contacts() RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, app AS $$
DECLARE removed INTEGER;
BEGIN
 DELETE FROM app.quote_contacts WHERE expires_at <= CURRENT_TIMESTAMP;
 GET DIAGNOSTICS removed = ROW_COUNT;
 DELETE FROM app.rate_buckets WHERE window_start < CURRENT_TIMESTAMP - INTERVAL '1 day';
 DELETE FROM app.admin_sessions WHERE expires_at <= CURRENT_TIMESTAMP;
 DELETE FROM app.admin_login_flows WHERE expires_at <= CURRENT_TIMESTAMP;
 RETURN removed;
END $$;
