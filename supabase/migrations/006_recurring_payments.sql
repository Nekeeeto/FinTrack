-- Tabla de pagos recurrentes
CREATE TABLE IF NOT EXISTS recurring_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'UYU' CHECK (currency IN ('UYU', 'USD', 'BRL', 'ARS')),
  description TEXT NOT NULL DEFAULT '',
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'yearly')),
  day_of_month INTEGER CHECK (day_of_month IS NULL OR (day_of_month >= 1 AND day_of_month <= 31)),
  day_of_week INTEGER CHECK (day_of_week IS NULL OR (day_of_week >= 0 AND day_of_week <= 6)),
  start_date DATE NOT NULL,
  end_date DATE,
  next_due_date DATE NOT NULL,
  last_generated_date DATE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE recurring_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own recurring payments"
  ON recurring_payments
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Índices
CREATE INDEX idx_recurring_payments_user ON recurring_payments(user_id);
CREATE INDEX idx_recurring_payments_next_due ON recurring_payments(next_due_date) WHERE active = true;
