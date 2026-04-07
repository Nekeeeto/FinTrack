-- Fase 6: Multi-moneda y cotizaciones
-- Ejecutar en Supabase SQL Editor

-- Tabla de cotizaciones (tipos de cambio)
CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  base_currency TEXT NOT NULL DEFAULT 'UYU',
  target_currency TEXT NOT NULL,
  buy_rate NUMERIC(14,6) NOT NULL,
  sell_rate NUMERIC(14,6) NOT NULL,
  source TEXT NOT NULL DEFAULT 'bcu', -- bcu, manual, exchangerate-api
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exchange_rates_currencies ON exchange_rates(base_currency, target_currency);
CREATE INDEX idx_exchange_rates_fetched ON exchange_rates(fetched_at DESC);

-- Vista para obtener la cotización más reciente de cada par
CREATE OR REPLACE VIEW latest_exchange_rates AS
SELECT DISTINCT ON (base_currency, target_currency)
  id, base_currency, target_currency, buy_rate, sell_rate, source, fetched_at
FROM exchange_rates
ORDER BY base_currency, target_currency, fetched_at DESC;

-- Seed: cotizaciones iniciales (referencia, se actualizan via API)
INSERT INTO exchange_rates (base_currency, target_currency, buy_rate, sell_rate, source) VALUES
  ('UYU', 'USD', 0.0232, 0.0240, 'manual'),    -- ~1 USD = 42 UYU
  ('UYU', 'BRL', 0.1370, 0.1420, 'manual'),     -- ~1 BRL = 7.2 UYU
  ('UYU', 'ARS', 28.50, 29.50, 'manual');        -- ~1 ARS = 0.035 UYU
