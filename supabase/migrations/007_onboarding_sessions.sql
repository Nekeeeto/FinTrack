-- Analytics de onboarding (flow mobile-first v2)
CREATE TABLE IF NOT EXISTS onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flow_version TEXT NOT NULL DEFAULT 'onboarding_v2_mobile',
  objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
  selected_categories JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_duration_ms INT,
  steps_timing_ms JSONB,
  ai_used BOOLEAN NOT NULL DEFAULT false,
  ai_attempts INT NOT NULL DEFAULT 0 CHECK (ai_attempts >= 0 AND ai_attempts <= 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_user ON onboarding_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_created ON onboarding_sessions(created_at DESC);

ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS onboarding_sessions_select_own ON onboarding_sessions;
DROP POLICY IF EXISTS onboarding_sessions_insert_own ON onboarding_sessions;
DROP POLICY IF EXISTS onboarding_sessions_select_admin ON onboarding_sessions;

CREATE POLICY onboarding_sessions_select_own ON onboarding_sessions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY onboarding_sessions_insert_own ON onboarding_sessions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY onboarding_sessions_select_admin ON onboarding_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM user_profiles up
      WHERE up.user_id = auth.uid() AND up.role = 'admin'
    )
  );
