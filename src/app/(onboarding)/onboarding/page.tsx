"use client"

import { useState } from "react"
import {
  User,
  Tags,
  Wallet,
  PartyPopper,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Check,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  LayoutList,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CATEGORY_TEMPLATES, type CategoryTemplate } from "@/lib/category-templates"

// Tipos para las cuentas del wizard
interface OnboardingAccount {
  name: string
  type: string
  currency: string
}

// Pasos del wizard
const STEPS = [
  { id: 1, label: "Bienvenida", icon: User },
  { id: 2, label: "Categorías", icon: Tags },
  { id: 3, label: "Cuentas", icon: Wallet },
  { id: 4, label: "Listo", icon: PartyPopper },
]

const CURRENCY_FLAGS: Record<string, string> = {
  UYU: "🇺🇾",
  USD: "🇺🇸",
  BRL: "🇧🇷",
  ARS: "🇦🇷",
}

type CategoryMode = "default" | "ai" | null

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Step 1: Nombre
  const [name, setName] = useState("")

  // Step 2: Categorías
  const [categoryMode, setCategoryMode] = useState<CategoryMode>(null)
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [categories, setCategories] = useState<CategoryTemplate[]>(CATEGORY_TEMPLATES)
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(
    () => new Set(CATEGORY_TEMPLATES.map((_, i) => i))
  )
  // Subcategorías deseleccionadas: key = "catIdx-subIdx"
  const [deselectedSubs, setDeselectedSubs] = useState<Set<string>>(new Set())
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())

  // Step 3: Cuentas
  const [accounts, setAccounts] = useState<OnboardingAccount[]>([
    { name: "Efectivo", type: "cash", currency: "UYU" },
  ])

  // --- Categorías ---
  function selectMode(mode: CategoryMode) {
    setCategoryMode(mode)
    if (mode === "default") {
      setCategories(CATEGORY_TEMPLATES)
      setSelectedCategories(new Set(CATEGORY_TEMPLATES.map((_, i) => i)))
      setDeselectedSubs(new Set())
    }
  }

  async function generateAiCategories() {
    if (!aiPrompt.trim()) return
    setAiLoading(true)
    setError("")
    try {
      const res = await fetch("/api/onboarding/suggest-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: aiPrompt.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Error generando categorías")
        setAiLoading(false)
        return
      }
      const aiCats: CategoryTemplate[] = await res.json()
      setCategories(aiCats)
      setSelectedCategories(new Set(aiCats.map((_, i) => i)))
      setDeselectedSubs(new Set())
      setExpandedCategories(new Set())
    } catch {
      setError("Error de conexión. Intentá de nuevo.")
    } finally {
      setAiLoading(false)
    }
  }

  function toggleCategory(index: number) {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  function toggleSubcategory(catIdx: number, subIdx: number) {
    const key = `${catIdx}-${subIdx}`
    setDeselectedSubs((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  function toggleExpanded(index: number) {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  // --- Cuentas ---
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

  // --- Navegación ---
  function canAdvance(): boolean {
    if (step === 1) return name.trim().length > 0
    if (step === 2) return categoryMode !== null && selectedCategories.size > 0
    if (step === 3) return accounts.every((a) => a.name.trim().length > 0)
    return true
  }

  function nextStep() {
    if (step === 3) {
      submitOnboarding()
      return
    }
    setStep((s) => Math.min(s + 1, 4))
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 1))
  }

  // --- Submit ---
  async function submitOnboarding() {
    setLoading(true)
    setError("")

    // Filtrar categorías seleccionadas y sus subcategorías
    const finalCategories: CategoryTemplate[] = categories
      .filter((_, i) => selectedCategories.has(i))
      .map((cat, catIdx) => {
        // Encontrar el índice original en el array completo
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

      setStep(4)
    } catch {
      setError("Error de conexión. Intentá de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  function goToDashboard() {
    // Forzar recarga completa para que el middleware no bloquee
    window.location.href = "/inicio"
  }

  return (
    <div className="w-full max-w-2xl px-4 py-8">
      {/* Indicador de pasos */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {STEPS.map((s) => {
          const StepIcon = s.icon
          const isActive = step === s.id
          const isCompleted = step > s.id
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
                {isCompleted ? (
                  <Check className="size-5" />
                ) : (
                  <StepIcon className="size-5" />
                )}
              </div>
              {s.id < STEPS.length && (
                <div
                  className={`hidden h-0.5 w-8 sm:block ${
                    isCompleted ? "bg-emerald-500" : "bg-muted-foreground/20"
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Contenido del paso */}
      <div className="transition-all duration-300">
        {/* ======================== PASO 1 — Bienvenida ======================== */}
        {step === 1 && (
          <Card>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-emerald-500/10">
                <span className="text-3xl font-bold text-emerald-500">$</span>
              </div>
              <CardTitle className="text-2xl">¡Bienvenido a Biyuya!</CardTitle>
              <CardDescription className="text-base mt-2">
                Vamos a personalizar tu experiencia en menos de 2 minutos.<br />
                Configuraremos tus categorías y cuentas para que puedas arrancar a registrar movimientos de una.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mt-2">
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
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3 text-center">
                    <Tags className="size-5 mx-auto mb-1.5 text-emerald-500" />
                    <p className="text-xs text-muted-foreground">Categorías a medida</p>
                  </div>
                  <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3 text-center">
                    <Wallet className="size-5 mx-auto mb-1.5 text-emerald-500" />
                    <p className="text-xs text-muted-foreground">Tus cuentas</p>
                  </div>
                  <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3 text-center">
                    <Sparkles className="size-5 mx-auto mb-1.5 text-emerald-500" />
                    <p className="text-xs text-muted-foreground">IA personalizada</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ======================== PASO 2 — Categorías ======================== */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Tus categorías</CardTitle>
              <CardDescription>
                Elegí cómo querés armar tus categorías de ingresos y gastos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selector de modo */}
              {categoryMode === null && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => selectMode("default")}
                    className="flex flex-col items-center gap-3 rounded-xl border-2 border-muted p-6 text-center hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
                  >
                    <LayoutList className="size-8 text-emerald-500" />
                    <div>
                      <p className="font-semibold">Categorías por defecto</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Las más comunes ya armadas. Podés activar y desactivar las que quieras.
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => selectMode("ai")}
                    className="flex flex-col items-center gap-3 rounded-xl border-2 border-muted p-6 text-center hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
                  >
                    <Sparkles className="size-8 text-emerald-500" />
                    <div>
                      <p className="font-semibold">Generadas con IA</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Contanos a qué te dedicás y te armamos categorías a medida.
                      </p>
                    </div>
                  </button>
                </div>
              )}

              {/* Modo AI: input */}
              {categoryMode === "ai" && !aiLoading && categories === CATEGORY_TEMPLATES && (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setCategoryMode(null)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Volver a elegir modo
                  </button>
                  <div className="space-y-2">
                    <Label htmlFor="ai-prompt">Contanos sobre vos o tu negocio</Label>
                    <textarea
                      id="ai-prompt"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Ej: Soy freelancer de diseño, tengo un emprendimiento de venta de ropa online y hago delivery en bici los fines de semana..."
                      className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm min-h-[100px] resize-none outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                    />
                  </div>
                  <Button onClick={generateAiCategories} disabled={!aiPrompt.trim()} className="w-full">
                    <Sparkles className="size-4 mr-1" />
                    Generar categorías con IA
                  </Button>
                </div>
              )}

              {/* Loading AI */}
              {aiLoading && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="size-8 animate-spin text-emerald-500" />
                  <p className="text-sm text-muted-foreground">Generando tus categorías personalizadas...</p>
                </div>
              )}

              {/* Lista de categorías (default o AI ya generadas) */}
              {categoryMode !== null && !aiLoading && (categoryMode === "default" || categories !== CATEGORY_TEMPLATES) && (
                <>
                  {categoryMode === "ai" && (
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-emerald-500 font-medium">✨ Categorías generadas por IA</p>
                      <button
                        type="button"
                        onClick={() => {
                          setCategories(CATEGORY_TEMPLATES)
                          setCategoryMode(null)
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Cambiar modo
                      </button>
                    </div>
                  )}
                  {categoryMode === "default" && (
                    <button
                      type="button"
                      onClick={() => setCategoryMode(null)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      ← Volver a elegir modo
                    </button>
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
                          {/* Categoría padre */}
                          <div className="flex items-center gap-3 p-3">
                            <button
                              type="button"
                              onClick={() => toggleCategory(index)}
                              className={`flex size-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                                isSelected
                                  ? "border-emerald-500 bg-emerald-500 text-white"
                                  : "border-muted-foreground/40"
                              }`}
                            >
                              {isSelected && <Check className="size-3" />}
                            </button>

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
                                {isExpanded ? (
                                  <ChevronUp className="size-4" />
                                ) : (
                                  <ChevronDown className="size-4" />
                                )}
                              </button>
                            )}
                          </div>

                          {/* Subcategorías seleccionables */}
                          {hasSubs && isExpanded && isSelected && (
                            <div className="border-t px-3 pb-3 pt-2">
                              <div className="grid grid-cols-2 gap-1.5 pl-8">
                                {cat.subcategories.map((sub, subIdx) => {
                                  const subKey = `${index}-${subIdx}`
                                  const isSubSelected = !deselectedSubs.has(subKey)
                                  return (
                                    <button
                                      key={sub.name}
                                      type="button"
                                      onClick={() => toggleSubcategory(index, subIdx)}
                                      className={`flex items-center gap-2 text-sm rounded-md px-2 py-1 text-left transition-colors ${
                                        isSubSelected
                                          ? "text-foreground"
                                          : "text-muted-foreground/40 line-through"
                                      }`}
                                    >
                                      <div
                                        className={`size-2 shrink-0 rounded-full transition-opacity ${isSubSelected ? "opacity-100" : "opacity-30"}`}
                                        style={{ backgroundColor: sub.color }}
                                      />
                                      {sub.name}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-3 text-sm text-muted-foreground">
                    {selectedCategories.size} de {categories.length} categorías seleccionadas
                  </div>
                </>
              )}

              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ======================== PASO 3 — Cuentas ======================== */}
        {step === 3 && (
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
                    {/* Nombre */}
                    <div className="flex-1 space-y-1.5">
                      <Label htmlFor={`acc-name-${index}`}>Nombre</Label>
                      <Input
                        id={`acc-name-${index}`}
                        placeholder="Ej: Efectivo"
                        value={acc.name}
                        onChange={(e) => updateAccount(index, "name", e.target.value)}
                      />
                    </div>

                    {/* Tipo */}
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

                    {/* Moneda con banderita */}
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

                    {/* Eliminar */}
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
                <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ======================== PASO 4 — Listo ======================== */}
        {step === 4 && (
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
      </div>

      {/* Botones de navegación */}
      {step < 4 && (
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
          <Button onClick={nextStep} disabled={!canAdvance() || loading} className="bg-emerald-500 hover:bg-emerald-600 text-white">
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Guardando...
              </>
            ) : step === 3 ? (
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
      )}
    </div>
  )
}
