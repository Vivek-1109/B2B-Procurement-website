export const SCHEMA_SQL = `
-- ============================================================
-- APR Services Enterprise — PostgreSQL Schema
-- Target: Neon PostgreSQL
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Trigger function: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ENUM types
-- ============================================================
DO $$ BEGIN
  CREATE TYPE email_delivery_state AS ENUM (
    'pending', 'sent', 'delivered', 'delayed',
    'failed', 'bounced', 'complained', 'suppressed', 'skipped'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE admin_role AS ENUM ('admin', 'super_admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- admins
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(254) NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  role          admin_role  NOT NULL DEFAULT 'admin',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER trg_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- admin_refresh_tokens  (replaces refreshTokens[] array)
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_refresh_tokens (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id   UUID        NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  token_hash TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_art_admin_id   ON admin_refresh_tokens(admin_id);
CREATE INDEX IF NOT EXISTS idx_art_token_hash ON admin_refresh_tokens(token_hash);

-- ============================================================
-- categories
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 VARCHAR(100) NOT NULL UNIQUE,
  description          VARCHAR(500) NOT NULL,
  image_url            TEXT         NOT NULL DEFAULT '',
  cloudinary_public_id TEXT         NOT NULL DEFAULT '',
  is_active            BOOLEAN      NOT NULL DEFAULT true,
  "order"              INTEGER      NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_is_active   ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_order_name  ON categories("order", name);

CREATE OR REPLACE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- products
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 VARCHAR(200) NOT NULL,
  category             VARCHAR(100) NOT NULL,
  description          TEXT         NOT NULL,
  image_url            TEXT         NOT NULL DEFAULT '',
  cloudinary_public_id TEXT         NOT NULL DEFAULT '',
  is_active            BOOLEAN      NOT NULL DEFAULT true,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_is_active      ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category, is_active);
CREATE INDEX IF NOT EXISTS idx_products_search
  ON products USING GIN (to_tsvector('english', name || ' ' || description));

CREATE OR REPLACE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- certifications
-- ============================================================
CREATE TABLE IF NOT EXISTS certifications (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title                TEXT        NOT NULL,
  image_url            TEXT        NOT NULL DEFAULT '',
  cloudinary_public_id TEXT        NOT NULL DEFAULT '',
  issuer               VARCHAR(200) NOT NULL DEFAULT '',
  year                 VARCHAR(50) NOT NULL DEFAULT '',
  "order"              INTEGER     NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certifications_order ON certifications("order");

CREATE OR REPLACE TRIGGER trg_certifications_updated_at
  BEFORE UPDATE ON certifications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- clients
-- ============================================================
CREATE TABLE IF NOT EXISTS clients (
  id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 VARCHAR(200) NOT NULL UNIQUE,
  logo_url             TEXT         NOT NULL DEFAULT '',
  cloudinary_public_id TEXT         NOT NULL DEFAULT '',
  "order"              INTEGER      NOT NULL DEFAULT 0,
  is_active            BOOLEAN      NOT NULL DEFAULT true,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_is_active   ON clients(is_active);
CREATE INDEX IF NOT EXISTS idx_clients_order_name  ON clients("order", name);

CREATE OR REPLACE TRIGGER trg_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- leads
-- ============================================================
CREATE TABLE IF NOT EXISTS leads (
  id                     UUID                  PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   VARCHAR(100)          NOT NULL,
  company                VARCHAR(150)          NOT NULL,
  email                  VARCHAR(254)          NOT NULL,
  phone                  VARCHAR(30)           NOT NULL,
  message                TEXT                  NOT NULL,
  product_name           VARCHAR(150),
  product_category       VARCHAR(100),
  ip_address             VARCHAR(64),
  user_agent             VARCHAR(512),
  submission_fingerprint VARCHAR(64),
  -- Email delivery (flattened from Mongoose sub-document)
  admin_status           email_delivery_state  NOT NULL DEFAULT 'pending',
  visitor_status         email_delivery_state  NOT NULL DEFAULT 'pending',
  admin_message_id       TEXT,
  visitor_message_id     TEXT,
  admin_error            VARCHAR(1000),
  visitor_error          VARCHAR(1000),
  last_event             VARCHAR(100),
  last_event_at          TIMESTAMPTZ,
  -- Lead management
  status                 lead_status           NOT NULL DEFAULT 'new',
  created_at             TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ           NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_email        ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status       ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at   ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status_created ON leads(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_fingerprint  ON leads(submission_fingerprint);
CREATE INDEX IF NOT EXISTS idx_leads_admin_msg    ON leads(admin_message_id)   WHERE admin_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_visitor_msg  ON leads(visitor_message_id) WHERE visitor_message_id IS NOT NULL;

CREATE OR REPLACE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- Schema corrections (safe to re-run — no-op if already correct)
-- ============================================================

-- Widen certifications.year to accommodate registration numbers
DO $$
BEGIN
  ALTER TABLE certifications ALTER COLUMN year TYPE VARCHAR(50);
EXCEPTION WHEN others THEN
  -- Ignore if already correct width or table doesn't exist
END;
$$;
`;
