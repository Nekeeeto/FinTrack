"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatMoney } from "@/lib/format"
import {
  Loader2,
  Brain,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Activity,
  Download,
} from "lucide-react"
import { format, startOfMonth, endOfMonth } from "date-fns"

interface Analysis {
  resumen: string
  tendencias: string[]
  alertas: string[]
  consejos: string[]
  score: number
  comparacion: string
}

interface AnalysisResponse {
  analysis: Analysis
  meta: {
    month: string
    income: number
    expenses: number
    net: number
    transactionCount: number
    model: string
    cost_usd: number
  }
}

interface Anomaly {
  category: string
  current: number
  average: number
  ratio: number
  color: string
  severity: "alta" | "media" | "baja"
  message: string
}

interface LargeTransaction {
  id: string
  amount: number
  description: string
  category: string
  date: string
  avgPerTx: number
  ratio: number
}

interface AnomaliesResponse {
  anomalies: Anomaly[]
  largeTransactions: LargeTransaction[]
}

export default function AnalisisPage() {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null)
  const [anomalies, setAnomalies] = useState<AnomaliesResponse | null>(null)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)
  const [loadingAnomalies, setLoadingAnomalies] = useState(false)

  async function runAnalysis() {
    setLoadingAnalysis(true)
    const res = await fetch("/api/analysis")
    const data = await res.json()
    setAnalysis(data)
    setLoadingAnalysis(false)
  }

  async function checkAnomalies() {
    setLoadingAnomalies(true)
    const res = await fetch("/api/analysis/anomalies")
    const data = await res.json()
    setAnomalies(data)
    setLoadingAnomalies(false)
  }

  function handleExport() {
    const now = new Date()
    const from = format(startOfMonth(now), "yyyy-MM-dd")
    const to = format(endOfMonth(now), "yyyy-MM-dd")
    window.open(`/api/export?from=${from}&to=${to}`, "_blank")
  }

  const scoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-500"
    if (score >= 5) return "text-amber-500"
    return "text-red-500"
  }

  const severityColors = {
    alta: "bg-red-500/10 text-red-500 border-red-500/20",
    media: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    baja: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Análisis financiero</h1>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-1" />
          Exportar CSV
        </Button>
      </div>

      {/* Acciones */}
      <div className="grid sm:grid-cols-2 gap-3">
        <Card
          className="cursor-pointer hover:border-emerald-500/50 transition-colors"
          onClick={!loadingAnalysis ? runAnalysis : undefined}
        >
          <CardContent className="py-6 flex items-center gap-4">
            {loadingAnalysis ? (
              <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Brain className="h-5 w-5 text-emerald-500" />
              </div>
            )}
            <div>
              <p className="font-medium">Análisis mensual con IA</p>
              <p className="text-xs text-muted-foreground">
                Resumen inteligente, tendencias y consejos
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-amber-500/50 transition-colors"
          onClick={!loadingAnomalies ? checkAnomalies : undefined}
        >
          <CardContent className="py-6 flex items-center gap-4">
            {loadingAnomalies ? (
              <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
            )}
            <div>
              <p className="font-medium">Detectar gastos inusuales</p>
              <p className="text-xs text-muted-foreground">
                Compara con el promedio de los últimos 3 meses
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resultado del análisis IA */}
      {analysis && (
        <div className="space-y-4">
          {/* Score y resumen */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Análisis de {analysis.meta.month}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Salud financiera
                  </span>
                  <span
                    className={`text-2xl font-bold ${scoreColor(
                      analysis.analysis.score
                    )}`}
                  >
                    {analysis.analysis.score}/10
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">{analysis.analysis.resumen}</p>

              {/* Métricas rápidas */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-emerald-500/10 p-3">
                  <p className="text-xs text-emerald-500">Ingresos</p>
                  <p className="font-bold text-emerald-500">
                    {formatMoney(analysis.meta.income)}
                  </p>
                </div>
                <div className="rounded-lg bg-red-500/10 p-3">
                  <p className="text-xs text-red-500">Gastos</p>
                  <p className="font-bold text-red-500">
                    {formatMoney(analysis.meta.expenses)}
                  </p>
                </div>
                <div
                  className={`rounded-lg p-3 ${
                    analysis.meta.net >= 0
                      ? "bg-emerald-500/10"
                      : "bg-red-500/10"
                  }`}
                >
                  <p
                    className={`text-xs ${
                      analysis.meta.net >= 0
                        ? "text-emerald-500"
                        : "text-red-500"
                    }`}
                  >
                    Neto
                  </p>
                  <p
                    className={`font-bold ${
                      analysis.meta.net >= 0
                        ? "text-emerald-500"
                        : "text-red-500"
                    }`}
                  >
                    {formatMoney(analysis.meta.net)}
                  </p>
                </div>
              </div>

              {/* Comparación */}
              {analysis.analysis.comparacion && (
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    vs mes anterior
                  </p>
                  <p className="text-sm">{analysis.analysis.comparacion}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tendencias */}
          {analysis.analysis.tendencias.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Tendencias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.analysis.tendencias.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Alertas */}
          {analysis.analysis.alertas.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-red-500 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Alertas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.analysis.alertas.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-red-500 mt-0.5">•</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Consejos */}
          {analysis.analysis.consejos.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-amber-500 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Consejos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.analysis.consejos.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-amber-500 mt-0.5">•</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Meta */}
          <p className="text-xs text-muted-foreground text-right">
            Modelo: {analysis.meta.model} — Costo: US$
            {analysis.meta.cost_usd.toFixed(4)} —{" "}
            {analysis.meta.transactionCount} transacciones analizadas
          </p>
        </div>
      )}

      {/* Resultado de anomalías */}
      {anomalies && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Gastos inusuales detectados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {anomalies.anomalies.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No se detectaron gastos inusuales este mes
                </p>
              ) : (
                <div className="space-y-3">
                  {anomalies.anomalies.map((anomaly, i) => (
                    <div
                      key={i}
                      className={`rounded-lg border p-3 ${
                        severityColors[anomaly.severity]
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">
                          {anomaly.category}
                        </span>
                        <span className="text-xs font-medium uppercase">
                          {anomaly.severity}
                        </span>
                      </div>
                      <p className="text-sm">{anomaly.message}</p>
                      <div className="flex gap-4 mt-2 text-xs opacity-80">
                        <span>Este mes: {formatMoney(anomaly.current)}</span>
                        <span>Promedio: {formatMoney(anomaly.average)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transacciones grandes */}
          {anomalies.largeTransactions.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Transacciones inusualmente grandes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {anomalies.largeTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {tx.description || tx.category}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tx.date} — {tx.ratio}x el promedio por transacción
                        </p>
                      </div>
                      <span className="font-bold text-red-500">
                        {formatMoney(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
