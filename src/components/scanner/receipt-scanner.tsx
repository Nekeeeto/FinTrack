"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Camera, Loader2, CheckCircle2, AlertCircle, Upload, RotateCcw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { formatMoney } from "@/lib/format"
import type { OCRResult } from "@/lib/ocr"
import type { Account, Category, Currency, Transaction } from "@/types/database"

type ScannerState = "idle" | "processing" | "review" | "success" | "error"

interface QuotaInfo {
  used: number
  limit: number | null
  plan: string
}

interface ReviewData {
  amount: string
  currency: Currency
  description: string
  date: string
  category_id: string
  account_id: string
}

export function ReceiptScanner() {
  const [state, setState] = useState<ScannerState>("idle")
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null)
  const [quota, setQuota] = useState<QuotaInfo | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [quotaExceeded, setQuotaExceeded] = useState(false)
  const [savedTransaction, setSavedTransaction] = useState<Transaction | null>(null)
  const [confirming, setConfirming] = useState(false)

  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [review, setReview] = useState<ReviewData>({
    amount: "",
    currency: "UYU",
    description: "",
    date: new Date().toISOString().split("T")[0],
    category_id: "",
    account_id: "",
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Cargar categorias y cuentas
  useEffect(() => {
    Promise.all([
      fetch("/api/categories?flat=true").then((r) => r.json()),
      fetch("/api/accounts").then((r) => r.json()),
    ]).then(([catRes, accRes]) => {
      const cats = catRes.data || catRes || []
      setCategories(cats)
      const accs = accRes.data || accRes || []
      setAccounts(accs)
      if (accs.length > 0) {
        setReview((prev) => ({ ...prev, account_id: accs[0].id }))
      }
    })
  }, [])

  const processImage = useCallback(
    async (file: File) => {
      setState("processing")
      setErrorMessage("")
      setQuotaExceeded(false)

      const formData = new FormData()
      formData.append("image", file)

      try {
        const res = await fetch("/api/scanner", {
          method: "POST",
          body: formData,
        })

        const data = await res.json()

        if (!res.ok) {
          if (res.status === 403 && data.quota) {
            setQuotaExceeded(true)
            setQuota(data.quota)
          }
          setErrorMessage(data.error || "Error al procesar la imagen")
          setState("error")
          return
        }

        const ocr = data.ocr as OCRResult
        setOcrResult(ocr)
        setQuota(data.quota)

        // Pre-llenar el formulario de review
        setReview((prev) => ({
          ...prev,
          amount: ocr.monto ? String(ocr.monto) : "",
          currency: ocr.moneda,
          description: ocr.comercio || "",
          date: ocr.fecha || new Date().toISOString().split("T")[0],
        }))

        setState("review")
      } catch {
        setErrorMessage("Error de conexion. Intentalo de nuevo.")
        setState("error")
      }
    },
    []
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processImage(file)
    },
    [processImage]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files?.[0]
      if (file && file.type.startsWith("image/")) {
        processImage(file)
      }
    },
    [processImage]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleConfirm = async () => {
    if (!review.amount || !review.account_id || !review.category_id) return

    setConfirming(true)
    try {
      const res = await fetch("/api/scanner/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_id: review.account_id,
          category_id: review.category_id,
          amount: parseFloat(review.amount),
          currency: review.currency,
          description: review.description,
          date: review.date,
          raw_ocr_data: ocrResult ? (ocrResult as unknown as Record<string, unknown>) : null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setErrorMessage(data.error || "Error al guardar la transaccion")
        setState("error")
        return
      }

      const tx = await res.json()
      setSavedTransaction(tx)
      setState("success")
    } catch {
      setErrorMessage("Error de conexion al guardar")
      setState("error")
    } finally {
      setConfirming(false)
    }
  }

  const handleReset = () => {
    setState("idle")
    setOcrResult(null)
    setErrorMessage("")
    setQuotaExceeded(false)
    setSavedTransaction(null)
    setReview({
      amount: "",
      currency: "UYU",
      description: "",
      date: new Date().toISOString().split("T")[0],
      category_id: "",
      account_id: accounts.length > 0 ? accounts[0].id : "",
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const confidenceColor = (c: string) => {
    switch (c) {
      case "alta":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      case "media":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20"
      case "baja":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const quotaText = () => {
    if (!quota) return null
    if (quota.plan === "premium") return "Ilimitado"
    return `${quota.used}/${quota.limit} fotos usadas este mes`
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Estado: Idle - Zona de carga */}
      {state === "idle" && (
        <Card className="p-6">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragging
                ? "border-emerald-500 bg-emerald-500/5"
                : "border-border hover:border-emerald-500/50"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Escaneá tu ticket</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sacale una foto a tu boleta o arrastrala aca
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {/* Boton camara (mobile) */}
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Camera className="h-4 w-4" />
                Sacar foto
              </Button>

              {/* Boton subir archivo (desktop) */}
              <Button
                variant="outline"
                onClick={() => {
                  if (fileInputRef.current) {
                    // Quitar capture para abrir selector de archivo
                    fileInputRef.current.removeAttribute("capture")
                    fileInputRef.current.click()
                    // Restaurar capture
                    setTimeout(() => {
                      fileInputRef.current?.setAttribute("capture", "environment")
                    }, 100)
                  }
                }}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Subir imagen
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {quota && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              {quotaText()}
            </p>
          )}
        </Card>
      )}

      {/* Estado: Procesando */}
      {state === "processing" && (
        <Card className="p-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
            <p className="text-sm text-muted-foreground">
              Procesando tu ticket...
            </p>
          </div>
        </Card>
      )}

      {/* Estado: Review */}
      {state === "review" && ocrResult && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Verificar datos</h3>
            <Badge className={confidenceColor(ocrResult.confianza)}>
              Confianza {ocrResult.confianza}
            </Badge>
          </div>

          {/* Monto y moneda */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="amount">Monto</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={review.amount}
                onChange={(e) =>
                  setReview((prev) => ({ ...prev, amount: e.target.value }))
                }
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="currency">Moneda</Label>
              <select
                id="currency"
                value={review.currency}
                onChange={(e) =>
                  setReview((prev) => ({
                    ...prev,
                    currency: e.target.value as Currency,
                  }))
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="UYU">UYU</option>
                <option value="USD">USD</option>
                <option value="BRL">BRL</option>
                <option value="ARS">ARS</option>
              </select>
            </div>
          </div>

          {/* Descripcion */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Comercio / Descripcion</Label>
            <Input
              id="description"
              value={review.description}
              onChange={(e) =>
                setReview((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Ej: Supermercado Disco"
            />
          </div>

          {/* Fecha */}
          <div className="space-y-1.5">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={review.date}
              onChange={(e) =>
                setReview((prev) => ({ ...prev, date: e.target.value }))
              }
            />
          </div>

          {/* Categoria */}
          <div className="space-y-1.5">
            <Label htmlFor="category">Categoria</Label>
            <select
              id="category"
              value={review.category_id}
              onChange={(e) =>
                setReview((prev) => ({ ...prev, category_id: e.target.value }))
              }
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Seleccionar categoria</option>
              {categories
                .filter((c) => c.type === "expense")
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Cuenta */}
          <div className="space-y-1.5">
            <Label htmlFor="account">Cuenta</Label>
            <select
              id="account"
              value={review.account_id}
              onChange={(e) =>
                setReview((prev) => ({ ...prev, account_id: e.target.value }))
              }
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Seleccionar cuenta</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.currency})
                </option>
              ))}
            </select>
          </div>

          {/* Items del OCR */}
          {ocrResult.items.length > 0 && (
            <div className="space-y-1.5">
              <Label>Items detectados</Label>
              <div className="text-xs text-muted-foreground bg-muted rounded-md p-3 space-y-0.5">
                {ocrResult.items.map((item, i) => (
                  <p key={i}>{item}</p>
                ))}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleConfirm}
              disabled={
                confirming ||
                !review.amount ||
                !review.category_id ||
                !review.account_id
              }
              className="flex-1 gap-2"
            >
              {confirming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Confirmar
            </Button>
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <X className="h-4 w-4" />
              Cancelar
            </Button>
          </div>

          {quota && (
            <p className="text-xs text-muted-foreground text-center">
              {quotaText()}
            </p>
          )}
        </Card>
      )}

      {/* Estado: Exito */}
      {state === "success" && savedTransaction && (
        <Card className="p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <h3 className="text-lg font-semibold">Gasto guardado!</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="text-2xl font-bold text-foreground">
                {formatMoney(savedTransaction.amount, savedTransaction.currency)}
              </p>
              {savedTransaction.description && (
                <p>{savedTransaction.description}</p>
              )}
              <p>{savedTransaction.date}</p>
            </div>
            <Button onClick={handleReset} className="gap-2 mt-2">
              <Camera className="h-4 w-4" />
              Escanear otro
            </Button>
          </div>
        </Card>
      )}

      {/* Estado: Error */}
      {state === "error" && (
        <Card className="p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <h3 className="text-lg font-semibold">
              {quotaExceeded ? "Limite alcanzado" : "Error"}
            </h3>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
            {quotaExceeded ? (
              <a href="/configuracion">
                <Button className="gap-2 mt-2">Ver planes</Button>
              </a>
            ) : (
              <Button onClick={handleReset} className="gap-2 mt-2">
                <RotateCcw className="h-4 w-4" />
                Reintentar
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
