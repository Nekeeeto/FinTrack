import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAuth, isAuthError } from "@/lib/auth"
import type { Category } from "@/types/database"

// GET /api/categories?flat=true para lista plana, sin param para árbol
export async function GET(req: NextRequest) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const flat = req.nextUrl.searchParams.get("flat") === "true"

  const { data, error } = await auth.supabase
    .from("categories")
    .select("*")
    .eq("user_id", auth.userId)
    .order("sort_order")
    .order("name")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (flat) return NextResponse.json(data)

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
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  const body = await req.json()
  const parsed = categorySchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data, error } = await auth.supabase
    .from("categories")
    .insert({ ...parsed.data, user_id: auth.userId })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}
