-- Existing anonymous rows stay unowned: contact email is never proof of ownership.
ALTER TABLE app.shared_configurations ADD COLUMN owner_user_id VARCHAR(255);
ALTER TABLE app.quote_requests ADD COLUMN owner_user_id VARCHAR(255);
ALTER TABLE app.admin_login_flows ADD COLUMN destination VARCHAR(32) NOT NULL DEFAULT '/admin/quotes' CHECK (destination IN ('/admin/quotes','/dashboard'));
CREATE INDEX shared_configurations_owner_idx ON app.shared_configurations(owner_user_id,created_at DESC,public_id);
CREATE INDEX quote_requests_owner_idx ON app.quote_requests(owner_user_id,created_at DESC,id);
GRANT SELECT ON app.shared_configurations TO form_studio_admin_web;
CREATE POLICY account_designs_read ON app.shared_configurations FOR SELECT TO form_studio_admin_web USING(true);
