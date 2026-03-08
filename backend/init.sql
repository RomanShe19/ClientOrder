-- AutoVIP: Fallback SQL для инициализации БД
-- Запуск: psql -U autovip -d autovip -f init.sql

CREATE TABLE IF NOT EXISTS leads (
    id            SERIAL PRIMARY KEY,
    first_name    VARCHAR(100),
    last_name     VARCHAR(100),
    middle_name   VARCHAR(100),
    contact_phone VARCHAR(30) NOT NULL,
    contact_email VARCHAR(255),
    business_niche          VARCHAR(255) NOT NULL,
    company_size            VARCHAR(100) NOT NULL,
    task_volume             VARCHAR(255) NOT NULL,
    client_role             VARCHAR(100) NOT NULL,
    budget                  VARCHAR(100) NOT NULL,
    preferred_contact_method VARCHAR(100) NOT NULL,
    preferred_contact_time  VARCHAR(100) NOT NULL,
    product_interest        VARCHAR(255) NOT NULL,
    task_type               VARCHAR(255) NOT NULL,
    result_deadline         VARCHAR(255) NOT NULL,
    comments      TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics (
    id                  SERIAL PRIMARY KEY,
    lead_id             INTEGER NOT NULL UNIQUE REFERENCES leads(id) ON DELETE CASCADE,
    page_time_seconds   INTEGER NOT NULL DEFAULT 0,
    button_clicks       JSONB NOT NULL DEFAULT '{}',
    cursor_heatmap      JSONB NOT NULL DEFAULT '{}',
    return_visits       INTEGER NOT NULL DEFAULT 0,
    session_data        JSONB NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS ix_analytics_lead_id ON analytics(lead_id);

CREATE TABLE IF NOT EXISTS admin_configs (
    id            SERIAL PRIMARY KEY,
    config_key    VARCHAR(255) NOT NULL UNIQUE,
    config_value  JSONB NOT NULL DEFAULT '{}',
    description   VARCHAR(500),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS ix_admin_configs_config_key ON admin_configs(config_key);

-- Триггер для автообновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_leads_updated_at ON leads;
CREATE TRIGGER trg_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_admin_configs_updated_at ON admin_configs;
CREATE TRIGGER trg_admin_configs_updated_at
    BEFORE UPDATE ON admin_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
