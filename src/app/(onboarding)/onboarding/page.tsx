"use client"

import { useMemo, useRef, useState } from "react"
import Image from "next/image"
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Check,
  Compass,
  ChevronRight,
  HandCoins,
  Landmark,
  PiggyBank,
  SlidersHorizontal,
  Smartphone,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"
import {
  CATEGORY_TEMPLATES,
  ONBOARDING_OBJECTIVES,
  type CategoryTemplate,
} from "@/lib/category-templates"
import type { AccountType, Currency } from "@/types/database"

type StepId = "welcome" | "objectives" | "account" | "categories" | "loading"
type CategoryType = "expense" | "income"
type AccountScope = "nacional" | "internacional"
type AccountPreset = {
  name: string
  icon: string
  type: AccountType
  logoUrl?: string
}

const PROGRESS_STEPS: StepId[] = ["objectives", "account", "categories", "loading"]
const LOADER_WORDS = [
  "Ordenando",
  "Ajustando",
  "Conectando",
  "Finalizando",
]

const OBJECTIVE_ICONS: Record<string, LucideIcon> = {
  organizar_finanzas: Compass,
  pagar_deudas: HandCoins,
  ahorrar_dinero: PiggyBank,
  crear_presupuesto: SlidersHorizontal,
}
const OBJECTIVE_ACCENT_COLORS: Record<string, string> = {
  organizar_finanzas: "#5DBCD2",
  pagar_deudas: "#f97316",
  ahorrar_dinero: "#22c55e",
  crear_presupuesto: "#a78bfa",
}

const BANK_OPTIONS: AccountPreset[] = [
  { name: "BROU", icon: "wallet", type: "checking", logoUrl: "/banks/brou.png" },
  { name: "Santander UY", icon: "wallet", type: "checking", logoUrl: "/banks/santander.png" },
  { name: "Itaú UY", icon: "wallet", type: "checking", logoUrl: "/banks/itau.png" },
  { name: "BBVA UY", icon: "wallet", type: "checking", logoUrl: "/banks/bbva.png" },
  { name: "Scotiabank UY", icon: "wallet", type: "checking", logoUrl: "/banks/scotiabank.png" },
  { name: "Prex", icon: "wallet", type: "checking", logoUrl: "/banks/prex.png" },
  { name: "MiDinero", icon: "wallet", type: "checking", logoUrl: "/banks/midinero.png" },
  { name: "Personalizado", icon: "wallet", type: "checking" },
]

const WALLET_OPTIONS: AccountPreset[] = [
  { name: "Binance", icon: "trending-up", type: "investment", logoUrl: "https://logo.clearbit.com/binance.com" },
  { name: "Wise", icon: "briefcase", type: "investment", logoUrl: "https://logo.clearbit.com/wise.com" },
  { name: "PayPal", icon: "briefcase", type: "investment", logoUrl: "https://logo.clearbit.com/paypal.com" },
  { name: "Revolut", icon: "briefcase", type: "investment", logoUrl: "https://logo.clearbit.com/revolut.com" },
  { name: "Personalizado", icon: "wallet", type: "investment" },
]

const ACCOUNT_COLORS = ["#b2bcc9", "#ef4444", "#f97316", "#fb923c", "#facc15", "#a3e635", "#4ade80"]
const ACCOUNT_ICON_OPTIONS = ["wallet", "banknote", "briefcase", "home", "trending-up", "landmark"]

function PresetBrandAvatar({ preset }: { preset: AccountPreset }) {
  const [logoError, setLogoError] = useState(false)
  const PresetIcon = getIcon(preset.icon)

  if (preset.logoUrl && !logoError) {
    return (
      <Image
        src={preset.logoUrl}
        alt={`Logo ${preset.name}`}
        width={28}
        height={28}
        unoptimized
        onError={() => setLogoError(true)}
        className="h-full w-full rounded-full object-cover"
      />
    )
  }

  return <PresetIcon className="size-4" />
}

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
  const [accountScope, setAccountScope] = useState<AccountScope>("nacional")
  const [accountPresetName, setAccountPresetName] = useState("BROU")
  const [accountName, setAccountName] = useState("BROU")
  const [accountIcon, setAccountIcon] = useState("wallet")
  const [accountType, setAccountType] = useState<AccountType>("checking")
  const [accountColor, setAccountColor] = useState<string>("#a3e635")
  const [accountBalance, setAccountBalance] = useState("0")
  const [usdEnabled, setUsdEnabled] = useState(false)
  const [usdBalance, setUsdBalance] = useState("0")
  const [saving, setSaving] = useState(false)
  const [loaderProgress, setLoaderProgress] = useState(6)
  const [loaderPhraseIndex, setLoaderPhraseIndex] = useState(0)

  const flowStartedAtRef = useRef<number>(Date.now())
  const stepStartedAtRef = useRef<number>(Date.now())
  const stepDurationsMsRef = useRef<Record<string, number>>({})

  const progressVisibleSteps = PROGRESS_STEPS
  const progressCurrent = Math.max(0, progressVisibleSteps.indexOf(step as StepId))

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
  const presetOptions = accountScope === "nacional" ? BANK_OPTIONS : WALLET_OPTIONS
  const selectedPreset = presetOptions.find((preset) => preset.name === accountPresetName)
  const SelectedAccountIcon = getIcon(accountIcon)
  const accountCurrencySymbol = accountScope === "nacional" ? "$" : "US$"

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
    if (step === "account") return accountName.trim().length > 0
    if (step === "categories") {
      return selectedCountByType.expense > 0 && selectedCountByType.income > 0
    }
    return false
  }

  function selectAccountPreset(preset: AccountPreset) {
    setAccountPresetName(preset.name)
    setAccountName(preset.name === "Personalizado" ? "" : preset.name)
    setAccountIcon(preset.icon)
    setAccountType(preset.type)
  }

  function changeAccountScope(scope: AccountScope) {
    setAccountScope(scope)
    setUsdEnabled(false)
    const defaultPreset = (scope === "nacional" ? BANK_OPTIONS : WALLET_OPTIONS)[0]
    setAccountPresetName(defaultPreset.name)
    setAccountName(defaultPreset.name)
    setAccountIcon(defaultPreset.icon)
    setAccountType(defaultPreset.type)
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
      setLoaderPhraseIndex((prev) => (prev + 1) % LOADER_WORDS.length)
    }, 2400)

    const finalCategories = getFinalCategories()
    const stepDurationsSnapshot = {
      ...stepDurationsMsRef.current,
      categories: (stepDurationsMsRef.current.categories ?? 0) + (Date.now() - stepStartedAtRef.current),
    }

    try {
      const parsedLocalBalance = Number.parseFloat(accountBalance || "0")
      const parsedUsdBalance = Number.parseFloat(usdBalance || "0")
      const localBalance = Number.isFinite(parsedLocalBalance) && parsedLocalBalance >= 0 ? parsedLocalBalance : 0
      const dollarsBalance = Number.isFinite(parsedUsdBalance) && parsedUsdBalance >= 0 ? parsedUsdBalance : 0
      const baseCurrency: Currency = accountScope === "internacional" ? "USD" : "UYU"

      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectives: Array.from(selectedObjectives),
          account: {
            name: accountName.trim(),
            type: accountType,
            icon: accountIcon,
            color: accountColor,
            currency: baseCurrency,
            balance: localBalance,
            usd_enabled: accountScope === "nacional" ? usdEnabled : false,
            usd_balance: accountScope === "nacional" ? dollarsBalance : 0,
          },
          categories: finalCategories,
          metadata: {
            flow_version: "onboarding_v2_mobile",
            total_duration_ms: Date.now() - flowStartedAtRef.current,
            steps_timing_ms: stepDurationsSnapshot,
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
      await new Promise((resolve) => setTimeout(resolve, 350))
      window.location.href = "/inicio"
      return
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
    else if (step === "objectives") moveToStep("account")
    else if (step === "account") moveToStep("categories")
    else if (step === "categories") completeOnboarding()
  }

  function handleBack() {
    if (step === "objectives") moveToStep("welcome")
    if (step === "account") moveToStep("objectives")
    if (step === "categories") moveToStep("account")
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section
        className={cn(
          "flex min-h-screen w-full flex-col",
          step === "welcome"
            ? "relative min-h-svh overflow-hidden"
            : "mx-auto max-w-md px-5 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-4 md:max-w-lg"
        )}
      >
        {step !== "welcome" && step !== "loading" && (
          <div className="mb-5 flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5"
            >
              <ArrowLeft className="size-4.5" />
            </button>
            <div className="grid flex-1 grid-cols-4 gap-2">
              {progressVisibleSteps.map((progressStep, progressIndex) => (
                <div key={progressStep} className="h-1.5 rounded-full bg-white/12">
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
          <div className="relative isolate flex min-h-svh w-full flex-1 flex-col overflow-hidden bg-[#020617]">
            <div className="hero-animated-bg">
              <div className="hero-noise" />
              <svg
                className="hero-waves opacity-60"
                viewBox="0 0 1200 220"
                fill="none"
                aria-hidden="true"
              >
                <path
                  className="stroke-white/30"
                  d="M0 170 C 140 110, 260 210, 400 160 C 540 110, 660 210, 800 160 C 940 110, 1060 210, 1200 150"
                  strokeWidth="1.5"
                  stroke="currentColor"
                />
                <path
                  className="stroke-white/20"
                  d="M0 195 C 160 135, 300 235, 460 185 C 620 135, 760 235, 920 185 C 1080 135, 1160 215, 1200 175"
                  strokeWidth="1"
                  stroke="currentColor"
                />
                <path
                  className="stroke-white/15"
                  d="M0 140 C 120 80, 280 180, 420 130 C 560 80, 720 180, 860 130 C 1000 80, 1100 170, 1200 120"
                  strokeWidth="1"
                  stroke="currentColor"
                />
              </svg>
            </div>

            <div className="pointer-events-none absolute -left-20 top-14 z-10 h-64 w-64 rounded-full bg-[#5DBCD2]/28 blur-3xl animate-[hero-float_9s_ease-in-out_infinite]" />
            <div className="pointer-events-none absolute -right-20 top-24 z-10 h-72 w-72 rounded-full bg-[#5DBCD2]/22 blur-3xl animate-[hero-float_12s_ease-in-out_infinite]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[42svh] bg-linear-to-t from-[#020617] via-[#020617]/90 to-transparent" />

            <div className="relative z-30 flex h-[56svh] items-center justify-center overflow-hidden px-6">
              <div className="relative h-[70vw] w-[70vw] max-h-88 max-w-88">
                <div className="absolute inset-0 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm animate-[hero-orbit-spin_28s_linear_infinite]" />
                <div className="absolute inset-[9%] rounded-full border border-[#5DBCD2]/40 animate-[hero-orbit-spin-reverse_20s_linear_infinite]" />
                <div className="absolute inset-[21%] rounded-full border border-white/14 animate-[hero-orbit-spin_14s_linear_infinite]" />
                <div className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-[#5DBCD2] shadow-[0_0_24px_rgba(93,188,210,0.9)]" />
                <div className="absolute right-[11%] top-[58%] h-2.5 w-2.5 rounded-full bg-white/90 shadow-[0_0_18px_rgba(255,255,255,0.65)]" />
                <div className="absolute left-[14%] top-[64%] h-2 w-2 rounded-full bg-[#5DBCD2]/90 shadow-[0_0_18px_rgba(93,188,210,0.7)]" />
                <div className="absolute inset-[32%] rounded-full bg-linear-to-br from-[#5DBCD2]/35 via-[#5DBCD2]/10 to-transparent blur-[1px]" />
              </div>
              <div className="absolute left-8 top-[20%] h-14 w-14 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm animate-[hero-float_10s_ease-in-out_infinite]" />
              <div className="absolute right-10 top-[16%] h-10 w-10 rounded-xl border border-[#5DBCD2]/40 bg-[#5DBCD2]/8 animate-[hero-float_8s_ease-in-out_infinite]" />
              <div className="absolute bottom-[22%] left-[14%] h-3 w-16 rounded-full bg-white/20 blur-[1px]" />
              <div className="absolute bottom-[18%] right-[16%] h-3 w-20 rounded-full bg-[#5DBCD2]/25 blur-[1px]" />
            </div>

            <div className="relative z-30 mt-auto w-full px-6 pb-[max(2rem,env(safe-area-inset-bottom,0px))]">
              <div className="mx-auto w-full max-w-md">
                <p className="max-w-[12ch] text-[clamp(2.2rem,10vw,3.8rem)] font-black leading-[0.94] tracking-tight text-white">
                  Tomá el control de tus finanzas
                </p>
                <p className="mt-4 max-w-[31ch] text-base leading-relaxed text-zinc-300 sm:text-lg">
                  En pocos pasos dejás tu cuenta pronta para registrar gastos e ingresos.
                </p>

                <Button
                  type="button"
                  onClick={handleNext}
                  className="mt-8 h-14 w-full rounded-full bg-[#5DBCD2] px-8 text-lg font-bold tracking-tight text-black shadow-[0_14px_44px_rgba(93,188,210,0.36)] transition-all hover:bg-[#74cade] active:scale-[0.985]"
                >
                  Continuar
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === "objectives" && (
          <div className="flex flex-1 flex-col rounded-[1.75rem] border border-white/10 bg-[#020617]/75 px-4 py-4 shadow-[0_16px_46px_rgba(2,6,23,0.45)] backdrop-blur-sm">
            <header className="mb-4">
              <h1 className="text-3xl font-black leading-[0.98] tracking-tight sm:text-4xl">
                ¿Cuales son tus objetivos?
              </h1>
              <p className="mt-2 text-sm text-zinc-400 sm:text-base">
                Selecciona uno o mas objetivos que quieras alcanzar
              </p>
            </header>

            <div className="space-y-2.5">
              {ONBOARDING_OBJECTIVES.map((objective) => {
                const selected = selectedObjectives.has(objective.id)
                const ObjectiveIcon = OBJECTIVE_ICONS[objective.id] ?? Compass
                const accentColor = OBJECTIVE_ACCENT_COLORS[objective.id] ?? "#5DBCD2"
                return (
                  <button
                    key={objective.id}
                    type="button"
                    onClick={() => toggleObjective(objective.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl border px-3.5 py-3 text-left transition-all",
                      selected
                        ? "bg-zinc-900/70"
                        : "border-white/10 bg-zinc-900/50 hover:border-[#5DBCD2]/35"
                    )}
                    style={
                      selected
                        ? {
                            borderColor: `${accentColor}99`,
                            backgroundColor: `${accentColor}1f`,
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl border",
                          selected ? "bg-white/10" : "border-white/15 bg-white/5 text-zinc-300"
                        )}
                        style={
                          selected
                            ? {
                                borderColor: `${accentColor}99`,
                                backgroundColor: `${accentColor}2b`,
                                color: accentColor,
                              }
                            : undefined
                        }
                      >
                        <ObjectiveIcon className="size-4" />
                      </span>
                      <div>
                        <p className="text-base font-semibold sm:text-lg">{objective.label}</p>
                        <p className="mt-1 text-xs text-zinc-400 sm:text-sm">{objective.description}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "ml-4 flex size-7 items-center justify-center rounded-lg border",
                        selected ? "text-black" : "border-zinc-700 bg-zinc-800 text-zinc-500"
                      )}
                      style={
                        selected
                          ? {
                              borderColor: accentColor,
                              backgroundColor: accentColor,
                            }
                          : undefined
                      }
                    >
                      {selected && <Check className="size-4.5" />}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === "account" && (
          <div className="flex h-full flex-1 flex-col rounded-[1.75rem] border border-white/10 bg-[#020617]/75 px-4 py-4 shadow-[0_16px_46px_rgba(2,6,23,0.45)] backdrop-blur-sm">
            <header className="mb-3">
              <h1 className="text-3xl font-black leading-[0.98] tracking-tight sm:text-4xl">Tu primera cuenta</h1>
              <p className="mt-2 text-sm text-zinc-400 sm:text-base">
                Elegí tu banco o billetera. Luego podés editarla desde Cuentas.
              </p>
            </header>

            <div className="mb-3 flex rounded-full border border-white/10 bg-zinc-900/60 p-1">
              <button
                type="button"
                onClick={() => changeAccountScope("nacional")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
                  accountScope === "nacional" ? "bg-[#5DBCD2] text-black" : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                <Landmark className="size-4" />
                Nacional
              </button>
              <button
                type="button"
                onClick={() => changeAccountScope("internacional")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
                  accountScope === "internacional" ? "bg-[#5DBCD2] text-black" : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                <Wallet className="size-4" />
                Internacional
              </button>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Seleccionar</p>
              <div className="grid grid-cols-2 gap-2">
                {presetOptions.map((preset) => {
                  const active = accountPresetName === preset.name
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => selectAccountPreset(preset)}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                        active && "border-[#5DBCD2]/65 bg-[#5DBCD2]/12 text-white",
                        !active && "border-white/10 bg-zinc-900/50 text-zinc-300 hover:border-[#5DBCD2]/35"
                      )}
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/8 text-[#5DBCD2]">
                        <PresetBrandAvatar preset={preset} />
                      </span>
                      <span className="truncate">{preset.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-3 space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Nombre</label>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-2">
                <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/8 text-[#5DBCD2]">
                  {accountPresetName !== "Personalizado" && selectedPreset ? (
                    <PresetBrandAvatar preset={selectedPreset} />
                  ) : (
                    <SelectedAccountIcon className="size-4 text-[#5DBCD2]" />
                  )}
                </span>
                <input
                  value={accountName}
                  onChange={(event) => setAccountName(event.target.value)}
                  placeholder="Nombre de la cuenta"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                />
              </div>

              {accountPresetName === "Personalizado" && (
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Icono
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {ACCOUNT_ICON_OPTIONS.map((iconName) => {
                      const IconOption = getIcon(iconName)
                      const selectedIcon = accountIcon === iconName
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => setAccountIcon(iconName)}
                          className={cn(
                            "flex h-9 items-center justify-center rounded-lg border transition-colors",
                            selectedIcon
                              ? "border-[#5DBCD2]/70 bg-[#5DBCD2]/18 text-[#5DBCD2]"
                              : "border-white/10 bg-zinc-900/50 text-zinc-400 hover:border-[#5DBCD2]/35"
                          )}
                          aria-label={`Icono ${iconName}`}
                        >
                          <IconOption className="size-4" />
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Saldo inicial ({accountScope === "nacional" ? "UYU" : "USD"})
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-2">
                <span className="text-sm font-semibold text-zinc-300">{accountCurrencySymbol}</span>
                <input
                  value={accountBalance}
                  onChange={(event) => setAccountBalance(event.target.value)}
                  inputMode="decimal"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            {accountScope === "nacional" && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-zinc-900/45 px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">Cuenta en dólares</p>
                    <p className="text-xs text-zinc-400">Activá un segundo saldo en USD para esta cuenta</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={usdEnabled}
                    onClick={() => setUsdEnabled((prev) => !prev)}
                    className={cn(
                      "relative h-7 w-12 rounded-full transition-colors",
                      usdEnabled ? "bg-[#5DBCD2]" : "bg-zinc-700"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute left-1 top-1 size-5 rounded-full bg-white transition-transform",
                        usdEnabled ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>

                {usdEnabled && (
                  <div className="mt-3">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Saldo inicial (USD)
                    </label>
                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/65 px-3 py-2">
                      <span className="text-sm font-semibold text-zinc-300">US$</span>
                      <input
                        value={usdBalance}
                        onChange={(event) => setUsdBalance(event.target.value)}
                        inputMode="decimal"
                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Color</p>
              <div className="flex flex-wrap gap-2">
                {ACCOUNT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setAccountColor(color)}
                    className={cn(
                      "h-8 w-8 rounded-full border transition-transform",
                      accountColor === color ? "scale-110 border-white/90" : "border-white/20 hover:scale-105"
                    )}
                    style={{ backgroundColor: color }}
                    aria-label={`Color ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {step === "categories" && (
          <div className="flex h-full flex-1 flex-col rounded-[1.75rem] border border-white/10 bg-[#020617]/75 px-4 py-4 shadow-[0_16px_46px_rgba(2,6,23,0.45)] backdrop-blur-sm">
            <header className="mb-3">
              <h1 className="text-3xl font-black leading-[0.98] tracking-tight sm:text-4xl">Elige tus categorias</h1>
              <p className="mt-2 text-sm text-zinc-400 sm:text-base">
                Selecciona categorias base de gastos e ingresos. Luego podras editarlas.
              </p>
            </header>

            <div className="mb-3 flex rounded-full border border-white/10 bg-zinc-900/60 p-1">
              <button
                type="button"
                onClick={() => setActiveType("expense")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
                  activeType === "expense"
                    ? "bg-red-500 text-white shadow-[0_8px_24px_rgba(239,68,68,0.32)]"
                    : "text-zinc-400 hover:text-red-300"
                )}
              >
                <ArrowDownLeft className="size-4" />
                Gastos
              </button>
              <button
                type="button"
                onClick={() => setActiveType("income")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
                  activeType === "income"
                    ? "bg-emerald-400 text-black shadow-[0_8px_24px_rgba(74,222,128,0.28)]"
                    : "text-zinc-400 hover:text-emerald-300"
                )}
              >
                <ArrowUpRight className="size-4" />
                Ingresos
              </button>
            </div>

            <div className="mb-3 flex items-center justify-between">
              <button type="button" onClick={toggleAllForCurrentType} className="text-sm underline">
                {activeSelectedCount === activeCategoryCount ? "Deseleccionar todo" : "Seleccionar todo"}
              </button>
              <span className="text-base text-zinc-300">
                {activeSelectedCount} de {activeCategoryCount}
              </span>
            </div>

            <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
              {categories.map((category, categoryIndex) => {
                if (category.type !== activeType) return null
                const selected = selectedCategories.has(categoryIndex)
                const expanded = expandedCategories.has(categoryIndex)
                const CategoryIcon = getIcon(category.icon)
                const checkedSubs = category.subcategories.filter((_, subIndex) =>
                  selectedSubcategories.has(`${categoryIndex}-${subIndex}`)
                ).length

                return (
                  <article
                    key={`${category.name}-${categoryIndex}`}
                    className={cn(
                      "rounded-2xl border p-3.5 transition-colors",
                      selected ? "border-[#5DBCD2]/45 bg-[#5DBCD2]/6" : "border-white/10 bg-zinc-950/70"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex size-10 items-center justify-center rounded-xl text-sm font-bold text-black"
                        style={{ backgroundColor: `${category.color}44`, color: category.color }}
                      >
                        <CategoryIcon className="size-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-bold leading-tight sm:text-xl">{category.name}</p>
                        <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
                          {checkedSubs} de {category.subcategories.length} subcategorias
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleCategory(categoryIndex)}
                        className={cn(
                          "flex size-9 items-center justify-center rounded-full border",
                          selected
                            ? "border-[#5DBCD2] bg-[#5DBCD2] text-black"
                            : "border-zinc-700 bg-zinc-800 text-zinc-500"
                        )}
                      >
                        {selected && <Check className="size-4.5" />}
                      </button>
                    </div>

                    {selected && (
                      <>
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => toggleExpanded(categoryIndex)}
                            className="text-xs font-medium text-zinc-300 underline sm:text-sm"
                          >
                            {expanded ? "Ocultar subcategorias" : "Editar subcategorias"}
                          </button>
                        </div>
                        {expanded && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {category.subcategories.map((sub, subIndex) => {
                              const subSelected = selectedSubcategories.has(`${categoryIndex}-${subIndex}`)
                              const SubIcon = getIcon(sub.icon)
                              return (
                                <button
                                  key={`${categoryIndex}-${sub.name}`}
                                  type="button"
                                  onClick={() => toggleSubcategory(categoryIndex, subIndex)}
                                  className={cn(
                                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-all sm:px-3 sm:py-1.5 sm:text-sm",
                                    subSelected
                                      ? "border-[#5DBCD2]/55 bg-[#5DBCD2]/16 text-[#a8e5f1]"
                                      : "border-zinc-700 bg-zinc-900 text-zinc-400"
                                  )}
                                >
                                  <SubIcon className="size-3.5 shrink-0" />
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
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Estamos preparando tu espacio
              </p>
              <h2 className="mt-2 text-5xl font-black leading-[0.95] sm:text-6xl">
                {LOADER_WORDS[loaderPhraseIndex]}
              </h2>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-[#5DBCD2] transition-[width] duration-300"
                style={{ width: `${loaderProgress}%` }}
              />
            </div>
          </div>
        )}

        {step !== "welcome" && step !== "loading" && (
          <div className="mt-5 space-y-3">
            {error && <p className="rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-300">{error}</p>}
            <Button
              type="button"
              onClick={handleNext}
              disabled={!canContinue() || saving}
              className="h-13 w-full rounded-full bg-[#5DBCD2] text-base font-semibold text-black hover:bg-[#74cade] disabled:bg-zinc-800 disabled:text-zinc-500"
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
