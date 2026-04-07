import { supabaseAdmin } from "@/lib/supabase/server"
import type { Category } from "@/types/database"

/**
 * Reglas de categorización basadas en nombres de comercios uruguayos.
 * Mapea keywords del comercio → nombre de categoría en la DB.
 */
const RULES: { keywords: string[]; category: string }[] = [
  {
    keywords: [
      "tata", "disco", "devoto", "tienda inglesa", "macro", "el dorado",
      "kinko", "multi ahorro", "fresh market", "la cabaña", "geant",
      "mcdonalds", "mcdonald", "burger king", "rappi", "pedidosya",
      "mostrador", "panadería", "panaderia", "carnicería", "carniceria",
      "almacén", "almacen", "supermercado", "autoservice", "feria",
      "restaurante", "bar ", "café", "cafe ", "pizza", "sushi",
      "heladería", "heladeria", "starbucks", "subway",
    ],
    category: "Comida y bebidas",
  },
  {
    keywords: [
      "ute", "ose", "antel", "alquiler", "expensas", "inmobiliaria",
      "portería", "porteria", "limpieza", "gas", "garrafa",
    ],
    category: "Vivienda",
  },
  {
    keywords: [
      "ancap", "petrobras", "axion", "stm", "uber", "cabify",
      "estacionamiento", "parking", "peaje", "nafta", "combustible",
      "taller", "gomería", "gomeria",
    ],
    category: "Transporte",
  },
  {
    keywords: [
      "zara", "h&m", "renner", "amazon", "mercadolibre", "mercado libre",
      "tienda", "shopping", "ropa", "calzado",
    ],
    category: "Compras",
  },
  {
    keywords: [
      "farmacia", "farmashop", "san roque", "mutualista", "médica", "medica",
      "hospital", "clínica", "clinica", "doctor", "dentista", "óptica", "optica",
    ],
    category: "Salud",
  },
  {
    keywords: [
      "cine", "netflix", "spotify", "steam", "playstation", "nintendo",
      "gimnasio", "gym", "club", "teatro", "concierto", "evento",
    ],
    category: "Vida y entretenimiento",
  },
  {
    keywords: ["pirotecnia", "pyro", "cotillón", "cotillon", "casa miguel"],
    category: "Negocios",
  },
  {
    keywords: ["growth partner", "growth"],
    category: "GROWTH PARTNER",
  },
]

/**
 * Infiere la categoría de un gasto basándose en el nombre del comercio
 * y los ítems del ticket. Devuelve la categoría de la DB o null.
 */
export async function inferCategory(
  comercio: string | null,
  items: string[]
): Promise<Category | null> {
  const searchText = [comercio, ...items]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  if (!searchText) return null

  // Buscar match en las reglas
  let matchedCategoryName: string | null = null
  for (const rule of RULES) {
    if (rule.keywords.some((kw) => searchText.includes(kw))) {
      matchedCategoryName = rule.category
      break
    }
  }

  if (!matchedCategoryName) return null

  // Obtener la categoría de la DB
  const { data } = await supabaseAdmin
    .from("categories")
    .select("*")
    .eq("name", matchedCategoryName)
    .single()

  return data ?? null
}

/** Obtiene la cuenta por defecto (GENERAL) */
export async function getDefaultAccount() {
  const { data } = await supabaseAdmin
    .from("accounts")
    .select("*")
    .eq("name", "GENERAL")
    .single()
  return data
}

/** Obtiene todas las categorías para mostrar en botones */
export async function getAllCategories(): Promise<Category[]> {
  const { data } = await supabaseAdmin
    .from("categories")
    .select("*")
    .eq("type", "expense")
    .order("name")
  return data ?? []
}

/** Obtiene todas las cuentas para mostrar en botones */
export async function getAllAccounts() {
  const { data } = await supabaseAdmin
    .from("accounts")
    .select("*")
    .order("name")
  return data ?? []
}
