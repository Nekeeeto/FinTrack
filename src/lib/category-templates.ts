export interface CategoryTemplate {
  name: string
  color: string
  icon: string
  type: "income" | "expense"
  subcategories: { name: string; color: string; icon: string }[]
}

export interface OnboardingObjective {
  id: string
  label: string
  description: string
}

export const ONBOARDING_OBJECTIVES: OnboardingObjective[] = [
  {
    id: "organizar_finanzas",
    label: "Organizar mis finanzas",
    description: "Tener todo ordenado y claro mes a mes.",
  },
  {
    id: "pagar_deudas",
    label: "Pagar mis deudas",
    description: "Priorizar pagos y bajar intereses.",
  },
  {
    id: "ahorrar_dinero",
    label: "Ahorrar dinero",
    description: "Separar plata para objetivos concretos.",
  },
  {
    id: "crear_presupuesto",
    label: "Crear un presupuesto",
    description: "Definir limites y controlar gastos.",
  },
]

export const CATEGORY_TEMPLATES: CategoryTemplate[] = [
  {
    name: "Transporte",
    color: "#6D5EF4",
    icon: "car",
    type: "expense",
    subcategories: [
      { name: "Gasolina", color: "#6D5EF4", icon: "car" },
      { name: "Estacionamiento", color: "#6D5EF4", icon: "car" },
      { name: "Transporte publico", color: "#6D5EF4", icon: "bus" },
      { name: "Mantenimiento vehiculo", color: "#6D5EF4", icon: "car" },
      { name: "Taxis", color: "#6D5EF4", icon: "car" },
      { name: "Seguro vehicular", color: "#6D5EF4", icon: "car" },
    ],
  },
  {
    name: "Salud",
    color: "#FF5B5B",
    icon: "heart-pulse",
    type: "expense",
    subcategories: [
      { name: "Seguro medico", color: "#FF5B5B", icon: "heart-pulse" },
      { name: "Consultas", color: "#FF5B5B", icon: "heart-pulse" },
      { name: "Farmacia", color: "#FF5B5B", icon: "heart-pulse" },
      { name: "Tratamientos", color: "#FF5B5B", icon: "heart-pulse" },
    ],
  },
  {
    name: "Bienestar",
    color: "#14B8A6",
    icon: "smile",
    type: "expense",
    subcategories: [
      { name: "Actividad fisica", color: "#14B8A6", icon: "smile" },
      { name: "Belleza", color: "#14B8A6", icon: "smile" },
      { name: "Articulos deportivos", color: "#14B8A6", icon: "smile" },
      { name: "Aseo personal", color: "#14B8A6", icon: "smile" },
      { name: "Peluqueria", color: "#14B8A6", icon: "smile" },
    ],
  },
  {
    name: "Vestimenta",
    color: "#FF5DAD",
    icon: "shopping-bag",
    type: "expense",
    subcategories: [
      { name: "Ropa", color: "#FF5DAD", icon: "shopping-bag" },
      { name: "Zapatos", color: "#FF5DAD", icon: "shopping-bag" },
      { name: "Bolsos", color: "#FF5DAD", icon: "shopping-bag" },
      { name: "Accesorios", color: "#FF5DAD", icon: "shopping-bag" },
      { name: "Lavanderia", color: "#FF5DAD", icon: "shopping-bag" },
    ],
  },
  {
    name: "Entretenimiento",
    color: "#F6C945",
    icon: "music",
    type: "expense",
    subcategories: [
      { name: "Suscripciones", color: "#F6C945", icon: "music" },
      { name: "Eventos y salidas", color: "#F6C945", icon: "music" },
      { name: "Hobbies", color: "#F6C945", icon: "music" },
      { name: "Videojuegos", color: "#F6C945", icon: "music" },
      { name: "Recreacion", color: "#F6C945", icon: "music" },
      { name: "Alcohol y tabaco", color: "#F6C945", icon: "music" },
    ],
  },
  {
    name: "Viajes",
    color: "#38BDF8",
    icon: "briefcase",
    type: "expense",
    subcategories: [
      { name: "Transporte viaje", color: "#38BDF8", icon: "briefcase" },
      { name: "Alojamiento", color: "#38BDF8", icon: "briefcase" },
      { name: "Seguro de viaje", color: "#38BDF8", icon: "briefcase" },
      { name: "Tramites de viaje", color: "#38BDF8", icon: "briefcase" },
    ],
  },
  {
    name: "Hogar",
    color: "#A78BFA",
    icon: "home",
    type: "expense",
    subcategories: [
      { name: "Alquiler", color: "#A78BFA", icon: "home" },
      { name: "Servicios", color: "#A78BFA", icon: "home" },
      { name: "Mantenimiento", color: "#A78BFA", icon: "home" },
      { name: "Muebles", color: "#A78BFA", icon: "home" },
      { name: "Limpieza", color: "#A78BFA", icon: "home" },
    ],
  },
  {
    name: "Comida y bebidas",
    color: "#FB923C",
    icon: "utensils",
    type: "expense",
    subcategories: [
      { name: "Supermercado", color: "#FB923C", icon: "utensils" },
      { name: "Restaurantes", color: "#FB923C", icon: "utensils" },
      { name: "Delivery", color: "#FB923C", icon: "utensils" },
      { name: "Cafe y bar", color: "#FB923C", icon: "utensils" },
      { name: "Snacks", color: "#FB923C", icon: "utensils" },
    ],
  },
  {
    name: "Educacion",
    color: "#60A5FA",
    icon: "monitor",
    type: "expense",
    subcategories: [
      { name: "Cursos", color: "#60A5FA", icon: "monitor" },
      { name: "Libros", color: "#60A5FA", icon: "monitor" },
      { name: "Materiales", color: "#60A5FA", icon: "monitor" },
      { name: "Capacitaciones", color: "#60A5FA", icon: "monitor" },
    ],
  },
  {
    name: "Finanzas",
    color: "#EF4444",
    icon: "landmark",
    type: "expense",
    subcategories: [
      { name: "Tarjetas", color: "#EF4444", icon: "landmark" },
      { name: "Comisiones", color: "#EF4444", icon: "landmark" },
      { name: "Intereses", color: "#EF4444", icon: "landmark" },
      { name: "Prestamos", color: "#EF4444", icon: "landmark" },
      { name: "Impuestos", color: "#EF4444", icon: "landmark" },
    ],
  },
  {
    name: "Inversiones",
    color: "#A855F7",
    icon: "trending-up",
    type: "expense",
    subcategories: [
      { name: "Fondos", color: "#A855F7", icon: "trending-up" },
      { name: "Acciones", color: "#A855F7", icon: "trending-up" },
      { name: "Crypto", color: "#A855F7", icon: "trending-up" },
      { name: "Ahorro en dolares", color: "#A855F7", icon: "trending-up" },
    ],
  },
  {
    name: "Salario",
    color: "#22C55E",
    icon: "banknote",
    type: "income",
    subcategories: [
      { name: "Sueldo principal", color: "#22C55E", icon: "banknote" },
      { name: "Horas extra", color: "#22C55E", icon: "banknote" },
      { name: "Aguinaldo", color: "#22C55E", icon: "banknote" },
    ],
  },
  {
    name: "Freelance",
    color: "#3B82F6",
    icon: "briefcase",
    type: "income",
    subcategories: [
      { name: "Clientes locales", color: "#3B82F6", icon: "briefcase" },
      { name: "Clientes exterior", color: "#3B82F6", icon: "briefcase" },
      { name: "Proyectos extra", color: "#3B82F6", icon: "briefcase" },
    ],
  },
  {
    name: "Inversiones",
    color: "#10B981",
    icon: "trending-up",
    type: "income",
    subcategories: [
      { name: "Intereses", color: "#10B981", icon: "trending-up" },
      { name: "Dividendos", color: "#10B981", icon: "trending-up" },
      { name: "Rendimientos", color: "#10B981", icon: "trending-up" },
    ],
  },
  {
    name: "Alquileres",
    color: "#F97316",
    icon: "home",
    type: "income",
    subcategories: [
      { name: "Alquiler vivienda", color: "#F97316", icon: "home" },
      { name: "Alquiler local", color: "#F97316", icon: "home" },
      { name: "Cochera", color: "#F97316", icon: "home" },
    ],
  },
  {
    name: "Ventas",
    color: "#EC4899",
    icon: "wallet",
    type: "income",
    subcategories: [
      { name: "Ventas online", color: "#EC4899", icon: "wallet" },
      { name: "Ventas fisicas", color: "#EC4899", icon: "wallet" },
      { name: "Comisiones", color: "#EC4899", icon: "wallet" },
    ],
  },
  {
    name: "Otros ingresos",
    color: "#94A3B8",
    icon: "arrow-down-circle",
    type: "income",
    subcategories: [
      { name: "Regalos", color: "#94A3B8", icon: "arrow-down-circle" },
      { name: "Reembolsos", color: "#94A3B8", icon: "arrow-down-circle" },
      { name: "Bonos", color: "#94A3B8", icon: "arrow-down-circle" },
    ],
  },
]
