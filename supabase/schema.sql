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

-- Tabla de categorías (con subcategorías via parent_id)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6b7280',
  icon TEXT NOT NULL DEFAULT 'tag',
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_categories_parent ON categories(parent_id);

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

-- Tracking de uso de modelos AI
CREATE TABLE model_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT 'ocr',
  input_tokens INT NOT NULL DEFAULT 0,
  output_tokens INT NOT NULL DEFAULT 0,
  cost_usd NUMERIC(10,6) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_model_usage_model ON model_usage(model);
CREATE INDEX idx_model_usage_created ON model_usage(created_at DESC);

-- Seed: Cuentas
INSERT INTO accounts (name, type, currency, balance, color, icon) VALUES
  ('GENERAL', 'cash', 'UYU', 0, '#1a1a1a', 'wallet'),
  ('PYRO.UY', 'business', 'UYU', 0, '#1e3a8a', 'briefcase'),
  ('CASA MIGUEL', 'business', 'UYU', 0, '#dc2626', 'home'),
  ('DÓLARES', 'savings', 'USD', 0, '#16a34a', 'banknote');

-- Seed: Categorías principales + subcategorías
-- Comida y bebidas
INSERT INTO categories (id, name, color, icon, type, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Comida y bebidas', '#f97316', 'utensils', 'expense', 1);
INSERT INTO categories (parent_id, name, color, icon, type, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Supermercado', '#f97316', 'shopping-cart', 'expense', 1),
  ('a0000000-0000-0000-0000-000000000001', 'Restaurante', '#f97316', 'chef-hat', 'expense', 2),
  ('a0000000-0000-0000-0000-000000000001', 'Delivery', '#f97316', 'bike', 'expense', 3),
  ('a0000000-0000-0000-0000-000000000001', 'Café y bar', '#f97316', 'coffee', 'expense', 4),
  ('a0000000-0000-0000-0000-000000000001', 'Panadería y almacén', '#f97316', 'croissant', 'expense', 5),
  ('a0000000-0000-0000-0000-000000000001', 'Feria y verdulería', '#f97316', 'apple', 'expense', 6);

-- Compras
INSERT INTO categories (id, name, color, icon, type, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000002', 'Compras', '#ec4899', 'shopping-bag', 'expense', 2);
INSERT INTO categories (parent_id, name, color, icon, type, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000002', 'Ropa y calzado', '#ec4899', 'shirt', 'expense', 1),
  ('a0000000-0000-0000-0000-000000000002', 'Electrónica', '#ec4899', 'smartphone', 'expense', 2),
  ('a0000000-0000-0000-0000-000000000002', 'Hogar y decoración', '#ec4899', 'lamp', 'expense', 3),
  ('a0000000-0000-0000-0000-000000000002', 'Regalos', '#ec4899', 'gift', 'expense', 4),
  ('a0000000-0000-0000-0000-000000000002', 'Compras online', '#ec4899', 'globe', 'expense', 5);

-- Vivienda
INSERT INTO categories (id, name, color, icon, type, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000003', 'Vivienda', '#8b5cf6', 'home', 'expense', 3);
INSERT INTO categories (parent_id, name, color, icon, type, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000003', 'Alquiler', '#8b5cf6', 'key', 'expense', 1),
  ('a0000000-0000-0000-0000-000000000003', 'UTE', '#8b5cf6', 'zap', 'expense', 2),
  ('a0000000-0000-0000-0000-000000000003', 'OSE', '#8b5cf6', 'droplets', 'expense', 3),
  ('a0000000-0000-0000-0000-000000000003', 'Gas', '#8b5cf6', 'flame', 'expense', 4),
  ('a0000000-0000-0000-0000-000000000003', 'Expensas', '#8b5cf6', 'building', 'expense', 5),
  ('a0000000-0000-0000-0000-000000000003', 'Mantenimiento', '#8b5cf6', 'wrench', 'expense', 6),
  ('a0000000-0000-0000-0000-000000000003', 'Limpieza', '#8b5cf6', 'sparkles', 'expense', 7);

-- Transporte
INSERT INTO categories (id, name, color, icon, type, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000004', 'Transporte', '#3b82f6', 'bus', 'expense', 4);
INSERT INTO categories (parent_id, name, color, icon, type, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000004', 'STM / Bondi', '#3b82f6', 'credit-card', 'expense', 1),
  ('a0000000-0000-0000-0000-000000000004', 'Uber / Cabify', '#3b82f6', 'map-pin', 'expense', 2),
  ('a0000000-0000-0000-0000-000000000004', 'Taxi', '#3b82f6', 'car-taxi-front', 'expense', 3),
  ('a0000000-0000-0000-0000-000000000004', 'Viaje interdepartamental', '#3b82f6', 'route', 'expense', 4);

-- Vehículo
INSERT INTO categories (id, name, color, icon, type, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000005', 'Vehículo', '#0891b2', 'car', 'expense', 5);
INSERT INTO categories (parent_id, name, color, icon, type, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000005', 'Combustible', '#0891b2', 'fuel', 'expense', 1),
  ('a0000000-0000-0000-0000-000000000005', 'Estacionamiento', '#0891b2', 'circle-parking', 'expense', 2),
  ('a0000000-0000-0000-0000-000000000005', 'Peaje', '#0891b2', 'toll', 'expense', 3),
  ('a0000000-0000-0000-0000-000000000005', 'Taller y service', '#0891b2', 'settings', 'expense', 4),
  ('a0000000-0000-0000-0000-000000000005', 'Seguro vehículo', '#0891b2', 'shield', 'expense', 5),
  ('a0000000-0000-0000-0000-000000000005', 'Patente', '#0891b2', 'file-text', 'expense', 6);

-- Vida y entretenimiento
INSERT INTO categories (id, name, color, icon, type, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000006', 'Vida y entretenimiento', '#f59e0b', 'smile', 'expense', 6);
INSERT INTO categories (parent_id, name, color, icon, type, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000006', 'Salud y farmacia', '#f59e0b', 'heart-pulse', 'expense', 1),
  ('a0000000-0000-0000-0000-000000000006', 'Gimnasio y deporte', '#f59e0b', 'dumbbell', 'expense', 2),
  ('a0000000-0000-0000-0000-000000000006', 'Suscripciones', '#f59e0b', 'repeat', 'expense', 3),
  ('a0000000-0000-0000-0000-000000000006', 'Cine y teatro', '#f59e0b', 'clapperboard', 'expense', 4),
  ('a0000000-0000-0000-0000-000000000006', 'Salidas y ocio', '#f59e0b', 'party-popper', 'expense', 5),
  ('a0000000-0000-0000-0000-000000000006', 'Educación', '#f59e0b', 'graduation-cap', 'expense', 6),
  ('a0000000-0000-0000-0000-000000000006', 'Cuidado personal', '#f59e0b', 'scissors', 'expense', 7);

-- Comunicación, PC
INSERT INTO categories (id, name, color, icon, type, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000007', 'Comunicación, PC', '#06b6d4', 'monitor', 'expense', 7);
INSERT INTO categories (parent_id, name, color, icon, type, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000007', 'Antel / Internet', '#06b6d4', 'wifi', 'expense', 1),
  ('a0000000-0000-0000-0000-000000000007', 'Celular', '#06b6d4', 'smartphone', 'expense', 2),
  ('a0000000-0000-0000-0000-000000000007', 'Software y apps', '#06b6d4', 'app-window', 'expense', 3),
  ('a0000000-0000-0000-0000-000000000007', 'Hardware', '#06b6d4', 'hard-drive', 'expense', 4);

-- Gastos financieros
INSERT INTO categories (id, name, color, icon, type, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000008', 'Gastos financieros', '#ef4444', 'landmark', 'expense', 8);
INSERT INTO categories (parent_id, name, color, icon, type, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000008', 'Tarjeta de crédito', '#ef4444', 'credit-card', 'expense', 1),
  ('a0000000-0000-0000-0000-000000000008', 'Comisiones bancarias', '#ef4444', 'receipt', 'expense', 2),
  ('a0000000-0000-0000-0000-000000000008', 'Intereses', '#ef4444', 'percent', 'expense', 3),
  ('a0000000-0000-0000-0000-000000000008', 'Seguros', '#ef4444', 'shield-check', 'expense', 4);

-- Inversiones
INSERT INTO categories (id, name, color, icon, type, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000009', 'Inversiones', '#a855f7', 'trending-up', 'expense', 9);
INSERT INTO categories (parent_id, name, color, icon, type, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000009', 'Acciones y bonos', '#a855f7', 'bar-chart-3', 'expense', 1),
  ('a0000000-0000-0000-0000-000000000009', 'Crypto', '#a855f7', 'bitcoin', 'expense', 2),
  ('a0000000-0000-0000-0000-000000000009', 'Ahorro', '#a855f7', 'piggy-bank', 'expense', 3);

-- Ingresos
INSERT INTO categories (id, name, color, icon, type, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000010', 'Ingresos', '#22c55e', 'arrow-down-circle', 'income', 10);
INSERT INTO categories (parent_id, name, color, icon, type, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000010', 'Salario', '#22c55e', 'banknote', 'income', 1),
  ('a0000000-0000-0000-0000-000000000010', 'Freelance', '#22c55e', 'laptop', 'income', 2),
  ('a0000000-0000-0000-0000-000000000010', 'Ventas', '#22c55e', 'store', 'income', 3),
  ('a0000000-0000-0000-0000-000000000010', 'Otros ingresos', '#22c55e', 'plus-circle', 'income', 4);

-- GROWTH PARTNER
INSERT INTO categories (id, name, color, icon, type, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000011', 'GROWTH PARTNER', '#0ea5e9', 'rocket', 'expense', 11);
