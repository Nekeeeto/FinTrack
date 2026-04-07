"use client"

import { useEffect, useState, useCallback } from "react"
import { Upload, FileSpreadsheet, ArrowRight, CheckCircle2, XCircle, Loader2, AlertTriangle } from "lucide-react"
import type { Account, Category } from "@/types/database"

type Step = "upload" | "mapping" | "preview" | "done"

interface ParsedCSV {
  headers: string[]
  rows: string[][]
}

interface ColumnMapping {
  date: string
  amount: string
  description: string
  category: string
  account_id: string
  currency: string
}

interface MappedRow {
  date: string
  amount: number
  description: string
  category_id: string
  account_id: string
  currency: string
  _original_category: string
  _valid: boolean
  _errors: string[]
}

// Presets conocidos para apps populares
const PRESETS: Record<string, Partial<ColumnMapping>> = {
  wallet: {
    date: "Date",
    amount: "Amount",
    description: "Note",
    category: "Category",
    currency: "Currency",
  },
  budgetbakers: {
    date: "date",
    amount: "amount",
    description: "note",
    category: "category_name",
    currency: "currency",
  },
}

function parseCSV(text: string): ParsedCSV {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return { headers: [], rows: [] }

  // Detectar separador (comma, semicolon, tab)
  const firstLine = lines[0]
  const separator = firstLine.includes("\t")
    ? "\t"
    : firstLine.split(";").length > firstLine.split(",").length
      ? ";"
      : ","

  const parseRow = (line: string): string[] => {
    const result: string[] = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === separator && !inQuotes) {
        result.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  }

  const headers = parseRow(lines[0])
  const rows = lines.slice(1).filter((l) => l.trim()).map(parseRow)

  return { headers, rows }
}

function parseDate(value: string): string | null {
  // Intentar varios formatos comunes
  const formats = [
    // ISO: 2024-01-15
    /^(\d{4})-(\d{2})-(\d{2})/,
    // DD/MM/YYYY
    /^(\d{2})\/(\d{2})\/(\d{4})/,
    // MM/DD/YYYY
    /^(\d{2})\/(\d{2})\/(\d{4})/,
    // DD-MM-YYYY
    /^(\d{2})-(\d{2})-(\d{4})/,
  ]

  // ISO
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`

  // DD/MM/YYYY o DD-MM-YYYY
  const dmyMatch = value.match(/^(\d{2})[/\-.](\d{2})[/\-.](\d{4})/)
  if (dmyMatch) return `${dmyMatch[3]}-${dmyMatch[2]}-${dmyMatch[1]}`

  return null
}

function parseAmount(value: string): number | null {
  // Limpiar: quitar símbolos de moneda, espacios
  let clean = value.replace(/[$ €£¥R\s]/g, "")
  // Manejar formato europeo: 1.234,56 -> 1234.56
  if (clean.includes(",") && clean.includes(".")) {
    if (clean.lastIndexOf(",") > clean.lastIndexOf(".")) {
      clean = clean.replace(/\./g, "").replace(",", ".")
    } else {
      clean = clean.replace(/,/g, "")
    }
  } else if (clean.includes(",")) {
    clean = clean.replace(",", ".")
  }

  const num = parseFloat(clean)
  return isNaN(num) ? null : Math.abs(num)
}

export default function ImportarPage() {
  const [step, setStep] = useState<Step>("upload")
  const [csv, setCsv] = useState<ParsedCSV | null>(null)
  const [fileName, setFileName] = useState("")
  const [mapping, setMapping] = useState<ColumnMapping>({
    date: "",
    amount: "",
    description: "",
    category: "",
    account_id: "",
    currency: "",
  })
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedAccount, setSelectedAccount] = useState("")
  const [defaultCurrency, setDefaultCurrency] = useState("UYU")
  const [mappedRows, setMappedRows] = useState<MappedRow[]>([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  useEffect(() => {
    fetch("/api/accounts").then((r) => r.json()).then((d) => setAccounts(d.data ?? d ?? []))
    fetch("/api/categories").then((r) => r.json()).then((d) => setCategories(d.data ?? d ?? []))
  }, [])

  const handleFile = useCallback((file: File) => {
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const parsed = parseCSV(text)
      if (parsed.headers.length === 0) return
      setCsv(parsed)

      // Auto-detectar preset
      const headerSet = new Set(parsed.headers.map((h) => h.toLowerCase()))
      for (const [, preset] of Object.entries(PRESETS)) {
        const presetHeaders = Object.values(preset).map((v) => (v as string).toLowerCase())
        if (presetHeaders.every((h) => headerSet.has(h))) {
          setMapping({
            date: parsed.headers.find((h) => h.toLowerCase() === preset.date?.toLowerCase()) ?? "",
            amount: parsed.headers.find((h) => h.toLowerCase() === preset.amount?.toLowerCase()) ?? "",
            description: parsed.headers.find((h) => h.toLowerCase() === preset.description?.toLowerCase()) ?? "",
            category: parsed.headers.find((h) => h.toLowerCase() === preset.category?.toLowerCase()) ?? "",
            account_id: "",
            currency: parsed.headers.find((h) => h.toLowerCase() === preset.currency?.toLowerCase()) ?? "",
          })
          break
        }
      }

      setStep("mapping")
    }
    reader.readAsText(file)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file && (file.name.endsWith(".csv") || file.name.endsWith(".tsv"))) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const processMapping = () => {
    if (!csv || !selectedAccount) return

    // Buscar categorías por nombre (fuzzy match simple)
    const categoryMap = new Map<string, string>()
    const allCategories = categories.flatMap((c) => [
      c,
      ...(c.subcategories ?? []),
    ])

    for (const cat of allCategories) {
      categoryMap.set(cat.name.toLowerCase(), cat.id)
    }

    const rows: MappedRow[] = csv.rows.map((row) => {
      const errors: string[] = []
      const headerIndex = (col: string) => csv.headers.indexOf(col)

      // Fecha
      const rawDate = mapping.date ? row[headerIndex(mapping.date)] ?? "" : ""
      const date = parseDate(rawDate)
      if (!date) errors.push("Fecha inválida")

      // Monto
      const rawAmount = mapping.amount ? row[headerIndex(mapping.amount)] ?? "" : ""
      const amount = parseAmount(rawAmount)
      if (!amount || amount === 0) errors.push("Monto inválido")

      // Descripción
      const description = mapping.description ? row[headerIndex(mapping.description)] ?? "" : ""

      // Categoría
      const rawCategory = mapping.category ? row[headerIndex(mapping.category)] ?? "" : ""
      const categoryId = categoryMap.get(rawCategory.toLowerCase()) ?? ""
      if (!categoryId) errors.push("Categoría no encontrada")

      // Moneda
      const currency = mapping.currency
        ? row[headerIndex(mapping.currency)]?.toUpperCase() ?? defaultCurrency
        : defaultCurrency

      return {
        date: date ?? "",
        amount: amount ?? 0,
        description,
        category_id: categoryId,
        account_id: selectedAccount,
        currency: ["UYU", "USD", "BRL", "ARS"].includes(currency) ? currency : defaultCurrency,
        _original_category: rawCategory,
        _valid: errors.length === 0,
        _errors: errors,
      }
    })

    setMappedRows(rows)
    setStep("preview")
  }

  const doImport = async () => {
    const validRows = mappedRows.filter((r) => r._valid)
    if (validRows.length === 0) return

    setImporting(true)
    setResult(null)

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: validRows.map(({ _original_category, _valid, _errors, ...row }) => row),
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setResult({ ok: true, message: data.message })
        setStep("done")
      } else {
        setResult({ ok: false, message: data.error || "Error en la importación" })
      }
    } catch {
      setResult({ ok: false, message: "Error de conexión" })
    } finally {
      setImporting(false)
    }
  }

  const validCount = mappedRows.filter((r) => r._valid).length
  const invalidCount = mappedRows.filter((r) => !r._valid).length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileSpreadsheet className="h-6 w-6" />
          Importar CSV
        </h1>
        <p className="text-muted-foreground mt-1">
          Importá transacciones desde Wallet, BudgetBakers u otro CSV.
        </p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-2 text-sm">
        {(["upload", "mapping", "preview", "done"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
            <span
              className={
                step === s
                  ? "font-medium text-emerald-500"
                  : step > s || (step === "done" && s !== "done")
                    ? "text-muted-foreground"
                    : "text-muted-foreground/50"
              }
            >
              {s === "upload" && "Subir archivo"}
              {s === "mapping" && "Mapear columnas"}
              {s === "preview" && "Preview"}
              {s === "done" && "Listo"}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === "upload" && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-emerald-500/50 transition-colors cursor-pointer"
          onClick={() => {
            const input = document.createElement("input")
            input.type = "file"
            input.accept = ".csv,.tsv"
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0]
              if (file) handleFile(file)
            }
            input.click()
          }}
        >
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Arrastrá un archivo CSV acá</p>
          <p className="text-sm text-muted-foreground mt-1">
            O hacé click para seleccionar. Soporta CSV y TSV.
          </p>
        </div>
      )}

      {/* Step 2: Column Mapping */}
      {step === "mapping" && csv && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Mapeo de columnas</h2>
              <span className="text-sm text-muted-foreground">
                {fileName} — {csv.rows.length} filas
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(
                [
                  { key: "date", label: "Fecha *", required: true },
                  { key: "amount", label: "Monto *", required: true },
                  { key: "description", label: "Descripción", required: false },
                  { key: "category", label: "Categoría", required: false },
                  { key: "currency", label: "Moneda", required: false },
                ] as const
              ).map(({ key, label }) => (
                <div key={key}>
                  <label className="text-sm font-medium block mb-1">{label}</label>
                  <select
                    value={mapping[key]}
                    onChange={(e) => setMapping((m) => ({ ...m, [key]: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
                  >
                    <option value="">— No mapear —</option>
                    {csv.headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              <div>
                <label className="text-sm font-medium block mb-1">Cuenta destino *</label>
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
                >
                  <option value="">— Seleccionar —</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Moneda por defecto</label>
                <select
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
                >
                  {["UYU", "USD", "BRL", "ARS"].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preview de datos crudos */}
            <div>
              <h3 className="text-sm font-medium mb-2">Vista previa (primeras 3 filas)</h3>
              <div className="overflow-x-auto">
                <table className="text-xs w-full">
                  <thead>
                    <tr className="border-b border-border">
                      {csv.headers.map((h) => (
                        <th key={h} className="text-left p-2 font-medium text-muted-foreground">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csv.rows.slice(0, 3).map((row, i) => (
                      <tr key={i} className="border-b border-border/50">
                        {row.map((cell, j) => (
                          <td key={j} className="p-2 max-w-[150px] truncate">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setStep("upload")
                setCsv(null)
              }}
              className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-accent transition-colors"
            >
              Volver
            </button>
            <button
              onClick={processMapping}
              disabled={!mapping.date || !mapping.amount || !selectedAccount}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
            >
              Procesar y ver preview
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === "preview" && (
        <div className="space-y-6">
          <div className="flex gap-3">
            <div className="flex-1 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="text-2xl font-bold text-emerald-500">{validCount}</div>
              <div className="text-sm text-muted-foreground">válidas</div>
            </div>
            {invalidCount > 0 && (
              <div className="flex-1 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <div className="text-2xl font-bold text-red-500">{invalidCount}</div>
                <div className="text-sm text-muted-foreground">con errores (se saltean)</div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="text-sm w-full">
                <thead className="sticky top-0 bg-card">
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium">Estado</th>
                    <th className="text-left p-3 font-medium">Fecha</th>
                    <th className="text-right p-3 font-medium">Monto</th>
                    <th className="text-left p-3 font-medium">Descripción</th>
                    <th className="text-left p-3 font-medium">Categoría</th>
                    <th className="text-left p-3 font-medium">Moneda</th>
                  </tr>
                </thead>
                <tbody>
                  {mappedRows.slice(0, 100).map((row, i) => (
                    <tr
                      key={i}
                      className={`border-b border-border/50 ${!row._valid ? "opacity-50" : ""}`}
                    >
                      <td className="p-3">
                        {row._valid ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <span title={row._errors.join(", ")}>
                            <XCircle className="h-4 w-4 text-red-500" />
                          </span>
                        )}
                      </td>
                      <td className="p-3">{row.date}</td>
                      <td className="p-3 text-right font-mono">{row.amount.toLocaleString()}</td>
                      <td className="p-3 max-w-[200px] truncate">{row.description}</td>
                      <td className="p-3">
                        {row.category_id ? (
                          <span className="text-emerald-500">
                            {categories
                              .flatMap((c) => [c, ...(c.subcategories ?? [])])
                              .find((c) => c.id === row.category_id)?.name ?? "?"}
                          </span>
                        ) : (
                          <span className="text-red-400 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {row._original_category || "Sin categoría"}
                          </span>
                        )}
                      </td>
                      <td className="p-3">{row.currency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {mappedRows.length > 100 && (
              <div className="p-3 text-center text-sm text-muted-foreground border-t border-border">
                Mostrando 100 de {mappedRows.length} filas
              </div>
            )}
          </div>

          {result && !result.ok && (
            <div className="p-4 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 text-sm">
              {result.message}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep("mapping")}
              className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-accent transition-colors"
            >
              Volver al mapeo
            </button>
            <button
              onClick={doImport}
              disabled={importing || validCount === 0}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {importing && <Loader2 className="h-4 w-4 animate-spin" />}
              Importar {validCount} transacciones
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Done */}
      {step === "done" && result?.ok && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center space-y-4">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
          <h2 className="text-xl font-bold">{result.message}</h2>
          <p className="text-muted-foreground">
            Las transacciones ya están disponibles en el dashboard.
          </p>
          <div className="flex gap-3 justify-center">
            <a
              href="/transacciones"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
            >
              Ver transacciones
            </a>
            <button
              onClick={() => {
                setStep("upload")
                setCsv(null)
                setMappedRows([])
                setResult(null)
              }}
              className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-accent transition-colors"
            >
              Importar otro archivo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
