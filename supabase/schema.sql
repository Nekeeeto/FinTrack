-- FinTrack Database Schema
-- Ejecutar en Supabase SQL Editor

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de cuentas
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'cash',
  currency TEXT NOT NULL DEFAULT 'UYU',
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#1a1a1a',
  icon TEXT NOT NULL DEFAULT 'wallet',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de categorías
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6b7280',
  icon TEXT NOT NULL DEFAULT 'tag',
  type TEXT NOT NULL CHECK (type IN ('income', 'expense'))
);

-- Tabla de transacciones
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'UYU',
  description TEXT NOT NULL DEFAULT '',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'telegram', 'import')),
  receipt_url TEXT,
  raw_ocr_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_date ON transactions(date DESC);

-- Seed: Cuentas
INSERT INTO accounts (name, type, currency, balance, color, icon) VALUES
  ('GENERAL', 'cash', 'UYU', 0, '#1a1a1a', 'wallet'),
  ('PYRO.UY', 'business', 'UYU', 0, '#1e3a8a', 'briefcase'),
  ('CASA MIGUEL', 'business', 'UYU', 0, '#dc2626', 'home'),
  ('DÓLARES', 'savings', 'USD', 0, '#16a34a', 'banknote');

-- Tabla de configuración (key-value para API keys y settings)
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de receipts pendientes de confirmación en Telegram
CREATE TABLE pending_receipts (
  key TEXT PRIMARY KEY,
  chat_id BIGINT NOT NULL,
  message_id BIGINT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed: Categorías
INSERT INTO categories (name, color, icon, type) VALUES
  ('Comida y bebidas', '#f97316', 'utensils', 'expense'),
  ('Vivienda', '#8b5cf6', 'home', 'expense'),
  ('Transporte', '#3b82f6', 'car', 'expense'),
  ('Compras', '#ec4899', 'shopping-bag', 'expense'),
  ('Salud', '#10b981', 'heart-pulse', 'expense'),
  ('Vida y entretenimiento', '#f59e0b', 'music', 'expense'),
  ('Negocios', '#6366f1', 'briefcase', 'expense'),
  ('GROWTH PARTNER', '#0ea5e9', 'trending-up', 'expense'),
  ('Ingreso', '#22c55e', 'arrow-down-circle', 'income');
