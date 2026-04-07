-- =============================================
-- FASE 7: Push subscriptions + RLS
-- =============================================

-- Tabla para suscripciones push
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint text UNIQUE NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- ROW-LEVEL SECURITY (RLS)
-- Preparación multi-usuario
-- =============================================

-- Agregar columna user_id a las tablas principales (nullable por ahora para no romper datos existentes)
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE budget_limits ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE pending_receipts ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Índices para performance en queries con user_id
CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_limits_user ON budget_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_settings_user ON settings(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);

-- Habilitar RLS en todas las tablas
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS: cada usuario solo ve sus datos
-- NOTA: user_id IS NULL permite acceso a datos legacy (pre-multiusuario)

-- Accounts
CREATE POLICY accounts_select ON accounts FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY accounts_insert ON accounts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY accounts_update ON accounts FOR UPDATE USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY accounts_delete ON accounts FOR DELETE USING (user_id = auth.uid() OR user_id IS NULL);

-- Categories
CREATE POLICY categories_select ON categories FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY categories_insert ON categories FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY categories_update ON categories FOR UPDATE USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY categories_delete ON categories FOR DELETE USING (user_id = auth.uid() OR user_id IS NULL);

-- Transactions
CREATE POLICY transactions_select ON transactions FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY transactions_insert ON transactions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY transactions_update ON transactions FOR UPDATE USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY transactions_delete ON transactions FOR DELETE USING (user_id = auth.uid() OR user_id IS NULL);

-- Budget limits
CREATE POLICY budget_limits_select ON budget_limits FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY budget_limits_insert ON budget_limits FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY budget_limits_update ON budget_limits FOR UPDATE USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY budget_limits_delete ON budget_limits FOR DELETE USING (user_id = auth.uid() OR user_id IS NULL);

-- Pending receipts
CREATE POLICY pending_receipts_select ON pending_receipts FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY pending_receipts_insert ON pending_receipts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY pending_receipts_update ON pending_receipts FOR UPDATE USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY pending_receipts_delete ON pending_receipts FOR DELETE USING (user_id = auth.uid() OR user_id IS NULL);

-- Settings
CREATE POLICY settings_select ON settings FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY settings_insert ON settings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY settings_update ON settings FOR UPDATE USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY settings_delete ON settings FOR DELETE USING (user_id = auth.uid() OR user_id IS NULL);

-- Push subscriptions
CREATE POLICY push_subs_select ON push_subscriptions FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY push_subs_insert ON push_subscriptions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY push_subs_delete ON push_subscriptions FOR DELETE USING (user_id = auth.uid() OR user_id IS NULL);

-- Exchange rates: públicas, read-only para todos
CREATE POLICY exchange_rates_select ON exchange_rates FOR SELECT USING (true);
CREATE POLICY exchange_rates_insert ON exchange_rates FOR INSERT WITH CHECK (true);
CREATE POLICY exchange_rates_update ON exchange_rates FOR UPDATE USING (true);

-- Modelo de uso: compartido
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'model_usage') THEN
    ALTER TABLE model_usage ENABLE ROW LEVEL SECURITY;
    BEGIN
      CREATE POLICY model_usage_all ON model_usage FOR ALL USING (true);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;
