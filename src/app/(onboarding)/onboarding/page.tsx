"use client"

import { useMemo, useRef, useState } from "react"
import Image from "next/image"
import {
  ArrowLeft,
  Check,
  CheckCheck,
  ChevronRight,
  Loader2,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  CATEGORY_TEMPLATES,
  ONBOARDING_OBJECTIVES,
  type CategoryTemplate,
} from "@/lib/category-templates"

type StepId = "welcome" | "objectives" | "categories" | "loading" | "done"
type CategoryType = "expense" | "income"

const STEP_ORDER: StepId[] = ["welcome", "objectives", "categories", "loading", "done"]
const LOADER_PHRASES = [
  "Ordenando tus categorias",
  "Ajustando tu espacio financiero",
  "Preparando tu panel inicial",
  "Dejando todo listo para empezar",
]

function buildAllSubKeys(items: CategoryTemplate[]): Set<string> {
  const keys = new Set<string>()
  items.forEach((category, categoryIndex) => {
    category.subcategories.forEach((_, subIndex) => {
      keys.add(`${categoryIndex}-${subIndex}`)
    })
  })
  return keys
}

export default function OnboardingPage() {
  const [step, setStep] = useState<StepId>("welcome")
  const [error, setError] = useState("")
  const [activeType, setActiveType] = useState<CategoryType>("expense")
  const [categories, setCategories] = useState<CategoryTemplate[]>(CATEGORY_TEMPLATES)
  const [selectedObjectives, setSelectedObjectives] = useState<Set<string>>(new Set())
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(
    () => new Set(CATEGORY_TEMPLATES.map((_, index) => index))
  )
  const [selectedSubcategories, setSelectedSubcategories] = useState<Set<string>>(
    () => buildAllSubKeys(CATEGORY_TEMPLATES)
  )
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())
  const [aiLoading, setAiLoading] = useState(false)
  const [aiAttempts, setAiAttempts] = useState(0)
  const [aiUsed, setAiUsed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loaderProgress, setLoaderProgress] = useState(6)
  const [loaderPhraseIndex, setLoaderPhraseIndex] = useState(0)

  const flowStartedAtRef = useRef<number>(Date.now())
  const stepStartedAtRef = useRef<number>(Date.now())
  const stepDurationsMsRef = useRef<Record<string, number>>({})

  const currentStepIndex = STEP_ORDER.indexOf(step)
  const progressVisibleSteps = STEP_ORDER.slice(0, 4)
  const progressCurrent = Math.min(currentStepIndex, progressVisibleSteps.length - 1)

  const categoryIndexesByType = useMemo(() => {
    return categories
      .map((category, index) => ({ category, index }))
      .filter(({ category }) => category.type === activeType)
      .map(({ index }) => index)
  }, [activeType, categories])

  const activeCategoryCount = categoryIndexesByType.length
  const activeSelectedCount = categoryIndexesByType.filter((index) => selectedCategories.has(index)).length

  const selectedCountByType = useMemo(() => {
    const result = { income: 0, expense: 0 }
    categories.forEach((category, index) => {
      if (selectedCategories.has(index)) {
        result[category.type] += 1
      }
    })
    return result
  }, [categories, selectedCategories])

  function moveToStep(nextStep: StepId) {
    const now = Date.now()
    const elapsed = now - stepStartedAtRef.current
    stepDurationsMsRef.current[step] = (stepDurationsMsRef.current[step] ?? 0) + elapsed
    stepStartedAtRef.current = now
    setStep(nextStep)
  }

  function toggleObjective(objectiveId: string) {
    setSelectedObjectives((prev) => {
      const next = new Set(prev)
      if (next.has(objectiveId)) next.delete(objectiveId)
      else next.add(objectiveId)
      return next
    })
  }

  function toggleCategory(categoryIndex: number) {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryIndex)) {
        next.delete(categoryIndex)
        setSelectedSubcategories((subPrev) => {
          const subNext = new Set(subPrev)
          categories[categoryIndex].subcategories.forEach((_, subIndex) => {
            subNext.delete(`${categoryIndex}-${subIndex}`)
          })
          return subNext
        })
      } else {
        next.add(categoryIndex)
        setSelectedSubcategories((subPrev) => {
          const subNext = new Set(subPrev)
          categories[categoryIndex].subcategories.forEach((_, subIndex) => {
            subNext.add(`${categoryIndex}-${subIndex}`)
          })
          return subNext
        })
      }
      return next
    })
  }

  function toggleSubcategory(categoryIndex: number, subIndex: number) {
    const key = `${categoryIndex}-${subIndex}`
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      next.add(categoryIndex)
      return next
    })
    setSelectedSubcategories((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function toggleExpanded(categoryIndex: number) {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryIndex)) next.delete(categoryIndex)
      else next.add(categoryIndex)
      return next
    })
  }

  function toggleAllForCurrentType() {
    const allSelected = categoryIndexesByType.every((index) => selectedCategories.has(index))
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      categoryIndexesByType.forEach((index) => {
        if (allSelected) next.delete(index)
        else next.add(index)
      })
      return next
    })
    setSelectedSubcategories((prev) => {
      const next = new Set(prev)
      categoryIndexesByType.forEach((categoryIndex) => {
        categories[categoryIndex].subcategories.forEach((_, subIndex) => {
          const key = `${categoryIndex}-${subIndex}`
          if (allSelected) next.delete(key)
          else next.add(key)
        })
      })
      return next
    })
  }

  function resetSelectionsFromCatalog(nextCategories: CategoryTemplate[]) {
    setCategories(nextCategories)
    setSelectedCategories(new Set(nextCategories.map((_, index) => index)))
    setSelectedSubcategories(buildAllSubKeys(nextCategories))
    setExpandedCategories(new Set())
  }

  function getFinalCategories(): CategoryTemplate[] {
    return categories.flatMap((category, categoryIndex) => {
      if (!selectedCategories.has(categoryIndex)) return []
      return [
        {
          ...category,
          subcategories: category.subcategories.filter((_, subIndex) =>
            selectedSubcategories.has(`${categoryIndex}-${subIndex}`)
          ),
        },
      ]
    })
  }

  function canContinue(): boolean {
    if (step === "welcome") return true
    if (step === "objectives") return selectedObjectives.size > 0
    if (step === "categories") {
      return selectedCountByType.expense > 0 && selectedCountByType.income > 0
    }
    return false
  }

  async function suggestCategoriesWithAi() {
    if (aiLoading || aiAttempts >= 2) return

    setAiLoading(true)
    setAiAttempts((prev) => Math.min(prev + 1, 2))
    setError("")
    try {
      const selectedObjectiveLabels = ONBOARDING_OBJECTIVES
        .filter((objective) => selectedObjectives.has(objective.id))
        .map((objective) => objective.label)

      const response = await fetch("/api/onboarding/suggest-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vida_cotidiana: {
            vivienda: null,
            delivery: null,
            cocina: null,
            trabajo: "",
            transporte: [],
            hijos: null,
            mascotas: null,
            detalles_extra: `Objetivos seleccionados: ${selectedObjectiveLabels.join(", ")}`,
          },
          crecimiento: null,
          attempt: Math.min(aiAttempts + 1, 2),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "No pudimos sugerir categorias ahora.")
        return
      }

      const aiCategories: CategoryTemplate[] = await response.json()
      resetSelectionsFromCatalog(aiCategories)
      setAiUsed(true)
    } catch {
      setError("No pudimos conectar con la sugerencia IA.")
    } finally {
      setAiLoading(false)
    }
  }

  async function completeOnboarding() {
    if (saving) return

    setSaving(true)
    setError("")
    setLoaderProgress(8)
    setLoaderPhraseIndex(0)
    moveToStep("loading")

    const progressInterval = setInterval(() => {
      setLoaderProgress((prev) => (prev >= 92 ? prev : prev + 3))
    }, 220)
    const phraseInterval = setInterval(() => {
      setLoaderPhraseIndex((prev) => (prev + 1) % LOADER_PHRASES.length)
    }, 1400)

    const finalCategories = getFinalCategories()
    const stepDurationsSnapshot = {
      ...stepDurationsMsRef.current,
      categories: (stepDurationsMsRef.current.categories ?? 0) + (Date.now() - stepStartedAtRef.current),
    }

    try {
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectives: Array.from(selectedObjectives),
          categories: finalCategories,
          metadata: {
            flow_version: "onboarding_v2_mobile",
            total_duration_ms: Date.now() - flowStartedAtRef.current,
            steps_timing_ms: stepDurationsSnapshot,
            ai_used: aiUsed,
            ai_attempts: aiAttempts,
          },
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "No se pudo completar el onboarding.")
        clearInterval(progressInterval)
        clearInterval(phraseInterval)
        setSaving(false)
        moveToStep("categories")
        return
      }

      setLoaderProgress(100)
      clearInterval(progressInterval)
      clearInterval(phraseInterval)
      await new Promise((resolve) => setTimeout(resolve, 550))
      moveToStep("done")
    } catch {
      clearInterval(progressInterval)
      clearInterval(phraseInterval)
      setError("Error de conexion. Intentalo nuevamente.")
      setSaving(false)
      moveToStep("categories")
      return
    }

    setSaving(false)
  }

  function handleNext() {
    if (step === "welcome") moveToStep("objectives")
    else if (step === "objectives") moveToStep("categories")
    else if (step === "categories") completeOnboarding()
  }

  function handleBack() {
    if (step === "objectives") moveToStep("welcome")
    if (step === "categories") moveToStep("objectives")
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] pt-5 md:max-w-lg">
        {step !== "welcome" && step !== "done" && (
          <div className="mb-7 flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="flex size-10 items-center justify-center rounded-full bg-white/10"
            >
              <ArrowLeft className="size-5" />
            </button>
            <div className="grid flex-1 grid-cols-4 gap-2">
              {progressVisibleSteps.map((progressStep, progressIndex) => (
                <div key={progressStep} className="h-1.5 rounded-full bg-white/20">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      progressIndex <= progressCurrent ? "bg-emerald-400" : "bg-transparent"
                    )}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {step === "welcome" && (
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[2rem] bg-[#020617]">
            <div className="relative h-[min(36vh,300px)] w-full shrink-0 sm:h-[min(38vh,320px)]">
              <Image
                src="/onboarding-welcome-hero.png"
                alt="Ilustración: persona revisando el teléfono con una sonrisa"
                fill
                priority
                className="object-cover object-[center_15%]"
                sizes="(max-width: 768px) 100vw, 512px"
              />
            </div>

            <div className="flex flex-1 flex-col justify-end px-5 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pt-4">
              <p className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">
                Toma el control de tus finanzas
              </p>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-400">
                En pocos pasos dejas tu cuenta pronta para registrar gastos e ingresos.
              </p>

              <Button
                type="button"
                onClick={handleNext}
                className="mt-5 h-11 shrink-0 rounded-full bg-emerald-400 px-6 text-sm font-semibold text-black hover:bg-emerald-300"
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {step === "objectives" && (
          <div className="flex flex-1 flex-col">
            <header className="mb-5">
              <h1 className="text-5xl font-black leading-[0.95] tracking-tight">¿Cuales son tus objetivos?</h1>
              <p className="mt-4 text-lg text-zinc-400">Selecciona uno o mas objetivos que quieras alcanzar</p>
            </header>

            <div className="space-y-3">
              {ONBOARDING_OBJECTIVES.map((objective) => {
                const selected = selectedObjectives.has(objective.id)
                return (
                  <button
                    key={objective.id}
                    type="button"
                    onClick={() => toggleObjective(objective.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition-all",
                      selected
                        ? "border-lime-400/70 bg-zinc-900"
                        : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                    )}
                  >
                    <div>
                      <p className="text-xl font-semibold">{objective.label}</p>
                      <p className="mt-1 text-sm text-zinc-400">{objective.description}</p>
                    </div>
                    <span
                      className={cn(
                        "ml-4 flex size-8 items-center justify-center rounded-lg border",
                        selected ? "border-lime-400 bg-lime-400 text-black" : "border-zinc-700 bg-zinc-800"
                      )}
                    >
                      {selected && <Check className="size-5" />}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === "categories" && (
          <div className="flex h-full flex-1 flex-col">
            <header className="mb-4">
              <h1 className="text-5xl font-black leading-[0.95] tracking-tight">Elige tus categorias</h1>
              <p className="mt-4 text-lg text-zinc-400">
                Selecciona categorias base de gastos e ingresos. Luego podras editarlas.
              </p>
            </header>

            <div className="mb-3 flex rounded-full bg-zinc-900 p-1">
              <button
                type="button"
                onClick={() => setActiveType("expense")}
                className={cn(
                  "flex-1 rounded-full px-4 py-2 text-base font-semibold transition-colors",
                  activeType === "expense" ? "bg-red-500 text-white" : "text-zinc-400"
                )}
              >
                Gastos
              </button>
              <button
                type="button"
                onClick={() => setActiveType("income")}
                className={cn(
                  "flex-1 rounded-full px-4 py-2 text-base font-semibold transition-colors",
                  activeType === "income" ? "bg-lime-400 text-black" : "text-zinc-400"
                )}
              >
                Ingresos
              </button>
            </div>

            <div className="mb-3 flex items-center justify-between">
              <button type="button" onClick={toggleAllForCurrentType} className="text-base underline">
                {activeSelectedCount === activeCategoryCount ? "Deseleccionar todo" : "Seleccionar todo"}
              </button>
              <span className="text-xl text-zinc-300">
                {activeSelectedCount} de {activeCategoryCount}
              </span>
            </div>

            <div className="mb-3">
              <Button
                type="button"
                variant="outline"
                onClick={suggestCategoriesWithAi}
                disabled={aiLoading || aiAttempts >= 2}
                className="w-full rounded-xl border-zinc-700 bg-zinc-900/70 text-white hover:bg-zinc-800"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sugiriendo con IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    Sugerir categorias con IA (opcional)
                  </>
                )}
              </Button>
              {aiAttempts > 0 && (
                <p className="mt-2 text-xs text-zinc-400">Intentos IA usados: {aiAttempts}/2</p>
              )}
            </div>

            <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
              {categories.map((category, categoryIndex) => {
                if (category.type !== activeType) return null
                const selected = selectedCategories.has(categoryIndex)
                const expanded = expandedCategories.has(categoryIndex)
                const checkedSubs = category.subcategories.filter((_, subIndex) =>
                  selectedSubcategories.has(`${categoryIndex}-${subIndex}`)
                ).length

                return (
                  <article
                    key={`${category.name}-${categoryIndex}`}
                    className={cn(
                      "rounded-3xl border p-4 transition-colors",
                      selected ? "border-zinc-700 bg-zinc-900" : "border-zinc-800 bg-zinc-950"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex size-11 items-center justify-center rounded-xl text-sm font-bold text-black"
                        style={{ backgroundColor: `${category.color}44`, color: category.color }}
                      >
                        {category.name.slice(0, 1)}
                      </div>
                      <div className="flex-1">
                        <p className="text-3xl font-bold leading-none">{category.name}</p>
                        <p className="mt-1 text-sm text-zinc-400">
                          {checkedSubs} de {category.subcategories.length} subcategorias
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleCategory(categoryIndex)}
                        className={cn(
                          "flex size-10 items-center justify-center rounded-full border",
                          selected
                            ? "border-lime-400 bg-lime-400 text-black"
                            : "border-zinc-700 bg-zinc-800 text-zinc-500"
                        )}
                      >
                        {selected && <Check className="size-5" />}
                      </button>
                    </div>

                    {selected && (
                      <>
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => toggleExpanded(categoryIndex)}
                            className="text-sm font-medium text-zinc-300 underline"
                          >
                            {expanded ? "Ocultar subcategorias" : "Editar subcategorias"}
                          </button>
                        </div>
                        {expanded && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {category.subcategories.map((sub, subIndex) => {
                              const subSelected = selectedSubcategories.has(`${categoryIndex}-${subIndex}`)
                              return (
                                <button
                                  key={`${categoryIndex}-${sub.name}`}
                                  type="button"
                                  onClick={() => toggleSubcategory(categoryIndex, subIndex)}
                                  className={cn(
                                    "rounded-full border px-3 py-1.5 text-sm transition-all",
                                    subSelected
                                      ? "border-lime-300/50 bg-lime-300/15 text-lime-200"
                                      : "border-zinc-700 bg-zinc-900 text-zinc-400"
                                  )}
                                >
                                  {sub.name}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </article>
                )
              })}
            </div>
          </div>
        )}

        {step === "loading" && (
          <div className="flex flex-1 flex-col justify-end pb-3">
            <div className="mb-12">
              <p className="text-2xl font-bold text-zinc-500">Un momento</p>
              <h2 className="mt-1 text-6xl font-black leading-[0.95]">
                {LOADER_PHRASES[loaderPhraseIndex]}
              </h2>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-lime-400 transition-[width] duration-300"
                style={{ width: `${loaderProgress}%` }}
              />
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-lime-400 text-black">
              <CheckCheck className="size-8" />
            </div>
            <h2 className="text-5xl font-black leading-tight">Onboarding completado</h2>
            <p className="mt-4 max-w-sm text-lg text-zinc-400">
              Ya tenes tu base configurada. Empeza a registrar movimientos desde el inicio.
            </p>
            <Button
              type="button"
              onClick={() => {
                window.location.href = "/inicio"
              }}
              className="mt-10 h-14 w-full rounded-full bg-lime-400 text-black hover:bg-lime-300"
            >
              Ir al inicio
              <ChevronRight className="size-5" />
            </Button>
          </div>
        )}

        {step !== "welcome" && step !== "loading" && step !== "done" && (
          <div className="mt-5 space-y-3">
            {error && <p className="rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-300">{error}</p>}
            <Button
              type="button"
              onClick={handleNext}
              disabled={!canContinue() || saving}
              className="h-14 w-full rounded-full bg-lime-400 text-lg font-semibold text-black hover:bg-lime-300 disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              {saving ? "Guardando..." : "Continuar"}
              {!saving && <ChevronRight className="size-5" />}
            </Button>
          </div>
        )}
      </section>
    </main>
  )
}
