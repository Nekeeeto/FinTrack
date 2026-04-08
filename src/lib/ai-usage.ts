import type Anthropic from "@anthropic-ai/sdk"
import { supabaseAdmin } from "@/lib/supabase/server"

// Precios por 1M tokens (USD) — actualizados mayo 2025
export const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "claude-opus-4-20250514": { input: 15, output: 75 },
  "claude-sonnet-4-20250514": { input: 3, output: 15 },
  "claude-haiku-4-5-20251001": { input: 0.80, output: 4 },
}

export const DEFAULT_MODEL = "claude-sonnet-4-20250514"

export async function trackUsage(
  model: string,
  response: Anthropic.Message,
  action: string,
  userId?: string
) {
  const inputTokens = response.usage.input_tokens
  const outputTokens = response.usage.output_tokens
  const pricing = MODEL_PRICING[model] ?? MODEL_PRICING[DEFAULT_MODEL]
  const costUsd =
    (inputTokens / 1_000_000) * pricing.input +
    (outputTokens / 1_000_000) * pricing.output

  await supabaseAdmin.from("model_usage").insert({
    model,
    action,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_usd: costUsd,
    user_id: userId ?? null,
  })
}
