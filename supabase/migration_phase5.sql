-- Fase 5: Presupuestos por categoría
-- Ejecutar en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS budget_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'UYU',
  period TEXT NOT NULL DEFAULT 'monthly' CHECK (period IN ('monthly')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(category_id)
);

CREATE INDEX idx_budget_limits_category ON budget_limits(category_id);
