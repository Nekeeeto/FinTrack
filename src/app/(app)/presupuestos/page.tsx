"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatMoney } from "@/lib/format"
import { Loader2, Plus, Trash2, AlertTriangle } from "lucide-react"
import type { BudgetLimit, Category } from "@/types/database"

export default function PresupuestosPage() {
  const [budgets, setBudgets] = useState<BudgetLimit[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form
  const [selectedCategory, setSelectedCategory] = useState("")
  const [amount, setAmount] = useState("")
  const [showForm, setShowForm] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [budgetsRes, categoriesRes] = await Promise.all([
      fetch("/api/budgets"),
      fetch("/api/categories?flat=true"),
    ])
    const budgetsData = await budgetsRes.json()
    const categoriesData = await categoriesRes.json()

    setBudgets(Array.isArray(budgetsData) ? budgetsData : [])
    // Solo categorías padre de tipo expense
    const cats = (categoriesData.data || categoriesData || []).filter(
      (c: Category) => c.type === "expense" && !c.parent_id
    )
    setCategories(cats)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCategory || !amount) return

    setSaving(true)
    await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category_id: selectedCategory,
        amount: parseFloat(amount),
        currency: "UYU",
      }),
    })
    setSaving(false)
    setShowForm(false)
    setSelectedCategory("")
    setAmount("")
    fetchData()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/budgets/${id}`, { method: "DELETE" })
    fetchData()
  }

  // Categorías que ya tienen presupuesto
  const usedCategoryIds = budgets.map((b) => b.category_id)
  const availableCategories = categories.filter(
    (c) => !usedCategoryIds.includes(c.id)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Presupuestos</h1>
        {!showForm && availableCategories.length > 0 && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        )}
      </div>

      {/* Formulario para agregar presupuesto */}
      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Seleccionar categoría...</option>
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Monto límite"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full sm:w-40 rounded-md border border-input bg-background px-3 py-2 text-sm"
                min="1"
                step="100"
                required
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                  Guardar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de presupuestos */}
      {budgets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-2">
              No tenés presupuestos configurados
            </p>
            <p className="text-sm text-muted-foreground">
              Agregá un presupuesto para controlar tus gastos por categoría
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {budgets.map((budget) => {
            const isOver = (budget.percentage || 0) >= 100
            const isWarning =
              (budget.percentage || 0) >= 80 && (budget.percentage || 0) < 100
            const barColor = isOver
              ? "bg-red-500"
              : isWarning
              ? "bg-amber-500"
              : "bg-emerald-500"

            return (
              <Card key={budget.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: budget.category?.color || "#6b7280",
                        }}
                      />
                      <span className="font-medium">
                        {budget.category?.name || "—"}
                      </span>
                      {isOver && (
                        <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Excedido
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {formatMoney(budget.spent || 0)} /{" "}
                        {formatMoney(budget.amount)}
                      </span>
                      <button
                        onClick={() => handleDelete(budget.id)}
                        className="text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${barColor}`}
                      style={{
                        width: `${Math.min(budget.percentage || 0, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-xs text-muted-foreground">
                      {formatMoney(
                        Math.max(budget.amount - (budget.spent || 0), 0)
                      )}{" "}
                      disponible
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        isOver
                          ? "text-red-500"
                          : isWarning
                          ? "text-amber-500"
                          : "text-emerald-500"
                      }`}
                    >
                      {budget.percentage || 0}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
