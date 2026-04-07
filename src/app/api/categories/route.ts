import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { supabaseAdmin } from "@/lib/supabase/server"
import type { Category } from "@/types/database"

// GET /api/categories?flat=true para lista plana, sin param para árbol
export async function GET(req: NextRequest) {
  const flat = req.nextUrl.searchParams.get("flat") === "true"

  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .order("sort_order")
    .order("name")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (flat) return NextResponse.json(data)

  // Construir árbol
  const categories = data as Category[]
  const parents = categories.filter((c) => !c.parent_id)
  const tree = parents.map((parent) => ({
    ...parent,
    subcategories: categories
      .filter((c) => c.parent_id === parent.id)
      .sort((a, b) => a.sort_order - b.sort_order),
  }))

  return NextResponse.json(tree)
}

const categorySchema = z.object({
  parent_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1),
  color: z.string().default("#6b7280"),
  icon: z.string().default("tag"),
  type: z.enum(["income", "expense"]),
  sort_order: z.number().int().default(0),
})

// POST /api/categories
export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = categorySchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from("categories")
    .insert(parsed.data)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}
