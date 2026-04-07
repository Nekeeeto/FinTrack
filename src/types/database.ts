export type AccountType = 'checking' | 'savings' | 'cash' | 'investment' | 'business'
export type TransactionSource = 'manual' | 'telegram' | 'import'
export type CategoryType = 'income' | 'expense'
export type Currency = 'UYU' | 'USD'

export interface Account {
  id: string
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
