"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Mic, X, Loader2, MicOff, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Account, Category } from "@/types/database"

type VoiceState = "idle" | "recording" | "processing" | "success" | "error"

interface ParsedTransaction {
  type: "expense" | "income"
  amount: number | null
  currency: string | null
  category_id: string | null
  category_name: string | null
  account_id: string | null
  account_name: string | null
  description: string
}

// Palabras clave para detectar intención
const INCOME_KEYWORDS = ["cobré", "cobre", "ingreso", "ingresé", "ingrese", "recibí", "recibi", "me pagaron", "me transfirieron", "gané", "gane"]
const EXPENSE_KEYWORDS = ["gasté", "gaste", "pagué", "pague", "compré", "compre", "gastos", "gasto"]
const DELETE_KEYWORDS = ["borrar", "eliminar", "borrá", "eliminá", "borra", "elimina", "quitar"]
const UNSUPPORTED_KEYWORDS = ["hola", "cómo estás", "como estas", "qué tal", "que tal", "contame", "decime", "hablame"]

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}

// Convertir palabras numéricas en español a número
function wordsToNumber(text: string): number | null {
  const normalized = normalizeText(text)

  const units: Record<string, number> = {
    cero: 0, un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5,
    seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12,
    trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17,
    dieciocho: 18, diecinueve: 19, veinte: 20, veintiuno: 21, veintidos: 22,
    veintitres: 23, veinticuatro: 24, veinticinco: 25, veintiseis: 26,
    veintisiete: 27, veintiocho: 28, veintinueve: 29,
  }
  const tens: Record<string, number> = {
    treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60,
    setenta: 70, ochenta: 80, noventa: 90,
  }
  const hundreds: Record<string, number> = {
    cien: 100, ciento: 100, doscientos: 200, doscientas: 200,
    trescientos: 300, trescientas: 300, cuatrocientos: 400, cuatrocientas: 400,
    quinientos: 500, quinientas: 500, seiscientos: 600, seiscientas: 600,
    setecientos: 700, setecientas: 700, ochocientos: 800, ochocientas: 800,
    novecientos: 900, novecientas: 900,
  }

  // Limpiar conectores
  const words = normalized
    .replace(/\by\b/g, "")
    .replace(/\bcon\b/g, ".")
    .split(/\s+/)
    .filter(Boolean)

  let total = 0
  let current = 0
  let found = false

  for (const word of words) {
    if (units[word] !== undefined) {
      current += units[word]
      found = true
    } else if (tens[word] !== undefined) {
      current += tens[word]
      found = true
    } else if (hundreds[word] !== undefined) {
      current += hundreds[word]
      found = true
    } else if (word === "mil") {
      current = current === 0 ? 1000 : current * 1000
      found = true
    } else if (word === "millon" || word === "millones") {
      current = current === 0 ? 1000000 : current * 1000000
      found = true
    } else if (found) {
      // Si ya encontramos números y ahora hay una palabra no numérica, paramos
      break
    }
  }

  total += current
  return found && total > 0 ? total : null
}

function extractAmount(text: string): { amount: number | null; remaining: string } {
  // 1. Buscar dígitos primero: "$1500", "1500 pesos", "1.500", "1500,50"
  const digitPatterns = [
    /\$\s?([\d.,]+)/,
    /([\d.,]+)\s*(?:pesos|dolares|dólares|reales)/i,
    /(?:de|por|en)\s+([\d.,]+)/,
    /(\d[\d.,]*)/,
  ]

  for (const pattern of digitPatterns) {
    const match = text.match(pattern)
    if (match) {
      const raw = match[1].replace(/\./g, "").replace(",", ".")
      const amount = parseFloat(raw)
      if (!isNaN(amount) && amount > 0) {
        const remaining = text.replace(match[0], "").trim()
        return { amount, remaining }
      }
    }
  }

  // 2. Buscar números en palabras: "mil quinientos", "doscientos cincuenta"
  const wordAmount = wordsToNumber(text)
  if (wordAmount) {
    // Remover las palabras numéricas del texto restante
    const numWords = [
      "cero", "un", "uno", "una", "dos", "tres", "cuatro", "cinco", "seis",
      "siete", "ocho", "nueve", "diez", "once", "doce", "trece", "catorce",
      "quince", "dieciseis", "diecisiete", "dieciocho", "diecinueve", "veinte",
      "veintiuno", "veintidos", "veintitres", "veinticuatro", "veinticinco",
      "veintiseis", "veintisiete", "veintiocho", "veintinueve", "treinta",
      "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa",
      "cien", "ciento", "doscientos", "doscientas", "trescientos", "trescientas",
      "cuatrocientos", "cuatrocientas", "quinientos", "quinientas", "seiscientos",
      "seiscientas", "setecientos", "setecientas", "ochocientos", "ochocientas",
      "novecientos", "novecientas", "mil", "millon", "millones",
    ]
    let remaining = normalizeText(text)
    for (const w of numWords) {
      remaining = remaining.replace(new RegExp(`\\b${w}\\b`, "g"), "")
    }
    remaining = remaining.replace(/\s+/g, " ").trim()
    return { amount: wordAmount, remaining }
  }

  return { amount: null, remaining: text }
}

function matchCategory(text: string, categories: Category[]): { id: string; name: string } | null {
  const normalized = normalizeText(text)
  // Buscar subcategorías primero (más específicas), luego padres
  const sorted = [...categories].sort((a, b) => (a.parent_id ? -1 : 1) - (b.parent_id ? -1 : 1))

  for (const cat of sorted) {
    const catName = normalizeText(cat.name)
    if (normalized.includes(catName)) {
      return { id: cat.id, name: cat.name }
    }
  }

  // Aliases comunes (todo normalizado, sin acentos)
  const aliases: Record<string, string[]> = {
    supermercado: ["super", "supers", "mercado", "almacen", "compras", "chino"],
    transporte: ["uber", "taxi", "bondi", "omnibus", "bus", "nafta", "combustible", "gasolina", "estacionamiento"],
    restaurante: ["restaurant", "comida", "cena", "almuerzo", "comi", "morfi"],
    salud: ["farmacia", "medico", "doctor", "remedio", "hospital", "clinica"],
    entretenimiento: ["cine", "netflix", "spotify", "juego", "juegos", "salida", "salidas", "bar", "boliche"],
    servicios: ["luz", "agua", "gas", "internet", "telefono", "celular", "ute", "ose", "antel"],
    alquiler: ["renta", "alquiler"],
    sueldo: ["salario", "sueldo", "nomina"],
    educacion: ["curso", "cursos", "universidad", "facultad", "colegio", "escuela", "libro", "libros"],
    ropa: ["ropa", "zapatillas", "zapatos", "vestimenta", "remera", "pantalon"],
    hogar: ["casa", "mueble", "muebles", "electrodomestico", "limpieza"],
    mascotas: ["mascota", "veterinaria", "veterinario", "perro", "gato"],
  }

  for (const cat of sorted) {
    const catKey = normalizeText(cat.name)
    const catAliases = aliases[catKey] || []
    for (const alias of catAliases) {
      if (normalized.includes(alias)) {
        return { id: cat.id, name: cat.name }
      }
    }
  }

  // Búsqueda parcial: si el nombre de la categoría contiene parte del texto o viceversa
  for (const cat of sorted) {
    const catName = normalizeText(cat.name)
    const words = normalized.split(/\s+/)
    for (const word of words) {
      if (word.length >= 4 && (catName.includes(word) || word.includes(catName))) {
        return { id: cat.id, name: cat.name }
      }
    }
  }

  return null
}

function matchAccount(text: string, accounts: Account[]): { id: string; name: string } | null {
  const normalized = normalizeText(text)

  for (const acc of accounts) {
    const accName = normalizeText(acc.name)
    if (normalized.includes(accName)) {
      return { id: acc.id, name: acc.name }
    }
  }

  // Aliases para cuentas comunes
  const currencyAliases: Record<string, string[]> = {
    USD: ["dolares", "dólares", "dolar", "dólar"],
    UYU: ["pesos", "uruguayos"],
    BRL: ["reales", "real"],
    ARS: ["argentinos"],
  }

  // Si mencionan una moneda, buscar cuenta con esa moneda
  for (const [currency, aliases] of Object.entries(currencyAliases)) {
    for (const alias of aliases) {
      if (normalized.includes(alias)) {
        const acc = accounts.find((a) => a.currency === currency)
        if (acc) return { id: acc.id, name: acc.name }
      }
    }
  }

  return null
}

function detectCurrency(text: string): string | null {
  const normalized = normalizeText(text)
  if (normalized.includes("dolar") || normalized.includes("dolares") || normalized.includes("usd")) return "USD"
  if (normalized.includes("real") || normalized.includes("reales") || normalized.includes("brl")) return "BRL"
  if (normalized.includes("argentino") || normalized.includes("ars")) return "ARS"
  if (normalized.includes("peso") || normalized.includes("uyu")) return "UYU"
  return null
}

function parseTranscription(
  text: string,
  categories: Category[],
  accounts: Account[]
): { action: "create" | "delete" | "unsupported"; parsed?: ParsedTransaction; message?: string } {
  const normalized = normalizeText(text)

  // Detectar acciones no soportadas
  if (UNSUPPORTED_KEYWORDS.some((kw) => normalized.includes(normalizeText(kw)))) {
    return { action: "unsupported", message: "Solo puedo crear o borrar transacciones. Probá diciendo algo como: \"Gasté 500 en supermercado\"." }
  }

  // Detectar borrado
  if (DELETE_KEYWORDS.some((kw) => normalized.includes(normalizeText(kw)))) {
    return { action: "unsupported", message: "Para borrar transacciones, usá la lista de transacciones directamente. Pronto habilitaremos esta función por voz." }
  }

  // Detectar tipo (ingreso o gasto)
  const isIncome = INCOME_KEYWORDS.some((kw) => normalized.includes(normalizeText(kw)))
  const isExpense = EXPENSE_KEYWORDS.some((kw) => normalized.includes(normalizeText(kw)))
  const type = isIncome ? "income" : "expense"

  // Extraer monto
  const { amount, remaining } = extractAmount(text)

  // Detectar categoría
  const category = matchCategory(text, categories.filter((c) => c.type === type))

  // Detectar cuenta
  const account = matchAccount(text, accounts)

  // Detectar moneda
  const currency = detectCurrency(text)

  // Si no se detectó nada útil
  if (!amount && !isIncome && !isExpense && !category) {
    return { action: "unsupported", message: "No entendí qué querés hacer. Probá diciendo algo como: \"Gasté 1500 en supermercado con la cuenta general\"." }
  }

  // Generar descripción limpia del texto restante
  let description = remaining
    .replace(/\b(en|con|la|el|de|por|para|una|un|los|las|al)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()

  // Si la descripción es solo la categoría o cuenta, limpiar
  if (category && normalizeText(description) === normalizeText(category.name)) description = ""
  if (account && normalizeText(description) === normalizeText(account.name)) description = ""

  return {
    action: "create",
    parsed: {
      type,
      amount,
      currency,
      category_id: category?.id ?? null,
      category_name: category?.name ?? null,
      account_id: account?.id ?? null,
      account_name: account?.name ?? null,
      description,
    },
  }
}

export function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [state, setState] = useState<VoiceState>("idle")
  const [transcription, setTranscription] = useState("")
  const [feedback, setFeedback] = useState("")
  const [parsedData, setParsedData] = useState<ParsedTransaction | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  // Cargar cuentas y categorías al abrir
  useEffect(() => {
    if (!isOpen) return
    Promise.all([
      fetch("/api/accounts").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([accData, catData]) => {
      setAccounts(accData.data || [])
      setCategories(catData.data || [])
    })
  }, [isOpen])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        stream.getTracks().forEach((t) => t.stop())
        streamRef.current = null
        await processAudio(blob)
      }

      mediaRecorder.start()
      setState("recording")
      setFeedback("")
      setTranscription("")
      setParsedData(null)
    } catch {
      setState("error")
      setFeedback("No se pudo acceder al micrófono. Revisá los permisos del navegador.")
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop()
      setState("processing")
    }
  }, [])

  async function processAudio(blob: Blob) {
    try {
      const formData = new FormData()
      formData.append("audio", blob, "audio.webm")

      const res = await fetch("/api/audio/transcribe", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Error desconocido" }))
        setState("error")
        setFeedback(errData.error || "Error al procesar el audio. Intentá de nuevo.")
        return
      }

      const { text } = await res.json()
      setTranscription(text)

      // Parsear la transcripción
      const result = parseTranscription(text, categories, accounts)

      if (result.action === "unsupported") {
        setState("error")
        setFeedback(result.message || "Acción no soportada.")
        return
      }

      if (result.parsed) {
        setParsedData(result.parsed)
        setState("success")

        if (!result.parsed.amount) {
          setFeedback("No detecté el monto. Podés corregirlo antes de confirmar.")
        }
      }
    } catch {
      setState("error")
      setFeedback("Error de conexión. Intentá de nuevo.")
    }
  }

  async function confirmTransaction() {
    if (!parsedData) return

    if (!parsedData.amount) {
      setFeedback("Necesitás un monto para crear la transacción.")
      return
    }

    const accountId = parsedData.account_id || accounts[0]?.id
    const categoryId = parsedData.category_id
    if (!categoryId) {
      setFeedback("No detecté la categoría. Intentá de nuevo mencionando la categoría.")
      return
    }

    setSaving(true)
    try {
      const body = {
        account_id: accountId,
        category_id: categoryId,
        amount: parsedData.amount,
        currency: parsedData.currency || accounts.find((a) => a.id === accountId)?.currency || "UYU",
        description: parsedData.description || transcription,
        date: new Date().toISOString().split("T")[0],
        source: "webapp",
      }

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setFeedback("Transacción creada con éxito!")
        setTimeout(() => {
          handleClose()
        }, 1500)
      } else {
        const data = await res.json()
        setFeedback(data.error?.toString() || "Error al guardar.")
      }
    } catch {
      setFeedback("Error de conexión.")
    } finally {
      setSaving(false)
    }
  }

  function handleClose() {
    // Limpiar grabación si hay
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setIsOpen(false)
    setState("idle")
    setTranscription("")
    setFeedback("")
    setParsedData(null)
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-30 h-14 w-14 rounded-full bg-violet-500 text-white shadow-lg shadow-violet-500/30 hover:bg-violet-600 active:scale-95 transition-all flex items-center justify-center"
        aria-label="Asistente de voz"
      >
        <Mic className="h-6 w-6" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
          <div className="relative bg-card rounded-t-2xl md:rounded-xl border border-border shadow-xl w-full max-w-md mx-0 md:mx-4 max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <Mic className="h-4 w-4 text-violet-500" />
                </div>
                <h2 className="font-semibold text-lg">Asistente de voz</h2>
              </div>
              <button onClick={handleClose} className="p-1 rounded-md hover:bg-accent">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Estado idle - instrucciones */}
              {state === "idle" && !transcription && (
                <div className="text-center space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Presioná el micrófono y dictá tu transacción.
                  </p>
                  <div className="text-left bg-accent/50 rounded-lg p-3 space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Ejemplos:</p>
                    <p className="text-sm">&quot;Gasté 1500 en supermercado&quot;</p>
                    <p className="text-sm">&quot;Pagué 800 de luz con cuenta general&quot;</p>
                    <p className="text-sm">&quot;Cobré 25000 de sueldo&quot;</p>
                  </div>
                </div>
              )}

              {/* Grabando */}
              {state === "recording" && (
                <div className="text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center animate-pulse">
                      <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                        <Mic className="h-5 w-5 text-red-500" />
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-red-500">Grabando...</p>
                  <p className="text-xs text-muted-foreground">Tocá el botón para detener</p>
                </div>
              )}

              {/* Procesando */}
              {state === "processing" && (
                <div className="text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-violet-500" />
                  <p className="text-sm text-muted-foreground">Procesando audio...</p>
                </div>
              )}

              {/* Resultado exitoso */}
              {state === "success" && parsedData && (
                <div className="space-y-3">
                  {/* Transcripción */}
                  <div className="bg-accent/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Escuché:</p>
                    <p className="text-sm italic">&quot;{transcription}&quot;</p>
                  </div>

                  {/* Datos parseados */}
                  <div className="bg-accent/30 rounded-lg p-3 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Transacción detectada:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Tipo: </span>
                        <span className={parsedData.type === "expense" ? "text-red-500 font-medium" : "text-emerald-500 font-medium"}>
                          {parsedData.type === "expense" ? "Gasto" : "Ingreso"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Monto: </span>
                        <span className="font-medium">
                          {parsedData.amount ? `$${parsedData.amount.toLocaleString()}` : "No detectado"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Categoría: </span>
                        <span className="font-medium">{parsedData.category_name || "No detectada"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cuenta: </span>
                        <span className="font-medium">{parsedData.account_name || accounts[0]?.name || "Default"}</span>
                      </div>
                    </div>
                  </div>

                  {feedback && (
                    <p className="text-xs text-amber-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {feedback}
                    </p>
                  )}

                  {/* Botones de acción */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setState("idle")
                        setTranscription("")
                        setParsedData(null)
                        setFeedback("")
                      }}
                    >
                      Reintentar
                    </Button>
                    <Button
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                      onClick={confirmTransaction}
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                        <>
                          <Check className="h-4 w-4 mr-1" /> Confirmar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Error */}
              {state === "error" && (
                <div className="text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                    <MicOff className="h-6 w-6 text-red-500" />
                  </div>
                  <p className="text-sm text-red-500">{feedback}</p>
                  {transcription && (
                    <div className="bg-accent/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Escuché:</p>
                      <p className="text-sm italic">&quot;{transcription}&quot;</p>
                    </div>
                  )}
                </div>
              )}

              {/* Botón de grabar/detener */}
              <div className="flex justify-center pt-2">
                {state === "recording" ? (
                  <button
                    onClick={stopRecording}
                    className="h-16 w-16 rounded-full bg-red-500 text-white shadow-lg active:scale-95 transition-transform flex items-center justify-center"
                  >
                    <div className="h-6 w-6 rounded-sm bg-white" />
                  </button>
                ) : state !== "processing" ? (
                  <button
                    onClick={startRecording}
                    className="h-16 w-16 rounded-full bg-violet-500 text-white shadow-lg hover:bg-violet-600 active:scale-95 transition-all flex items-center justify-center"
                  >
                    <Mic className="h-7 w-7" />
                  </button>
                ) : null}
              </div>

              {state === "idle" && !transcription && (
                <p className="text-[10px] text-center text-muted-foreground">
                  Por ahora: crear transacciones por voz. Pronto: categorías, cuentas y más.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
