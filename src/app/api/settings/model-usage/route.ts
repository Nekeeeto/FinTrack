import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

// GET /api/settings/model-usage — estadísticas de uso por modelo
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("model_usage")
      .select("model, action, input_tokens, output_tokens, cost_usd")

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Agregar por modelo
    const byModel: Record<
      string,
      { photos: number; input_tokens: number; output_tokens: number; cost_usd: number }
    > = {}

    for (const row of data ?? []) {
      if (!byModel[row.model]) {
        byModel[row.model] = { photos: 0, input_tokens: 0, output_tokens: 0, cost_usd: 0 }
      }
      byModel[row.model].photos += 1
      byModel[row.model].input_tokens += row.input_tokens
      byModel[row.model].output_tokens += row.output_tokens
      byModel[row.model].cost_usd += Number(row.cost_usd)
    }

    return NextResponse.json(byModel)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
