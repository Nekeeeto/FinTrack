"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
  { id: 1, label: "Nombre", icon: User },
  { id: 2, label: "Categorias", icon: Tags },
  { id: 3, label: "Cuentas", icon: Wallet },
  { id: 4, label: "Listo", icon: PartyPopper },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Step 1: Nombre
  const [name, setName] = useState("")

  // Step 2: Categorias seleccionadas (indices)
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(
    () => new Set(CATEGORY_TEMPLATES.map((_, i) => i))
  )
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())

  // Step 3: Cuentas
  const [accounts, setAccounts] = useState<OnboardingAccount[]>([
    { name: "Efectivo", type: "cash", currency: "UYU" },
  ])

  // Toggle categoria
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

  // Toggle expandir subcategorias
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

  // Agregar cuenta
  function addAccount() {
    setAccounts((prev) => [...prev, { name: "", type: "checking", currency: "UYU" }])
  }

  // Eliminar cuenta
  function removeAccount(index: number) {
    if (accounts.length <= 1) return
    setAccounts((prev) => prev.filter((_, i) => i !== index))
  }

  // Actualizar cuenta
  function updateAccount(index: number, field: keyof OnboardingAccount, value: string) {
    setAccounts((prev) =>
      prev.map((acc, i) => (i === index ? { ...acc, [field]: value } : acc))
    )
  }

  // Validar paso actual
  function canAdvance(): boolean {
    if (step === 1) return name.trim().length > 0
    if (step === 2) return selectedCategories.size > 0
    if (step === 3) return accounts.every((a) => a.name.trim().length > 0)
    return true
  }

  // Siguiente paso
  function nextStep() {
    if (step === 3) {
      submitOnboarding()
      return
    }
    setStep((s) => Math.min(s + 1, 4))
  }

  // Paso anterior
  function prevStep() {
    setStep((s) => Math.max(s - 1, 1))
  }

  // Enviar datos al servidor
  async function submitOnboarding() {
    setLoading(true)
    setError("")

    const categories: CategoryTemplate[] = CATEGORY_TEMPLATES.filter((_, i) =>
      selectedCategories.has(i)
    )

    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), categories, accounts }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error?.toString() || "Error al completar el onboarding")
        setLoading(false)
        return
      }

      setStep(4)
    } catch {
      setError("Error de conexion. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl">
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
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCompleted
                        ? "border-primary bg-primary/10 text-primary"
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
                      isCompleted ? "bg-primary" : "bg-muted-foreground/20"
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Contenido del paso con transicion */}
        <div className="transition-all duration-300">
          {/* PASO 1 — Nombre */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Como te llamas?</CardTitle>
                <CardDescription>
                  Asi te vamos a llamar en la app. Podes cambiarlo despues.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tu nombre</Label>
                    <Input
                      id="name"
                      placeholder="Ej: Juan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && canAdvance() && nextStep()}
                      autoFocus
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* PASO 2 — Categorias */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Tus categorias</CardTitle>
                <CardDescription>
                  Te armamos las categorias mas comunes. Desactiva las que no necesites.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
                  {CATEGORY_TEMPLATES.map((cat, index) => {
                    const isSelected = selectedCategories.has(index)
                    const isExpanded = expandedCategories.has(index)
                    const hasSubs = cat.subcategories.length > 0

                    return (
                      <div
                        key={cat.name}
                        className={`rounded-lg border transition-colors ${
                          isSelected
                            ? "border-primary/30 bg-primary/5"
                            : "border-muted opacity-60"
                        }`}
                      >
                        {/* Categoria padre */}
                        <div className="flex items-center gap-3 p-3">
                          {/* Checkbox custom */}
                          <button
                            type="button"
                            onClick={() => toggleCategory(index)}
                            className={`flex size-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground/40"
                            }`}
                          >
                            {isSelected && <Check className="size-3" />}
                          </button>

                          {/* Color indicator + nombre */}
                          <div
                            className="size-3 shrink-0 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="flex-1 font-medium">{cat.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {cat.type === "income" ? "Ingreso" : "Gasto"}
                          </span>

                          {/* Expandir subcategorias */}
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

                        {/* Subcategorias */}
                        {hasSubs && isExpanded && (
                          <div className="border-t px-3 pb-3 pt-2">
                            <div className="grid grid-cols-2 gap-1.5 pl-8">
                              {cat.subcategories.map((sub) => (
                                <div
                                  key={sub.name}
                                  className="flex items-center gap-2 text-sm text-muted-foreground"
                                >
                                  <div
                                    className="size-2 shrink-0 rounded-full"
                                    style={{ backgroundColor: sub.color }}
                                  />
                                  {sub.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  {selectedCategories.size} de {CATEGORY_TEMPLATES.length} categorias seleccionadas
                </div>
              </CardContent>
            </Card>
          )}

          {/* PASO 3 — Cuentas */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Tus cuentas</CardTitle>
                <CardDescription>
                  Crea al menos una cuenta para empezar a registrar movimientos.
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
                          className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                        >
                          <option value="cash">Efectivo</option>
                          <option value="checking">Cuenta corriente</option>
                          <option value="savings">Ahorro</option>
                          <option value="business">Negocio</option>
                        </select>
                      </div>

                      {/* Moneda */}
                      <div className="w-full space-y-1.5 sm:w-24">
                        <Label htmlFor={`acc-currency-${index}`}>Moneda</Label>
                        <select
                          id={`acc-currency-${index}`}
                          value={acc.currency}
                          onChange={(e) => updateAccount(index, "currency", e.target.value)}
                          className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                        >
                          <option value="UYU">UYU</option>
                          <option value="USD">USD</option>
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

          {/* PASO 4 — Listo */}
          {step === 4 && (
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
                  <PartyPopper className="size-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Todo listo!</CardTitle>
                <CardDescription>
                  Tu cuenta esta configurada. Ya podes empezar a registrar tus movimientos.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button size="lg" onClick={() => router.push("/inicio")}>
                  Ir al dashboard
                  <ChevronRight className="size-4" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Botones de navegacion */}
        {step < 4 && (
          <div className="mt-6 flex justify-between">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={step === 1}
              className={step === 1 ? "invisible" : ""}
            >
              <ChevronLeft className="size-4" />
              Atras
            </Button>
            <Button onClick={nextStep} disabled={!canAdvance() || loading}>
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
    </div>
  )
}
