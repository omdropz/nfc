-- NFC Business Card Platform — Supabase Schema
-- Run this SQL in the Supabase SQL Editor for your project.

-- ─────────────────────────────────────────────
-- 1. business_pages table
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS business_pages (
  id                      UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id                 TEXT        UNIQUE NOT NULL,
  business_name           TEXT        NOT NULL DEFAULT 'My Business',
  logo_url                TEXT        DEFAULT '',
  welcome_message         TEXT        DEFAULT 'Welcome! Tap a button to connect with us.',
  footer_brand            TEXT        DEFAULT 'NFC Cards',
  google_review_enabled   BOOLEAN     DEFAULT true,
  google_review_url       TEXT        DEFAULT '',
  google_review_text      TEXT        DEFAULT 'Leave a Review',
  whatsapp_enabled        BOOLEAN     DEFAULT true,
  whatsapp_number         TEXT        DEFAULT '',
  whatsapp_message        TEXT        DEFAULT 'Hello! I found you via your NFC card.',
  whatsapp_text           TEXT        DEFAULT 'Chat on WhatsApp',
  instagram_enabled       BOOLEAN     DEFAULT true,
  instagram_url           TEXT        DEFAULT '',
  instagram_text          TEXT        DEFAULT 'Follow on Instagram',
  bg_color                TEXT        DEFAULT '#f8fafc',
  btn_color               TEXT        DEFAULT '#6366f1',
  btn_style               TEXT        DEFAULT 'solid',
  text_color              TEXT        DEFAULT '#1e293b',
  font                    TEXT        DEFAULT 'Inter',
  border_radius           TEXT        DEFAULT 'rounded-2xl',
  layout                  TEXT        DEFAULT 'centered',
  theme                   TEXT        DEFAULT 'light',
  status                  TEXT        DEFAULT 'available',
  card_number             TEXT        DEFAULT '',
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 2. Row Level Security
-- ─────────────────────────────────────────────
ALTER TABLE business_pages ENABLE ROW LEVEL SECURITY;

-- Public read access (NFC card visitors can load a page without auth)
CREATE POLICY "Public can read pages"
  ON business_pages
  FOR SELECT
  USING (true);

-- Only the service role (backend) may insert / update / delete
CREATE POLICY "Service role can write"
  ON business_pages
  FOR ALL
  USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────
-- 3. Storage bucket for logos
-- Run these two lines separately in the SQL Editor, or create the bucket
-- via the Supabase Dashboard → Storage → New bucket (name: logos, Public: ON).
-- ─────────────────────────────────────────────
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('logos', 'logos', true)
-- ON CONFLICT (id) DO NOTHING;
