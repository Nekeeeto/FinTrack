"use client"

import { useEffect, useState } from "react"
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getIcon } from "@/lib/icons"
import type { Category } from "@/types/database"

interface CategoryTree extends Category {
  subcategories: Category[]
}

export default function CategoriasPage() {
  const [categories, setCategories] = useState<CategoryTree[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [editCat, setEditCat] = useState<Category | null>(null)
  const [newParentId, setNewParentId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    const res = await fetch("/api/categories")
    const data = await res.json()
    setCategories(data ?? [])
    setLoading(false)
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function openNew(parentId: string | null) {
    setEditCat(null)
    setNewParentId(parentId)
    setModalOpen(true)
  }

  function openEdit(cat: Category) {
    setEditCat(cat)
    setNewParentId(cat.parent_id)
    setModalOpen(true)
  }

  async function handleDelete(id: string) {
    setDeleteError("")
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" })
    if (!res.ok) {
      const data = await res.json()
      setDeleteError(data.error ?? "Error al eliminar")
      return
    }
    fetchCategories()
  }

  function handleSaved() {
    setModalOpen(false)
    setEditCat(null)
    fetchCategories()
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <Button onClick={() => openNew(null)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Nueva categoría
        </Button>
      </div>

      {deleteError && (
        <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm flex items-center justify-between">
          {deleteError}
          <button onClick={() => setDeleteError("")}><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="space-y-1">
        {categories.map((parent) => {
          const Icon = getIcon(parent.icon)
          const isExpanded = expanded.has(parent.id)
          const hasSubs = parent.subcategories.length > 0

          return (
            <div key={parent.id}>
              {/* Categoría padre */}
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors group">
                <button
                  onClick={() => toggleExpand(parent.id)}
                  className="p-0.5 text-muted-foreground"
                >
                  {hasSubs ? (
                    isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                  ) : <div className="w-4" />}
                </button>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: parent.color + "20" }}
                >
                  <Icon className="h-4 w-4" style={{ color: parent.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{parent.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {parent.type === "income" ? "Ingreso" : "Gasto"} · {parent.subcategories.length} sub
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openNew(parent.id)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground" title="Agregar subcategoría">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => openEdit(parent)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(parent.id)} className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Subcategorías */}
              {isExpanded && parent.subcategories.map((sub) => {
                const SubIcon = getIcon(sub.icon)
                return (
                  <div key={sub.id} className="flex items-center gap-2 pl-12 pr-3 py-2 rounded-lg hover:bg-accent/50 transition-colors group">
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: sub.color + "15" }}
                    >
                      <SubIcon className="h-3.5 w-3.5" style={{ color: sub.color }} />
                    </div>
                    <p className="flex-1 text-sm">{sub.name}</p>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(sub)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(sub.id)} className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {modalOpen && (
        <CategoryModal
          category={editCat}
          parentId={newParentId}
          parents={categories}
          onClose={() => { setModalOpen(false); setEditCat(null) }}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}

// --- Modal de categoría ---

function CategoryModal({
  category,
  parentId,
  parents,
  onClose,
  onSaved,
}: {
  category: Category | null
  parentId: string | null
  parents: CategoryTree[]
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = !!category
  const [name, setName] = useState(category?.name ?? "")
  const [color, setColor] = useState(category?.color ?? "#6b7280")
  const [icon, setIcon] = useState(category?.icon ?? "tag")
  const [type, setType] = useState<"expense" | "income">(category?.type ?? "expense")
  const [parent, setParent] = useState(category?.parent_id ?? parentId ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setSaving(true)
    const body = {
      name: name.trim(),
      color,
      icon,
      type,
      parent_id: parent || null,
    }

    try {
      const url = isEdit ? `/api/categories/${category.id}` : "/api/categories"
      const method = isEdit ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error?.toString() ?? "Error")
        return
      }
      onSaved()
    } catch {
      setError("Error de conexión")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-xl border border-border shadow-xl w-full max-w-sm mx-4 p-6">
        <h2 className="font-semibold text-lg mb-4">
          {isEdit ? "Editar categoría" : parentId ? "Nueva subcategoría" : "Nueva categoría"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Nombre *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer" />
                <input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="flex-1 px-2 py-1 text-xs rounded border border-border bg-background font-mono" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Ícono</label>
              <input type="text" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="tag" className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background" />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Tipo</label>
            <select value={type} onChange={(e) => setType(e.target.value as "expense" | "income")} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background">
              <option value="expense">Gasto</option>
              <option value="income">Ingreso</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Categoría padre</label>
            <select value={parent} onChange={(e) => setParent(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background">
              <option value="">Ninguna (categoría principal)</option>
              {parents.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? "Guardar" : "Crear"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
