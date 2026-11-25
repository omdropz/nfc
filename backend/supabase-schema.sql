-- ====================================================================
-- NFC SAGE / OMDROPZ PLATFORM — RELATIONAL SUPABASE SCHEMA
-- Run this SQL in the Supabase SQL Editor: Dashboard -> SQL Editor -> New Query
-- ====================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────────────
-- 1. BUSINESSES TABLE
-- Stores client business entities (One business can have multiple NFC cards)
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS businesses (
  id                      TEXT PRIMARY KEY,
  name                    TEXT NOT NULL DEFAULT 'My Business',
  category                TEXT DEFAULT 'Other',
  logo_url                TEXT DEFAULT '',
  welcome_message         TEXT DEFAULT 'Welcome! Tap a button to connect with us.',
  footer_brand            TEXT DEFAULT 'OMDROPZ',
  -- Core Social Action Buttons (strictly limited to business links)
  google_review_enabled   BOOLEAN DEFAULT true,
  google_review_url       TEXT DEFAULT '',
  google_review_text      TEXT DEFAULT 'Google Review',
  whatsapp_enabled        BOOLEAN DEFAULT true,
  whatsapp_number         TEXT DEFAULT '',
  whatsapp_message        TEXT DEFAULT 'Hello! I found your NFC card.',
  whatsapp_text           TEXT DEFAULT 'Chat on WhatsApp',
  instagram_enabled       BOOLEAN DEFAULT true,
  instagram_url           TEXT DEFAULT '',
  instagram_text          TEXT DEFAULT 'Follow on Instagram',
  -- Owner Access credentials
  owner_phone             TEXT DEFAULT '',
  owner_pin               TEXT DEFAULT '',
  owner_access_enabled    BOOLEAN DEFAULT false,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────────
-- 2. NFC_CARDS TABLE
-- Stores the 50 permanent PVC NFC cards (001 to 050)
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nfc_cards (
  card_id                 TEXT PRIMARY KEY, -- '001', '002', ..., '050'
  card_number             TEXT NOT NULL,    -- 3-digit card number string
  status                  TEXT NOT NULL DEFAULT 'available', -- 'available' | 'assigned' | 'linked' | 'active'
  business_id             TEXT REFERENCES businesses(id) ON DELETE SET NULL,
  permanent_url           TEXT NOT NULL,    -- https://nfc-sage.vercel.app/c/001
  nfc_url                 TEXT NOT NULL,    -- URL written to physical NTAG213 tag
  qrhub_qr_id             TEXT,             -- Optional dynamic QR Hub ID
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nfc_cards_business_id ON nfc_cards(business_id);
CREATE INDEX IF NOT EXISTS idx_nfc_cards_status ON nfc_cards(status);

-- ────────────────────────────────────────────────────────────────────
-- 3. OWNER_ACCOUNTS TABLE
-- Dedicated owner portal credentials & access permissions
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS owner_accounts (
  id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id             TEXT REFERENCES businesses(id) ON DELETE CASCADE,
  mobile_number           TEXT NOT NULL UNIQUE,
  pin_hash                TEXT NOT NULL,
  is_active               BOOLEAN DEFAULT true,
  last_login              TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────────
-- 4. BUSINESS_PAGES TABLE (Legacy backward compatibility)
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS business_pages (
  id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id                 TEXT UNIQUE NOT NULL,
  business_name           TEXT NOT NULL DEFAULT 'My Business',
  logo_url                TEXT DEFAULT '',
  welcome_message         TEXT DEFAULT 'Welcome! Tap a button to connect with us.',
  footer_brand            TEXT DEFAULT 'OMDROPZ',
  google_review_enabled   BOOLEAN DEFAULT true,
  google_review_url       TEXT DEFAULT '',
  google_review_text      TEXT DEFAULT 'Google Review',
  whatsapp_enabled        BOOLEAN DEFAULT true,
  whatsapp_number         TEXT DEFAULT '',
  whatsapp_message        TEXT DEFAULT 'Hello! I found your NFC card.',
  whatsapp_text           TEXT DEFAULT 'Chat on WhatsApp',
  instagram_enabled       BOOLEAN DEFAULT true,
  instagram_url           TEXT DEFAULT '',
  instagram_text          TEXT DEFAULT 'Follow on Instagram',
  bg_color                TEXT DEFAULT '#050507',
  btn_color               TEXT DEFAULT '#a3e635',
  btn_style               TEXT DEFAULT 'solid',
  text_color              TEXT DEFAULT '#ffffff',
  font                    TEXT DEFAULT 'Poppins',
  border_radius           TEXT DEFAULT 'rounded-2xl',
  layout                  TEXT DEFAULT 'centered',
  theme                   TEXT DEFAULT 'dark',
  status                  TEXT DEFAULT 'available',
  card_number             TEXT DEFAULT '',
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────────────
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfc_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_pages ENABLE ROW LEVEL SECURITY;

-- Public read policies: Public visitors tapping NFC / scanning QR must resolve businesses & cards
CREATE POLICY "Public read businesses" ON businesses FOR SELECT USING (true);
CREATE POLICY "Public read nfc_cards" ON nfc_cards FOR SELECT USING (true);
CREATE POLICY "Public read business_pages" ON business_pages FOR SELECT USING (true);

-- Service role & authenticated admin full access
CREATE POLICY "Service role full access businesses" ON businesses FOR ALL USING (true);
CREATE POLICY "Service role full access nfc_cards" ON nfc_cards FOR ALL USING (true);
CREATE POLICY "Service role full access owner_accounts" ON owner_accounts FOR ALL USING (true);
CREATE POLICY "Service role full access business_pages" ON business_pages FOR ALL USING (true);
