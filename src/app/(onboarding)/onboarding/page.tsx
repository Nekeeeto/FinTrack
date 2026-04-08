"use client"

import { useState, useMemo } from "react"
import {
  User,
  Tags,
  Wallet,
  PartyPopper,
  ChevronRight,
  ChevronLeft,
  Check,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  LayoutList,
  Home,
  Briefcase,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { CATEGORY_TEMPLATES, type CategoryTemplate } from "@/lib/category-templates"

// --- Tipos ---
interface OnboardingAccount {
  name: string
  type: string
  currency: string
}

type CategoryMode = "default" | "ai" | null

const CURRENCY_FLAGS: Record<string, string> = {
  UYU: "🇺🇾",
  USD: "🇺🇸",
  BRL: "🇧🇷",
  ARS: "🇦🇷",
}

const TRANSPORTE_OPTIONS = ["Auto", "Bondi", "Bici", "A pie", "Uber/Cabify", "Moto"]
const PLATAFORMA_OPTIONS = ["MercadoLibre", "Instagram", "TiendaNube", "Shopify", "Feria presencial", "Otro"]

// --- Componente selector de opciones (reemplaza Sí/No rígido) ---
function OptionChips({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[]
  value: string | null
  onChange: (v: string | null) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const isActive = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(isActive ? null : opt.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              isActive
                ? "bg-emerald-500 border-emerald-500 text-white"
                : "border-border text-muted-foreground hover:border-emerald-500/50"
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// --- Componente multi-select chips ---
function MultiChips({
  options,
  selected,
  onChange,
}: {
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
}) {
  function toggle(opt: string) {
    onChange(
      selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt]
    )
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isActive = selected.includes(opt)
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              isActive
                ? "bg-emerald-500/10 border-emerald-500 text-emerald-500"
                : "border-border text-muted-foreground hover:border-emerald-500/50"
            }`}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function OnboardingPage() {
  // --- Step navigation ---
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // --- Step 1: Info básica ---
  const [name, setName] = useState("")
  const [categoryMode, setCategoryMode] = useState<CategoryMode>(null)

  // --- Step 2: Vida cotidiana (solo AI) ---
  const [vivienda, setVivienda] = useState<string | null>(null) // "alquilo", "propia", "con_familia"
  const [delivery, setDelivery] = useState<string | null>(null) // "mucho", "a_veces", "los_findes", "nunca"
  const [cocina, setCocina] = useState<string | null>(null) // "siempre", "bastante", "poco", "nunca"
  const [trabajo, setTrabajo] = useState("")
  const [transporte, setTransporte] = useState<string[]>([])
  const [hijos, setHijos] = useState<string | null>(null) // "no", "1", "2", "3+"
  const [mascotas, setMascotas] = useState<string | null>(null) // "no", "perro", "gato", "varios"
  const [detallesExtra, setDetallesExtra] = useState("")

  // --- Step 3: Crecimiento (solo AI, opcional) ---
  const [tieneNegocio, setTieneNegocio] = useState<boolean | null>(null)
  const [nombreNegocio, setNombreNegocio] = useState("")
  const [descripcionNegocio, setDescripcionNegocio] = useState("")
  const [plataformas, setPlataformas] = useState<string[]>([])

  // --- Categorías ---
  const [categories, setCategories] = useState<CategoryTemplate[]>(CATEGORY_TEMPLATES)
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(
    () => new Set(CATEGORY_TEMPLATES.map((_, i) => i))
  )
  const [deselectedSubs, setDeselectedSubs] = useState<Set<string>>(new Set())
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())

  // --- AI ---
  const [aiLoading, setAiLoading] = useState(false)
  const [aiProgress, setAiProgress] = useState(0)
  const [aiAttempts, setAiAttempts] = useState(0)
  const [aiGenerated, setAiGenerated] = useState(false)

  // --- Cuentas ---
  const [accounts, setAccounts] = useState<OnboardingAccount[]>([
    { name: "Efectivo", type: "cash", currency: "UYU" },
  ])

  // ============================================================
  // Pasos dinámicos según el path
  // ============================================================
  const visibleSteps = useMemo(() => {
    const base = [
      { id: "welcome", label: "Info", icon: User },
    ]
    if (categoryMode === "ai") {
      base.push({ id: "vida", label: "Tu día a día", icon: Home })
      if (tieneNegocio) {
        base.push({ id: "negocio", label: "Negocio", icon: Briefcase })
      }
    }
    base.push(
      { id: "categories", label: "Categorías", icon: Tags },
      { id: "accounts", label: "Cuentas", icon: Wallet },
      { id: "done", label: "Listo", icon: PartyPopper },
    )
    return base
  }, [categoryMode, tieneNegocio])

  // Mapeo de step numérico a id
  const currentStepId = visibleSteps[step - 1]?.id ?? "welcome"
  const totalSteps = visibleSteps.length

  // ============================================================
  // Categorías: toggle, expand, etc.
  // ============================================================
  function toggleCategory(index: number) {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  function toggleSubcategory(catIdx: number, subIdx: number) {
    const key = `${catIdx}-${subIdx}`
    setDeselectedSubs((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function toggleExpanded(index: number) {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  // ============================================================
  // AI generation
  // ============================================================
  async function generateAiCategories() {
    if (aiAttempts >= 2) return
    setAiLoading(true)
    setAiProgress(0)
    setError("")

    const interval = setInterval(() => {
      setAiProgress((prev) => {
        if (prev >= 90) return prev
        const increment = prev < 30 ? 4 : prev < 60 ? 2 : 0.5
        return Math.min(prev + increment, 90)
      })
    }, 300)

    try {
      const res = await fetch("/api/onboarding/suggest-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vida_cotidiana: {
            vivienda,
            delivery,
            cocina,
            trabajo,
            transporte,
            hijos,
            mascotas,
            detalles_extra: detallesExtra,
          },
          crecimiento: tieneNegocio
            ? {
                nombre_negocio: nombreNegocio,
                descripcion_negocio: descripcionNegocio,
                plataformas,
              }
            : null,
          attempt: aiAttempts + 1,
        }),
      })

      clearInterval(interval)

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Error generando categorías")
        setAiLoading(false)
        setAiProgress(0)
        return
      }

      setAiProgress(100)
      const aiCats: CategoryTemplate[] = await res.json()
      await new Promise((r) => setTimeout(r, 400))

      setCategories(aiCats)
      setSelectedCategories(new Set(aiCats.map((_, i) => i)))
      setDeselectedSubs(new Set())
      setExpandedCategories(new Set())
      setAiAttempts((a) => a + 1)
      setAiGenerated(true)
    } catch {
      clearInterval(interval)
      setError("Error de conexión. Intentá de nuevo.")
    } finally {
      setAiLoading(false)
      setAiProgress(0)
    }
  }

  // ============================================================
  // Cuentas
  // ============================================================
  function addAccount() {
    setAccounts((prev) => [...prev, { name: "", type: "checking", currency: "UYU" }])
  }
  function removeAccount(index: number) {
    if (accounts.length <= 1) return
    setAccounts((prev) => prev.filter((_, i) => i !== index))
  }
  function updateAccount(index: number, field: keyof OnboardingAccount, value: string) {
    setAccounts((prev) =>
      prev.map((acc, i) => (i === index ? { ...acc, [field]: value } : acc))
    )
  }

  // ============================================================
  // Navegación
  // ============================================================
  function canAdvance(): boolean {
    switch (currentStepId) {
      case "welcome":
        return name.trim().length > 0 && categoryMode !== null
      case "vida":
        return true // todo es opcional
      case "negocio":
        return true // opcional
      case "categories":
        return selectedCategories.size > 0
      case "accounts":
        return accounts.every((a) => a.name.trim().length > 0)
      default:
        return true
    }
  }

  function nextStep() {
    // Si eligió default en welcome, saltar vida/negocio
    if (currentStepId === "welcome" && categoryMode === "default") {
      setCategories(CATEGORY_TEMPLATES)
      setSelectedCategories(new Set(CATEGORY_TEMPLATES.map((_, i) => i)))
      setDeselectedSubs(new Set())
    }

    // Si en "vida" y tieneNegocio es false/null, saltar paso negocio
    // (el visibleSteps ya lo maneja, pero por si acaso)

    // Si es el paso de categorías en modo AI y no se generó aún → generar
    if (currentStepId === "vida" || currentStepId === "negocio") {
      // Al avanzar del último paso de cuestionario, disparar generación
      const nextId = visibleSteps[step]?.id
      if (nextId === "categories" && categoryMode === "ai" && !aiGenerated) {
        generateAiCategories()
      }
    }

    // Si es el paso de cuentas → submit
    if (currentStepId === "accounts") {
      submitOnboarding()
      return
    }

    setStep((s) => Math.min(s + 1, totalSteps))
  }

  function prevStep() {
    setError("")
    setStep((s) => Math.max(s - 1, 1))
  }

  // ============================================================
  // Submit
  // ============================================================
  async function submitOnboarding() {
    setLoading(true)
    setError("")

    const finalCategories: CategoryTemplate[] = categories
      .filter((_, i) => selectedCategories.has(i))
      .map((cat, _catIdx) => {
        const originalIdx = categories.indexOf(cat)
        const filteredSubs = cat.subcategories.filter((_, subIdx) => {
          return !deselectedSubs.has(`${originalIdx}-${subIdx}`)
        })
        return { ...cat, subcategories: filteredSubs }
      })

    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), categories: finalCategories, accounts }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error?.toString() || "Error al completar el onboarding")
        setLoading(false)
        return
      }

      setStep(totalSteps) // paso "Listo"
    } catch {
      setError("Error de conexión. Intentá de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  function goToDashboard() {
    window.location.href = "/inicio"
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="w-full max-w-2xl px-4 py-8">
      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {visibleSteps.map((s, idx) => {
          const StepIcon = s.icon
          const stepNum = idx + 1
          const isActive = step === stepNum
          const isCompleted = step > stepNum
          return (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`flex size-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  isActive
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : isCompleted
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                      : "border-muted-foreground/30 text-muted-foreground"
                }`}
              >
                {isCompleted ? <Check className="size-5" /> : <StepIcon className="size-5" />}
              </div>
              {idx < visibleSteps.length - 1 && (
                <div className={`hidden h-0.5 w-6 sm:block ${isCompleted ? "bg-emerald-500" : "bg-muted-foreground/20"}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* ======================== WELCOME ======================== */}
      {currentStepId === "welcome" && (
        <Card>
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-emerald-500/10">
              <span className="text-3xl font-bold text-emerald-500">$</span>
            </div>
            <CardTitle className="text-2xl">¡Bienvenido a Biyuya!</CardTitle>
            <CardDescription className="text-base mt-2">
              Vamos a personalizar tu experiencia en menos de 2 minutos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">¿Cómo te llamás?</Label>
              <Input
                id="name"
                placeholder="Ej: Juan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && canAdvance() && nextStep()}
                autoFocus
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label>¿Cómo querés armar tus categorías?</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCategoryMode("default")}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-5 text-center transition-all ${
                    categoryMode === "default"
                      ? "border-emerald-500 bg-emerald-500/5"
                      : "border-muted hover:border-emerald-500/50"
                  }`}
                >
                  <LayoutList className="size-7 text-emerald-500" />
                  <p className="font-semibold text-sm">Categorías por defecto</p>
                  <p className="text-xs text-muted-foreground">Rápido — las más comunes ya armadas.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryMode("ai")}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-5 text-center transition-all ${
                    categoryMode === "ai"
                      ? "border-emerald-500 bg-emerald-500/5"
                      : "border-muted hover:border-emerald-500/50"
                  }`}
                >
                  <Sparkles className="size-7 text-emerald-500" />
                  <p className="font-semibold text-sm">Personalizadas con IA</p>
                  <p className="text-xs text-muted-foreground">Te hacemos unas preguntas y armamos todo a medida.</p>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ======================== VIDA COTIDIANA ======================== */}
      {currentStepId === "vida" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Tu día a día</CardTitle>
            <CardDescription>
              Cuanto más detalle nos des, mejor personalizamos tus categorías.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Vivienda */}
            <div className="space-y-2">
              <Label className="text-sm">Vivienda</Label>
              <OptionChips
                options={[
                  { label: "Alquilo", value: "alquilo" },
                  { label: "Propia", value: "propia" },
                  { label: "Con familia", value: "con_familia" },
                ]}
                value={vivienda}
                onChange={setVivienda}
              />
            </div>

            {/* Cocina */}
            <div className="space-y-2">
              <Label className="text-sm">¿Cocinás en casa?</Label>
              <OptionChips
                options={[
                  { label: "Siempre", value: "siempre" },
                  { label: "Bastante", value: "bastante" },
                  { label: "Poco", value: "poco" },
                  { label: "Nunca", value: "nunca" },
                ]}
                value={cocina}
                onChange={setCocina}
              />
            </div>

            {/* Delivery */}
            <div className="space-y-2">
              <Label className="text-sm">¿Pedís delivery?</Label>
              <OptionChips
                options={[
                  { label: "Mucho", value: "mucho" },
                  { label: "A veces", value: "a_veces" },
                  { label: "Los fines", value: "los_findes" },
                  { label: "Nunca", value: "nunca" },
                ]}
                value={delivery}
                onChange={setDelivery}
              />
            </div>

            {/* Hijos */}
            <div className="space-y-2">
              <Label className="text-sm">¿Tenés hijos?</Label>
              <OptionChips
                options={[
                  { label: "No", value: "no" },
                  { label: "1", value: "1" },
                  { label: "2", value: "2" },
                  { label: "3+", value: "3+" },
                ]}
                value={hijos}
                onChange={setHijos}
              />
            </div>

            {/* Mascotas */}
            <div className="space-y-2">
              <Label className="text-sm">¿Mascotas?</Label>
              <OptionChips
                options={[
                  { label: "No", value: "no" },
                  { label: "Perro", value: "perro" },
                  { label: "Gato", value: "gato" },
                  { label: "Varios", value: "varios" },
                ]}
                value={mascotas}
                onChange={setMascotas}
              />
            </div>

            {/* Trabajo */}
            <div className="space-y-2">
              <Label htmlFor="trabajo">¿De qué trabajás?</Label>
              <Input
                id="trabajo"
                placeholder="Ej: Programador, docente, comerciante..."
                value={trabajo}
                onChange={(e) => setTrabajo(e.target.value)}
              />
            </div>

            {/* Transporte */}
            <div className="space-y-2">
              <Label>¿Cómo te movés?</Label>
              <MultiChips options={TRANSPORTE_OPTIONS} selected={transporte} onChange={setTransporte} />
            </div>

            {/* Detalles extra */}
            <div className="space-y-2">
              <Label htmlFor="detalles">¿Algo más que nos quieras contar?</Label>
              <textarea
                id="detalles"
                value={detallesExtra}
                onChange={(e) => setDetallesExtra(e.target.value)}
                placeholder="Ej: Pago ANDA todos los meses, voy al gimnasio, tengo suscripciones a Spotify y Netflix..."
                className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm min-h-[80px] resize-none outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              />
            </div>

            {/* Gate de negocio */}
            <div className="rounded-xl border border-border bg-card/50 p-4 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">¿Tenés un emprendimiento o negocio?</p>
                  <p className="text-xs text-muted-foreground">Te armamos categorías específicas.</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setTieneNegocio(tieneNegocio === true ? null : true)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      tieneNegocio === true
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-border text-muted-foreground hover:border-emerald-500/50"
                    }`}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => setTieneNegocio(tieneNegocio === false ? null : false)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      tieneNegocio === false
                        ? "bg-muted border-border text-foreground"
                        : "border-border text-muted-foreground hover:border-muted-foreground/50"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ======================== CRECIMIENTO / NEGOCIO ======================== */}
      {currentStepId === "negocio" && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10">
                <Briefcase className="size-5 text-emerald-500" />
              </div>
              <div>
                <CardTitle className="text-2xl">Tu negocio</CardTitle>
                <CardDescription>
                  Esto nos ayuda a crear categorías específicas para tu emprendimiento.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="nombre-negocio">Nombre del negocio/proyecto</Label>
              <Input
                id="nombre-negocio"
                placeholder="Ej: Mi Tienda, Estudio Creativo..."
                value={nombreNegocio}
                onChange={(e) => setNombreNegocio(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc-negocio">¿Qué vendés o qué servicio das?</Label>
              <textarea
                id="desc-negocio"
                value={descripcionNegocio}
                onChange={(e) => setDescripcionNegocio(e.target.value)}
                placeholder="Ej: Vendo ropa por Instagram y hago envíos a todo el país. También tengo un puesto en la feria del Parque Rodó..."
                className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm min-h-[100px] resize-none outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              />
            </div>

            <div className="space-y-2">
              <Label>¿En qué plataformas vendés?</Label>
              <MultiChips options={PLATAFORMA_OPTIONS} selected={plataformas} onChange={setPlataformas} />
            </div>

            <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3">
              <p className="text-xs text-muted-foreground">
                <Sparkles className="size-3 inline mr-1 text-emerald-500" />
                Cuantos más detalles nos des sobre tu negocio, mejores categorías te armamos. Pensá en tus gastos e ingresos principales.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ======================== CATEGORÍAS ======================== */}
      {currentStepId === "categories" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Tus categorías</CardTitle>
            <CardDescription>
              {categoryMode === "ai"
                ? "Revisá las categorías que te armamos. Podés activar o desactivar las que quieras."
                : "Las categorías más comunes. Activá o desactivá las que necesites."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Loading AI */}
            {aiLoading && (
              <div className="flex flex-col items-center justify-center py-10 gap-5">
                <div className="size-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Sparkles className="size-7 text-emerald-500 animate-pulse" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium">Generando tus categorías personalizadas...</p>
                  <p className="text-xs text-muted-foreground">
                    {aiProgress < 30
                      ? "Analizando tu perfil..."
                      : aiProgress < 60
                        ? "Armando categorías a medida..."
                        : aiProgress < 90
                          ? "Organizando subcategorías..."
                          : "¡Casi listo!"}
                  </p>
                </div>
                <div className="w-full max-w-xs">
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-300 ease-out"
                      style={{ width: `${aiProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">{Math.round(aiProgress)}%</p>
                </div>
                <p className="text-[11px] text-muted-foreground/60 text-center max-w-xs">
                  Esto puede demorar hasta un minuto dependiendo de la complejidad de tu solicitud.
                </p>
              </div>
            )}

            {/* Categorías (cuando no está loading) */}
            {!aiLoading && (
              <>
                {categoryMode === "ai" && aiGenerated && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-emerald-500 font-medium">
                      <Sparkles className="size-3 inline mr-1" />
                      Categorías generadas por IA
                    </p>
                    {aiAttempts < 2 && (
                      <button
                        type="button"
                        onClick={generateAiCategories}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <RefreshCw className="size-3" />
                        Regenerar ({2 - aiAttempts} restante{2 - aiAttempts !== 1 ? "s" : ""})
                      </button>
                    )}
                    {aiAttempts >= 2 && (
                      <p className="text-xs text-muted-foreground">Sin regeneraciones restantes</p>
                    )}
                  </div>
                )}

                <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
                  {categories.map((cat, index) => {
                    const isSelected = selectedCategories.has(index)
                    const isExpanded = expandedCategories.has(index)
                    const hasSubs = cat.subcategories.length > 0

                    return (
                      <div
                        key={`${cat.name}-${index}`}
                        className={`rounded-lg border transition-colors ${
                          isSelected
                            ? "border-emerald-500/30 bg-emerald-500/5"
                            : "border-muted opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-3 p-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleCategory(index)}
                          />
                          <div
                            className="size-3 shrink-0 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="flex-1 font-medium text-sm">{cat.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {cat.type === "income" ? "Ingreso" : "Gasto"}
                          </span>
                          {hasSubs && (
                            <button
                              type="button"
                              onClick={() => toggleExpanded(index)}
                              className="rounded p-1 text-muted-foreground hover:bg-muted"
                            >
                              {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                            </button>
                          )}
                        </div>

                        {hasSubs && isExpanded && isSelected && (
                          <div className="border-t px-3 pb-3 pt-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-4">
                              {cat.subcategories.map((sub, subIdx) => {
                                const subKey = `${index}-${subIdx}`
                                const isSubSelected = !deselectedSubs.has(subKey)
                                return (
                                  <label
                                    key={sub.name}
                                    className="flex items-center gap-2 text-sm rounded-md px-2 py-1.5 cursor-pointer hover:bg-muted/50 transition-colors"
                                  >
                                    <Checkbox
                                      checked={isSubSelected}
                                      onCheckedChange={() => toggleSubcategory(index, subIdx)}
                                      className="size-3.5"
                                    />
                                    <div
                                      className="size-2 shrink-0 rounded-full"
                                      style={{ backgroundColor: sub.color }}
                                    />
                                    <span className={isSubSelected ? "" : "text-muted-foreground line-through"}>
                                      {sub.name}
                                    </span>
                                  </label>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="text-sm text-muted-foreground">
                  {selectedCategories.size} de {categories.length} categorías seleccionadas
                </div>
              </>
            )}

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ======================== CUENTAS ======================== */}
      {currentStepId === "accounts" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Tus cuentas</CardTitle>
            <CardDescription>
              Creá al menos una cuenta para empezar a registrar movimientos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accounts.map((acc, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-end"
                >
                  <div className="flex-1 space-y-1.5">
                    <Label htmlFor={`acc-name-${index}`}>Nombre</Label>
                    <Input
                      id={`acc-name-${index}`}
                      placeholder="Ej: Efectivo"
                      value={acc.name}
                      onChange={(e) => updateAccount(index, "name", e.target.value)}
                    />
                  </div>
                  <div className="w-full space-y-1.5 sm:w-36">
                    <Label htmlFor={`acc-type-${index}`}>Tipo</Label>
                    <select
                      id={`acc-type-${index}`}
                      value={acc.type}
                      onChange={(e) => updateAccount(index, "type", e.target.value)}
                      className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                    >
                      <option value="cash">Efectivo</option>
                      <option value="checking">Cuenta corriente</option>
                      <option value="savings">Ahorro</option>
                      <option value="business">Negocio</option>
                    </select>
                  </div>
                  <div className="w-full space-y-1.5 sm:w-28">
                    <Label htmlFor={`acc-currency-${index}`}>Moneda</Label>
                    <select
                      id={`acc-currency-${index}`}
                      value={acc.currency}
                      onChange={(e) => updateAccount(index, "currency", e.target.value)}
                      className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                    >
                      <option value="UYU">{CURRENCY_FLAGS.UYU} UYU</option>
                      <option value="USD">{CURRENCY_FLAGS.USD} USD</option>
                      <option value="BRL">{CURRENCY_FLAGS.BRL} BRL</option>
                      <option value="ARS">{CURRENCY_FLAGS.ARS} ARS</option>
                    </select>
                  </div>
                  {accounts.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAccount(index)}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" onClick={addAccount} className="w-full">
                <Plus className="size-4" />
                Agregar cuenta
              </Button>
            </div>
            {error && (
              <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ======================== LISTO ======================== */}
      {currentStepId === "done" && (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-500/10">
              <PartyPopper className="size-8 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl">¡Todo listo, {name}!</CardTitle>
            <CardDescription className="text-base">
              Tu cuenta está configurada. Ya podés empezar a registrar tus movimientos.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button size="lg" onClick={goToDashboard} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              Ir al dashboard
              <ChevronRight className="size-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ======================== NAVEGACIÓN ======================== */}
      {currentStepId !== "done" && !aiLoading && (
        <div className="mt-6 flex justify-between">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={step === 1}
            className={step === 1 ? "invisible" : ""}
          >
            <ChevronLeft className="size-4" />
            Atrás
          </Button>

          <div className="flex items-center gap-2">
            {/* Botón Omitir en paso negocio */}
            {currentStepId === "negocio" && (
              <Button
                variant="ghost"
                onClick={() => {
                  // Saltear negocio pero mandar data de vida cotidiana
                  setTieneNegocio(false)
                  // Avanzar al paso de categorías (se va a regenerar visibleSteps sin negocio)
                  // Como tieneNegocio pasa a false, visibleSteps se recalcula y el step actual cambia
                }}
                className="text-muted-foreground"
              >
                Omitir
              </Button>
            )}
            <Button
              onClick={nextStep}
              disabled={!canAdvance() || loading}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Guardando...
                </>
              ) : currentStepId === "accounts" ? (
                <>
                  Completar
                  <Check className="size-4" />
                </>
              ) : (
                <>
                  Siguiente
                  <ChevronRight className="size-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
