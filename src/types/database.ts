export type AccountType = 'checking' | 'savings' | 'cash' | 'investment' | 'business'
export type TransactionSource = 'manual' | 'telegram' | 'import' | 'webapp'
export type CategoryType = 'income' | 'expense'
export type Currency = 'UYU' | 'USD' | 'BRL' | 'ARS'
export type UserRole = 'admin' | 'user'
export type UserPlan = 'free' | 'premium'

export interface ExchangeRate {
  id: string
  base_currency: Currency
  target_currency: Currency
  buy_rate: number
  sell_rate: number
  source: 'bcu' | 'manual' | 'exchangerate-api'
  fetched_at: string
}

export interface Account {
  id: string
  user_id: string
  name: string
  type: AccountType
  currency: Currency
  balance: number
  color: string
  icon: string
  created_at: string
}

export interface Category {
  id: string
  user_id: string
  parent_id: string | null
  name: string
  color: string
  icon: string
  type: CategoryType
  sort_order: number
  // Joined
  subcategories?: Category[]
}

export interface Transaction {
  id: string
  user_id: string
  account_id: string
  category_id: string
  amount: number
  currency: Currency
  description: string
  date: string
  source: TransactionSource
  receipt_url: string | null
  raw_ocr_data: Record<string, unknown> | null
  created_at: string
  // Joined fields
  account?: Account
  category?: Category
}

export interface BudgetLimit {
  id: string
  user_id: string
  category_id: string
  amount: number
  currency: Currency
  period: 'monthly'
  created_at: string
  updated_at: string
  // Joined
  category?: Category
  // Calculated
  spent?: number
  percentage?: number
}

export type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'

export interface RecurringPayment {
  id: string
  user_id: string
  account_id: string
  category_id: string
  amount: number
  currency: Currency
  description: string
  frequency: RecurringFrequency
  day_of_month: number | null
  day_of_week: number | null
  start_date: string
  end_date: string | null
  next_due_date: string
  last_generated_date: string | null
  active: boolean
  created_at: string
  updated_at: string
  // Joined
  account?: Account
  category?: Category
}

export interface UserProfile {
  user_id: string
  name: string
  email: string
  role: UserRole
  plan: UserPlan
  photo_count_month: number
  photo_reset_date: string
  onboarding_completed: boolean
  created_at: string
}

export interface OnboardingSession {
  id: string
  user_id: string
  flow_version: string
  objectives: string[]
  selected_categories: unknown[]
  total_duration_ms: number | null
  steps_timing_ms: Record<string, number> | null
  ai_used: boolean
  ai_attempts: number
  created_at: string
}
