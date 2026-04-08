// Plantillas de categorias por defecto extraidas del schema.sql seed data

export interface CategoryTemplate {
  name: string
  color: string
  icon: string
  type: 'income' | 'expense'
  subcategories: { name: string; color: string; icon: string }[]
}

export const CATEGORY_TEMPLATES: CategoryTemplate[] = [
  {
    name: 'Comida y bebidas',
    color: '#f97316',
    icon: 'utensils',
    type: 'expense',
    subcategories: [
      { name: 'Supermercado', color: '#f97316', icon: 'shopping-cart' },
      { name: 'Restaurante', color: '#f97316', icon: 'chef-hat' },
      { name: 'Delivery', color: '#f97316', icon: 'bike' },
      { name: 'Cafe y bar', color: '#f97316', icon: 'coffee' },
      { name: 'Panaderia y almacen', color: '#f97316', icon: 'croissant' },
      { name: 'Feria y verduleria', color: '#f97316', icon: 'apple' },
    ],
  },
  {
    name: 'Compras',
    color: '#ec4899',
    icon: 'shopping-bag',
    type: 'expense',
    subcategories: [
      { name: 'Ropa y calzado', color: '#ec4899', icon: 'shirt' },
      { name: 'Electronica', color: '#ec4899', icon: 'smartphone' },
      { name: 'Hogar y decoracion', color: '#ec4899', icon: 'lamp' },
      { name: 'Regalos', color: '#ec4899', icon: 'gift' },
      { name: 'Compras online', color: '#ec4899', icon: 'globe' },
    ],
  },
  {
    name: 'Vivienda',
    color: '#8b5cf6',
    icon: 'home',
    type: 'expense',
    subcategories: [
      { name: 'Alquiler', color: '#8b5cf6', icon: 'key' },
      { name: 'UTE', color: '#8b5cf6', icon: 'zap' },
      { name: 'OSE', color: '#8b5cf6', icon: 'droplets' },
      { name: 'Gas', color: '#8b5cf6', icon: 'flame' },
      { name: 'Expensas', color: '#8b5cf6', icon: 'building' },
      { name: 'Mantenimiento', color: '#8b5cf6', icon: 'wrench' },
      { name: 'Limpieza', color: '#8b5cf6', icon: 'sparkles' },
    ],
  },
  {
    name: 'Transporte',
    color: '#3b82f6',
    icon: 'bus',
    type: 'expense',
    subcategories: [
      { name: 'STM / Bondi', color: '#3b82f6', icon: 'credit-card' },
      { name: 'Uber / Cabify', color: '#3b82f6', icon: 'map-pin' },
      { name: 'Taxi', color: '#3b82f6', icon: 'car-taxi-front' },
      { name: 'Viaje interdepartamental', color: '#3b82f6', icon: 'route' },
    ],
  },
  {
    name: 'Vehiculo',
    color: '#0891b2',
    icon: 'car',
    type: 'expense',
    subcategories: [
      { name: 'Combustible', color: '#0891b2', icon: 'fuel' },
      { name: 'Estacionamiento', color: '#0891b2', icon: 'circle-parking' },
      { name: 'Peaje', color: '#0891b2', icon: 'toll' },
      { name: 'Taller y service', color: '#0891b2', icon: 'settings' },
      { name: 'Seguro vehiculo', color: '#0891b2', icon: 'shield' },
      { name: 'Patente', color: '#0891b2', icon: 'file-text' },
    ],
  },
  {
    name: 'Vida y entretenimiento',
    color: '#f59e0b',
    icon: 'smile',
    type: 'expense',
    subcategories: [
      { name: 'Salud y farmacia', color: '#f59e0b', icon: 'heart-pulse' },
      { name: 'Gimnasio y deporte', color: '#f59e0b', icon: 'dumbbell' },
      { name: 'Suscripciones', color: '#f59e0b', icon: 'repeat' },
      { name: 'Cine y teatro', color: '#f59e0b', icon: 'clapperboard' },
      { name: 'Salidas y ocio', color: '#f59e0b', icon: 'party-popper' },
      { name: 'Educacion', color: '#f59e0b', icon: 'graduation-cap' },
      { name: 'Cuidado personal', color: '#f59e0b', icon: 'scissors' },
    ],
  },
  {
    name: 'Comunicacion, PC',
    color: '#06b6d4',
    icon: 'monitor',
    type: 'expense',
    subcategories: [
      { name: 'Antel / Internet', color: '#06b6d4', icon: 'wifi' },
      { name: 'Celular', color: '#06b6d4', icon: 'smartphone' },
      { name: 'Software y apps', color: '#06b6d4', icon: 'app-window' },
      { name: 'Hardware', color: '#06b6d4', icon: 'hard-drive' },
    ],
  },
  {
    name: 'Gastos financieros',
    color: '#ef4444',
    icon: 'landmark',
    type: 'expense',
    subcategories: [
      { name: 'Tarjeta de credito', color: '#ef4444', icon: 'credit-card' },
      { name: 'Comisiones bancarias', color: '#ef4444', icon: 'receipt' },
      { name: 'Intereses', color: '#ef4444', icon: 'percent' },
      { name: 'Seguros', color: '#ef4444', icon: 'shield-check' },
    ],
  },
  {
    name: 'Inversiones',
    color: '#a855f7',
    icon: 'trending-up',
    type: 'expense',
    subcategories: [
      { name: 'Acciones y bonos', color: '#a855f7', icon: 'bar-chart-3' },
      { name: 'Crypto', color: '#a855f7', icon: 'bitcoin' },
      { name: 'Ahorro', color: '#a855f7', icon: 'piggy-bank' },
    ],
  },
  {
    name: 'Ingresos',
    color: '#22c55e',
    icon: 'arrow-down-circle',
    type: 'income',
    subcategories: [
      { name: 'Salario', color: '#22c55e', icon: 'banknote' },
      { name: 'Freelance', color: '#22c55e', icon: 'laptop' },
      { name: 'Ventas', color: '#22c55e', icon: 'store' },
      { name: 'Otros ingresos', color: '#22c55e', icon: 'plus-circle' },
    ],
  },
]
