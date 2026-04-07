-- =============================================
-- FASE 8: Multi-tenant, user_profiles, RLS estricto
-- =============================================
-- IMPORTANTE: Antes de correr esta migración:
-- 1. El admin debe haberse logueado al menos una vez (para tener registro en auth.users)
-- 2. Reemplazar '<ADMIN_UUID>' con el UUID real del admin (de auth.users)
-- 3. Reemplazar '<ADMIN_EMAIL>' con el email real del admin

-- =============================================
-- 1. Tabla user_profiles
-- =============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  photo_count_month INT NOT NULL DEFAULT 0,
  photo_reset_date DATE NOT NULL DEFAULT (date_trunc('month', CURRENT_DATE) + interval '1 month')::date,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS para user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Cada usuario puede ver su propio perfil
CREATE POLICY user_profiles_select_own ON user_profiles
  FOR SELECT USING (user_id = auth.uid());

-- Admin puede ver todos los perfiles
CREATE POLICY user_profiles_select_admin ON user_profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles up WHERE up.user_id = auth.uid() AND up.role = 'admin')
  );

-- Cada usuario puede actualizar su propio perfil
CREATE POLICY user_profiles_update_own ON user_profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Solo admin puede insertar perfiles (al crear usuarios)
CREATE POLICY user_profiles_insert_admin ON user_profiles
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles up WHERE up.user_id = auth.uid() AND up.role = 'admin')
  );

-- Solo admin puede eliminar perfiles
CREATE POLICY user_profiles_delete_admin ON user_profiles
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_profiles up WHERE up.user_id = auth.uid() AND up.role = 'admin')
  );

-- =============================================
-- 2. Agregar user_id a model_usage (si no existe)
-- =============================================
ALTER TABLE model_usage ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_model_usage_user ON model_usage(user_id);

-- =============================================
-- 3. Asignar datos existentes al admin
-- REEMPLAZAR '<ADMIN_UUID>' CON EL UUID REAL
-- =============================================
UPDATE accounts SET user_id = '<ADMIN_UUID>' WHERE user_id IS NULL;
UPDATE categories SET user_id = '<ADMIN_UUID>' WHERE user_id IS NULL;
UPDATE transactions SET user_id = '<ADMIN_UUID>' WHERE user_id IS NULL;
UPDATE budget_limits SET user_id = '<ADMIN_UUID>' WHERE user_id IS NULL;
UPDATE pending_receipts SET user_id = '<ADMIN_UUID>' WHERE user_id IS NULL;
UPDATE settings SET user_id = '<ADMIN_UUID>' WHERE user_id IS NULL;
UPDATE push_subscriptions SET user_id = '<ADMIN_UUID>' WHERE user_id IS NULL;
UPDATE model_usage SET user_id = '<ADMIN_UUID>' WHERE user_id IS NULL;

-- =============================================
-- 4. Hacer user_id NOT NULL en tablas principales
-- =============================================
ALTER TABLE accounts ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE categories ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE transactions ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE budget_limits ALTER COLUMN user_id SET NOT NULL;

-- =============================================
-- 5. Agregar 'webapp' al CHECK constraint de transactions.source
-- =============================================
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_source_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_source_check
  CHECK (source IN ('manual', 'telegram', 'import', 'webapp'));

-- =============================================
-- 6. Dropear políticas RLS permisivas (las de fase 7 con IS NULL)
-- =============================================

-- Accounts
DROP POLICY IF EXISTS accounts_select ON accounts;
DROP POLICY IF EXISTS accounts_insert ON accounts;
DROP POLICY IF EXISTS accounts_update ON accounts;
DROP POLICY IF EXISTS accounts_delete ON accounts;

-- Categories
DROP POLICY IF EXISTS categories_select ON categories;
DROP POLICY IF EXISTS categories_insert ON categories;
DROP POLICY IF EXISTS categories_update ON categories;
DROP POLICY IF EXISTS categories_delete ON categories;

-- Transactions
DROP POLICY IF EXISTS transactions_select ON transactions;
DROP POLICY IF EXISTS transactions_insert ON transactions;
DROP POLICY IF EXISTS transactions_update ON transactions;
DROP POLICY IF EXISTS transactions_delete ON transactions;

-- Budget limits
DROP POLICY IF EXISTS budget_limits_select ON budget_limits;
DROP POLICY IF EXISTS budget_limits_insert ON budget_limits;
DROP POLICY IF EXISTS budget_limits_update ON budget_limits;
DROP POLICY IF EXISTS budget_limits_delete ON budget_limits;

-- Pending receipts
DROP POLICY IF EXISTS pending_receipts_select ON pending_receipts;
DROP POLICY IF EXISTS pending_receipts_insert ON pending_receipts;
DROP POLICY IF EXISTS pending_receipts_update ON pending_receipts;
DROP POLICY IF EXISTS pending_receipts_delete ON pending_receipts;

-- Settings
DROP POLICY IF EXISTS settings_select ON settings;
DROP POLICY IF EXISTS settings_insert ON settings;
DROP POLICY IF EXISTS settings_update ON settings;
DROP POLICY IF EXISTS settings_delete ON settings;

-- Push subscriptions
DROP POLICY IF EXISTS push_subs_select ON push_subscriptions;
DROP POLICY IF EXISTS push_subs_insert ON push_subscriptions;
DROP POLICY IF EXISTS push_subs_delete ON push_subscriptions;

-- Model usage
DROP POLICY IF EXISTS model_usage_all ON model_usage;

-- =============================================
-- 7. Crear políticas RLS estrictas (sin IS NULL)
-- =============================================

-- Accounts: cada usuario solo ve/edita sus cuentas
CREATE POLICY accounts_select ON accounts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY accounts_insert ON accounts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY accounts_update ON accounts FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY accounts_delete ON accounts FOR DELETE USING (user_id = auth.uid());

-- Categories: cada usuario solo ve/edita sus categorías
CREATE POLICY categories_select ON categories FOR SELECT USING (user_id = auth.uid());
CREATE POLICY categories_insert ON categories FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY categories_update ON categories FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY categories_delete ON categories FOR DELETE USING (user_id = auth.uid());

-- Transactions: cada usuario solo ve/edita sus transacciones
CREATE POLICY transactions_select ON transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY transactions_insert ON transactions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY transactions_update ON transactions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY transactions_delete ON transactions FOR DELETE USING (user_id = auth.uid());

-- Budget limits
CREATE POLICY budget_limits_select ON budget_limits FOR SELECT USING (user_id = auth.uid());
CREATE POLICY budget_limits_insert ON budget_limits FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY budget_limits_update ON budget_limits FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY budget_limits_delete ON budget_limits FOR DELETE USING (user_id = auth.uid());

-- Pending receipts
CREATE POLICY pending_receipts_select ON pending_receipts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY pending_receipts_insert ON pending_receipts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY pending_receipts_update ON pending_receipts FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY pending_receipts_delete ON pending_receipts FOR DELETE USING (user_id = auth.uid());

-- Settings: admin puede ver/editar todo, usuarios solo sus propios settings
CREATE POLICY settings_select ON settings FOR SELECT USING (
  user_id = auth.uid() OR user_id IS NULL OR
  EXISTS (SELECT 1 FROM user_profiles up WHERE up.user_id = auth.uid() AND up.role = 'admin')
);
CREATE POLICY settings_insert ON settings FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_profiles up WHERE up.user_id = auth.uid() AND up.role = 'admin')
);
CREATE POLICY settings_update ON settings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_profiles up WHERE up.user_id = auth.uid() AND up.role = 'admin')
);
CREATE POLICY settings_delete ON settings FOR DELETE USING (
  EXISTS (SELECT 1 FROM user_profiles up WHERE up.user_id = auth.uid() AND up.role = 'admin')
);

-- Push subscriptions
CREATE POLICY push_subs_select ON push_subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY push_subs_insert ON push_subscriptions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY push_subs_delete ON push_subscriptions FOR DELETE USING (user_id = auth.uid());

-- Model usage: usuario ve su propio uso, admin ve todo
CREATE POLICY model_usage_select_own ON model_usage FOR SELECT USING (user_id = auth.uid());
CREATE POLICY model_usage_select_admin ON model_usage FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles up WHERE up.user_id = auth.uid() AND up.role = 'admin')
);
CREATE POLICY model_usage_insert ON model_usage FOR INSERT WITH CHECK (true);

-- Exchange rates: públicas (no cambia)
-- Ya existen las políticas de exchange_rates como públicas

-- =============================================
-- 8. Crear perfil del admin
-- REEMPLAZAR '<ADMIN_UUID>' Y '<ADMIN_EMAIL>'
-- =============================================
INSERT INTO user_profiles (user_id, name, email, role, plan, onboarding_completed)
VALUES ('<ADMIN_UUID>', 'Admin', '<ADMIN_EMAIL>', 'admin', 'premium', true)
ON CONFLICT (user_id) DO NOTHING;
