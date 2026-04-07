"use client"

import { useEffect, useState } from "react"
import { Settings, Send, Brain, Eye, EyeOff, Loader2, CheckCircle2, XCircle, Cpu, Bell } from "lucide-react"
import { PushSettings } from "@/components/push-settings"

interface SettingState {
  configured: boolean
  preview: string
}

type SettingsMap = Record<string, SettingState>

interface TestResult {
  ok: boolean
  message?: string
  error?: string
  model?: string
}

interface ModelUsageData {
  photos: number
  input_tokens: number
  output_tokens: number
  cost_usd: number
}

const SETTING_LABELS: Record<string, { label: string; placeholder: string; description: string }> = {
  TELEGRAM_BOT_TOKEN: {
    label: "Telegram Bot Token",
    placeholder: "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11",
    description: "Token del bot creado con @BotFather",
  },
  TELEGRAM_WEBHOOK_SECRET: {
    label: "Telegram Webhook Secret",
    placeholder: "mi-secreto-seguro-123",
    description: "Secret para verificar que los webhooks vienen de Telegram",
  },
  TELEGRAM_CHAT_ID: {
    label: "Tu Chat ID de Telegram",
    placeholder: "123456789",
    description: "Tu ID de chat. Mandá /start al bot y fijate en los logs, o usá @userinfobot",
  },
  ANTHROPIC_API_KEY: {
    label: "Anthropic API Key",
    placeholder: "sk-ant-api03-...",
    description: "API key de Anthropic para Claude Vision (OCR de tickets)",
  },
}

const MODELS = [
  { id: "claude-opus-4-20250514", label: "Opus 4", tier: "Máxima calidad", priceIn: "$15", priceOut: "$75" },
  { id: "claude-sonnet-4-20250514", label: "Sonnet 4", tier: "Balance calidad/costo", priceIn: "$3", priceOut: "$15" },
  { id: "claude-haiku-4-5-20251001", label: "Haiku 4.5", tier: "Más económico", priceIn: "$0.80", priceOut: "$4" },
]

export default function ConfiguracionPage() {
  const [settings, setSettings] = useState<SettingsMap>({})
  const [loading, setLoading] = useState(true)
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [showValues, setShowValues] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saveResult, setSaveResult] = useState<Record<string, "ok" | "error" | null>>({})
  const [testingTelegram, setTestingTelegram] = useState(false)
  const [testingAnthropic, setTestingAnthropic] = useState(false)
  const [telegramResult, setTelegramResult] = useState<TestResult | null>(null)
  const [anthropicResult, setAnthropicResult] = useState<TestResult | null>(null)
  const [selectedModel, setSelectedModel] = useState("claude-sonnet-4-20250514")
  const [savingModel, setSavingModel] = useState(false)
  const [modelUsage, setModelUsage] = useState<Record<string, ModelUsageData>>({})

  useEffect(() => {
    fetchSettings()
    fetchModelUsage()
  }, [])

  async function fetchSettings() {
    try {
      const res = await fetch("/api/settings")
      const data = await res.json()
      setSettings(data)
      // Si hay modelo configurado, seleccionarlo
      if (data.ANTHROPIC_MODEL?.preview) {
        // El preview viene enmascarado, necesitamos el valor real del modelo
        // Buscamos un match parcial en los modelos disponibles
        const modelPreview = data.ANTHROPIC_MODEL.preview
        const match = MODELS.find((m) => modelPreview.includes(m.id.slice(-4)))
        if (match) setSelectedModel(match.id)
      }
    } catch {
      // silenciar
    } finally {
      setLoading(false)
    }
  }

  async function fetchModelUsage() {
    try {
      const res = await fetch("/api/settings/model-usage")
      const data = await res.json()
      if (!data.error) setModelUsage(data)
    } catch {
      // silenciar
    }
  }

  async function saveSetting(key: string) {
    const value = editValues[key]
    if (!value?.trim()) return

    setSaving((s) => ({ ...s, [key]: true }))
    setSaveResult((s) => ({ ...s, [key]: null }))

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: value.trim() }),
      })
      if (res.ok) {
        setSaveResult((s) => ({ ...s, [key]: "ok" }))
        setEditValues((v) => ({ ...v, [key]: "" }))
        await fetchSettings()
      } else {
        setSaveResult((s) => ({ ...s, [key]: "error" }))
      }
    } catch {
      setSaveResult((s) => ({ ...s, [key]: "error" }))
    } finally {
      setSaving((s) => ({ ...s, [key]: false }))
    }
  }

  async function saveModel(modelId: string) {
    setSavingModel(true)
    setSelectedModel(modelId)
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "ANTHROPIC_MODEL", value: modelId }),
      })
    } catch {
      // silenciar
    } finally {
      setSavingModel(false)
    }
  }

  async function testTelegram() {
    setTestingTelegram(true)
    setTelegramResult(null)
    try {
      const res = await fetch("/api/settings/test-telegram", { method: "POST" })
      const data: TestResult = await res.json()
      setTelegramResult(data)
    } catch {
      setTelegramResult({ ok: false, error: "Error de conexión" })
    } finally {
      setTestingTelegram(false)
    }
  }

  async function testAnthropic() {
    setTestingAnthropic(true)
    setAnthropicResult(null)
    try {
      const res = await fetch("/api/settings/test-anthropic", { method: "POST" })
      const data: TestResult = await res.json()
      setAnthropicResult(data)
    } catch {
      setAnthropicResult({ ok: false, error: "Error de conexión" })
    } finally {
      setTestingAnthropic(false)
    }
  }

  const totalCost = Object.values(modelUsage).reduce((sum, m) => sum + m.cost_usd, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Configuración
        </h1>
        <p className="text-muted-foreground mt-1">
          API keys, modelo de IA y tracking de costos.
        </p>
      </div>

      {/* --- Sección Telegram --- */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Send className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Telegram Bot</h2>
            <p className="text-sm text-muted-foreground">Conexión con el bot de Telegram</p>
          </div>
        </div>

        {(["TELEGRAM_BOT_TOKEN", "TELEGRAM_WEBHOOK_SECRET", "TELEGRAM_CHAT_ID"] as const).map(
          (key) => (
            <SettingField
              key={key}
              settingKey={key}
              config={SETTING_LABELS[key]}
              state={settings[key]}
              editValue={editValues[key] ?? ""}
              showValue={showValues[key] ?? false}
              saving={saving[key] ?? false}
              saveResult={saveResult[key] ?? null}
              onEditChange={(v) => setEditValues((prev) => ({ ...prev, [key]: v }))}
              onToggleShow={() => setShowValues((prev) => ({ ...prev, [key]: !prev[key] }))}
              onSave={() => saveSetting(key)}
            />
          )
        )}

        <div className="pt-2 border-t border-border">
          <button
            onClick={testTelegram}
            disabled={testingTelegram}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {testingTelegram ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Bot test — Enviar mensaje de prueba
          </button>
          {telegramResult && <ResultBadge result={telegramResult} />}
        </div>
      </section>

      {/* --- Sección Anthropic --- */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <Brain className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Anthropic (Claude Vision)</h2>
            <p className="text-sm text-muted-foreground">OCR inteligente para tickets y boletas</p>
          </div>
        </div>

        <SettingField
          settingKey="ANTHROPIC_API_KEY"
          config={SETTING_LABELS.ANTHROPIC_API_KEY}
          state={settings.ANTHROPIC_API_KEY}
          editValue={editValues.ANTHROPIC_API_KEY ?? ""}
          showValue={showValues.ANTHROPIC_API_KEY ?? false}
          saving={saving.ANTHROPIC_API_KEY ?? false}
          saveResult={saveResult.ANTHROPIC_API_KEY ?? null}
          onEditChange={(v) => setEditValues((prev) => ({ ...prev, ANTHROPIC_API_KEY: v }))}
          onToggleShow={() => setShowValues((prev) => ({ ...prev, ANTHROPIC_API_KEY: !prev.ANTHROPIC_API_KEY }))}
          onSave={() => saveSetting("ANTHROPIC_API_KEY")}
        />

        <div className="pt-2 border-t border-border">
          <button
            onClick={testAnthropic}
            disabled={testingAnthropic}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
          >
            {testingAnthropic ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
            Test — Verificar API Key
          </button>
          {anthropicResult && <ResultBadge result={anthropicResult} />}
        </div>
      </section>

      {/* --- Selector de modelo --- */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Cpu className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Modelo de IA</h2>
            <p className="text-sm text-muted-foreground">Elegí qué modelo usa el OCR de tickets</p>
          </div>
        </div>

        <div className="space-y-2">
          {MODELS.map((model) => {
            const isSelected = selectedModel === model.id
            const usage = modelUsage[model.id]
            return (
              <button
                key={model.id}
                onClick={() => saveModel(model.id)}
                disabled={savingModel}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  isSelected
                    ? "border-purple-500 bg-purple-500/5"
                    : "border-border hover:border-purple-500/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{model.label}</span>
                      {isSelected && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500 font-medium">
                          ACTIVO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{model.tier}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>In: {model.priceIn}/1M tok</p>
                    <p>Out: {model.priceOut}/1M tok</p>
                  </div>
                </div>
                {usage && (
                  <div className="mt-2 pt-2 border-t border-border flex gap-4 text-xs text-muted-foreground">
                    <span>{usage.photos} foto{usage.photos !== 1 ? "s" : ""}</span>
                    <span>{(usage.input_tokens + usage.output_tokens).toLocaleString()} tokens</span>
                    <span className="font-medium text-foreground">
                      US$ {usage.cost_usd.toFixed(4)}
                    </span>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {totalCost > 0 && (
          <div className="pt-3 border-t border-border flex items-center justify-between">
            <span className="text-sm font-medium">Costo total acumulado</span>
            <span className="text-sm font-bold">US$ {totalCost.toFixed(4)}</span>
          </div>
        )}
      </section>

      {/* --- Notificaciones Push --- */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <Bell className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Notificaciones Push</h2>
            <p className="text-sm text-muted-foreground">Avisos cuando el bot procesa un ticket y resumen semanal</p>
          </div>
        </div>
        <PushSettings />
      </section>

      {/* --- Instrucciones --- */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-3">
        <h2 className="font-semibold text-lg">Pasos para configurar</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>Abrí Telegram, buscá <strong>@BotFather</strong> y creá un bot con <code>/newbot</code>. Copiá el token.</li>
          <li>Pegá el token arriba en <strong>Telegram Bot Token</strong> y guardá.</li>
          <li>Mandá <code>/start</code> a tu bot. Usá <strong>@userinfobot</strong> en Telegram para obtener tu Chat ID.</li>
          <li>Pegá tu Chat ID arriba y guardá.</li>
          <li>Hacé click en <strong>&quot;Bot test&quot;</strong> para verificar.</li>
          <li>Andá a{" "}
            <a href="https://console.anthropic.com/" target="_blank" rel="noopener" className="text-amber-500 underline">
              console.anthropic.com
            </a>{" "}y copiá tu API key.</li>
          <li>Pegala arriba y hacé click en <strong>&quot;Test&quot;</strong> para verificar.</li>
          <li>Elegí el modelo de IA y probá con distintos tickets para comparar calidad y costo.</li>
        </ol>
      </section>
    </div>
  )
}

// --- Componentes internos ---

function SettingField({
  settingKey,
  config,
  state,
  editValue,
  showValue,
  saving,
  saveResult,
  onEditChange,
  onToggleShow,
  onSave,
}: {
  settingKey: string
  config: { label: string; placeholder: string; description: string }
  state?: SettingState
  editValue: string
  showValue: boolean
  saving: boolean
  saveResult: "ok" | "error" | null
  onEditChange: (v: string) => void
  onToggleShow: () => void
  onSave: () => void
}) {
  const configured = state?.configured ?? false

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{config.label}</label>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            configured ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
          }`}
        >
          {configured ? "Configurado" : "No configurado"}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{config.description}</p>
      {configured && state?.preview && (
        <p className="text-xs text-muted-foreground font-mono">Actual: {state.preview}</p>
      )}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={showValue ? "text" : "password"}
            value={editValue}
            onChange={(e) => onEditChange(e.target.value)}
            placeholder={config.placeholder}
            className="w-full px-3 py-2 pr-10 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono"
            onKeyDown={(e) => e.key === "Enter" && onSave()}
          />
          <button
            onClick={onToggleShow}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <button
          onClick={onSave}
          disabled={saving || !editValue?.trim()}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
        </button>
      </div>
      {saveResult === "ok" && (
        <p className="text-xs text-emerald-500 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" /> Guardado
        </p>
      )}
      {saveResult === "error" && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <XCircle className="h-3 w-3" /> Error al guardar
        </p>
      )}
    </div>
  )
}

function ResultBadge({ result }: { result: TestResult }) {
  return (
    <div
      className={`mt-3 p-3 rounded-lg text-sm ${
        result.ok
          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
          : "bg-red-500/10 text-red-500 border border-red-500/20"
      }`}
    >
      <div className="flex items-center gap-2">
        {result.ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
        <span className="font-medium">{result.ok ? "Éxito" : "Error"}</span>
      </div>
      <p className="mt-1">{result.message || result.error}</p>
      {result.model && <p className="text-xs mt-1 opacity-70">Modelo: {result.model}</p>}
    </div>
  )
}
