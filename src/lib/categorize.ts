import { supabaseAdmin } from "@/lib/supabase/server"
import type { Category } from "@/types/database"

/**
 * Reglas de categorización para el mercado uruguayo.
 * Mapea keywords del comercio → nombre de subcategoría (o categoría padre).
 */
const RULES: { keywords: string[]; subcategory: string; parent: string }[] = [
  // Comida y bebidas
  { keywords: ["tata", "disco", "devoto", "tienda inglesa", "macro", "el dorado", "kinko", "multi ahorro", "fresh market", "geant", "supermercado", "autoservice"], subcategory: "Supermercado", parent: "Comida y bebidas" },
  { keywords: ["mcdonalds", "mcdonald", "burger king", "subway", "restaurante", "sushi", "pizza", "parrilla", "asado"], subcategory: "Restaurante", parent: "Comida y bebidas" },
  { keywords: ["rappi", "pedidosya", "delivery"], subcategory: "Delivery", parent: "Comida y bebidas" },
  { keywords: ["starbucks", "café", "cafe ", "bar ", "cervecería", "cerveceria", "pub"], subcategory: "Café y bar", parent: "Comida y bebidas" },
  { keywords: ["panadería", "panaderia", "almacén", "almacen"], subcategory: "Panadería y almacén", parent: "Comida y bebidas" },
  { keywords: ["feria", "verdulería", "verduleria", "carnicería", "carniceria"], subcategory: "Feria y verdulería", parent: "Comida y bebidas" },

  // Compras
  { keywords: ["zara", "h&m", "renner", "ropa", "calzado", "zapatería", "zapateria"], subcategory: "Ropa y calzado", parent: "Compras" },
  { keywords: ["amazon", "mercadolibre", "mercado libre", "aliexpress", "tiendamia"], subcategory: "Compras online", parent: "Compras" },
  { keywords: ["shopping", "tienda", "regalo"], subcategory: "Regalos", parent: "Compras" },

  // Vivienda
  { keywords: ["alquiler", "inmobiliaria"], subcategory: "Alquiler", parent: "Vivienda" },
  { keywords: ["ute", "electricidad"], subcategory: "UTE", parent: "Vivienda" },
  { keywords: ["ose", "agua"], subcategory: "OSE", parent: "Vivienda" },
  { keywords: ["gas", "garrafa"], subcategory: "Gas", parent: "Vivienda" },
  { keywords: ["expensas", "portería", "porteria"], subcategory: "Expensas", parent: "Vivienda" },
  { keywords: ["limpieza"], subcategory: "Limpieza", parent: "Vivienda" },

  // Transporte
  { keywords: ["stm", "bondi", "omnibus", "cutcsa", "copsa"], subcategory: "STM / Bondi", parent: "Transporte" },
  { keywords: ["uber", "cabify"], subcategory: "Uber / Cabify", parent: "Transporte" },
  { keywords: ["taxi"], subcategory: "Taxi", parent: "Transporte" },

  // Vehículo
  { keywords: ["ancap", "petrobras", "axion", "nafta", "combustible"], subcategory: "Combustible", parent: "Vehículo" },
  { keywords: ["estacionamiento", "parking"], subcategory: "Estacionamiento", parent: "Vehículo" },
  { keywords: ["peaje"], subcategory: "Peaje", parent: "Vehículo" },
  { keywords: ["taller", "gomería", "gomeria", "service"], subcategory: "Taller y service", parent: "Vehículo" },

  // Vida y entretenimiento
  { keywords: ["farmacia", "farmashop", "san roque"], subcategory: "Salud y farmacia", parent: "Vida y entretenimiento" },
  { keywords: ["mutualista", "médica", "medica", "hospital", "clínica", "clinica", "doctor", "dentista", "óptica", "optica"], subcategory: "Salud y farmacia", parent: "Vida y entretenimiento" },
  { keywords: ["gimnasio", "gym", "club deportivo"], subcategory: "Gimnasio y deporte", parent: "Vida y entretenimiento" },
  { keywords: ["netflix", "spotify", "steam", "playstation", "nintendo", "disney", "hbo", "suscripción", "suscripcion"], subcategory: "Suscripciones", parent: "Vida y entretenimiento" },
  { keywords: ["cine", "teatro", "concierto", "evento"], subcategory: "Cine y teatro", parent: "Vida y entretenimiento" },
  { keywords: ["peluquería", "peluqueria", "barbería", "barberia"], subcategory: "Cuidado personal", parent: "Vida y entretenimiento" },

  // Comunicación, PC
  { keywords: ["antel", "internet", "fibra"], subcategory: "Antel / Internet", parent: "Comunicación, PC" },
  { keywords: ["claro", "movistar", "celular"], subcategory: "Celular", parent: "Comunicación, PC" },

  // Gastos financieros
  { keywords: ["tarjeta", "visa", "mastercard", "oca", "creditel"], subcategory: "Tarjeta de crédito", parent: "Gastos financieros" },
  { keywords: ["comisión", "comision", "banco", "brou", "itaú", "itau", "santander", "scotiabank", "hsbc"], subcategory: "Comisiones bancarias", parent: "Gastos financieros" },

  // Negocios custom
  { keywords: ["pirotecnia", "pyro"], parent: "GROWTH PARTNER", subcategory: "" },
  { keywords: ["cotillón", "cotillon", "casa miguel"], parent: "GROWTH PARTNER", subcategory: "" },
  { keywords: ["growth partner", "growth"], parent: "GROWTH PARTNER", subcategory: "" },
]

/**
 * Infiere la categoría (subcategoría preferente) basándose en comercio e ítems.
 */
export async function inferCategory(
  comercio: string | null,
  items: string[],
  userId?: string
): Promise<Category | null> {
  const searchText = [comercio, ...items]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  if (!searchText) return null

  let matchedRule: (typeof RULES)[number] | null = null
  for (const rule of RULES) {
    if (rule.keywords.some((kw) => searchText.includes(kw))) {
      matchedRule = rule
      break
    }
  }

  if (!matchedRule) return null

  // Filtrar por user_id si se proporciona
  if (matchedRule.subcategory) {
    let query = supabaseAdmin
      .from("categories")
      .select("*")
      .eq("name", matchedRule.subcategory)
      .not("parent_id", "is", null)
    if (userId) query = query.eq("user_id", userId)
    const { data: sub } = await query.single()

    if (sub) return sub
  }

  let query = supabaseAdmin
    .from("categories")
    .select("*")
    .eq("name", matchedRule.parent)
    .is("parent_id", null)
  if (userId) query = query.eq("user_id", userId)
  const { data: parent } = await query.single()

  return parent ?? null
}

/** Obtiene la cuenta por defecto (GENERAL) */
export async function getDefaultAccount(userId?: string) {
  let query = supabaseAdmin
    .from("accounts")
    .select("*")
    .eq("name", "GENERAL")
  if (userId) query = query.eq("user_id", userId)
  const { data } = await query.single()
  return data
}

/** Obtiene todas las categorías padre de tipo expense */
export async function getAllCategories(userId?: string): Promise<Category[]> {
  let query = supabaseAdmin
    .from("categories")
    .select("*")
    .eq("type", "expense")
    .is("parent_id", null)
    .order("sort_order")
  if (userId) query = query.eq("user_id", userId)
  const { data } = await query
  return data ?? []
}

/** Obtiene todas las cuentas */
export async function getAllAccounts(userId?: string) {
  let query = supabaseAdmin
    .from("accounts")
    .select("*")
    .order("name")
  if (userId) query = query.eq("user_id", userId)
  const { data } = await query
  return data ?? []
}
