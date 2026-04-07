"use client"

import { useEffect, useState } from "react"
import { Bell, BellOff, Loader2, CheckCircle2, XCircle, Send } from "lucide-react"

export function PushSettings() {
  const [supported, setSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null)

  useEffect(() => {
    const isSupported = "serviceWorker" in navigator && "PushManager" in window
    setSupported(isSupported)

    if (isSupported) {
      setPermission(Notification.permission)
      // Verificar si ya está suscripto
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setSubscribed(!!sub)
        })
      })
    }
  }, [])

  async function subscribe() {
    setLoading(true)
    try {
      // Pedir permiso
      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== "granted") {
        setLoading(false)
        return
      }

      // Obtener VAPID public key
      const vapidRes = await fetch("/api/push/vapid")
      const { publicKey } = await vapidRes.json()
      if (!publicKey) throw new Error("No VAPID key")

      // Suscribir
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      })

      // Guardar en el servidor
      const subJson = sub.toJSON()
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: subJson.keys,
        }),
      })

      setSubscribed(true)
    } catch (err) {
      console.error("Error subscribing:", err)
    } finally {
      setLoading(false)
    }
  }

  async function unsubscribe() {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setSubscribed(false)
    } catch (err) {
      console.error("Error unsubscribing:", err)
    } finally {
      setLoading(false)
    }
  }

  async function sendTest() {
    setTestResult(null)
    try {
      const res = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "test" }),
      })
      const data = await res.json()
      setTestResult({
        ok: data.ok && data.sent > 0,
        message: data.sent > 0 ? "Notificación enviada" : "No hay suscripciones activas",
      })
    } catch {
      setTestResult({ ok: false, message: "Error enviando" })
    }
  }

  if (!supported) {
    return (
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <BellOff className="h-4 w-4" />
        Tu navegador no soporta notificaciones push.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {subscribed ? (
            <Bell className="h-5 w-5 text-emerald-500" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
          <div>
            <p className="text-sm font-medium">
              {subscribed ? "Notificaciones activadas" : "Notificaciones desactivadas"}
            </p>
            <p className="text-xs text-muted-foreground">
              {permission === "denied"
                ? "Bloqueadas en el navegador. Cambiá los permisos del sitio."
                : subscribed
                  ? "Recibirás avisos cuando el bot procese un ticket."
                  : "Activá para recibir avisos de tickets y resúmenes semanales."}
            </p>
          </div>
        </div>

        <button
          onClick={subscribed ? unsubscribe : subscribe}
          disabled={loading || permission === "denied"}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
            subscribed
              ? "border border-border hover:bg-accent"
              : "bg-emerald-500 text-white hover:bg-emerald-600"
          }`}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : subscribed ? (
            "Desactivar"
          ) : (
            "Activar"
          )}
        </button>
      </div>

      {subscribed && (
        <div className="flex items-center gap-3">
          <button
            onClick={sendTest}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-accent transition-colors"
          >
            <Send className="h-3 w-3" />
            Enviar test
          </button>
          {testResult && (
            <span className={`text-xs flex items-center gap-1 ${testResult.ok ? "text-emerald-500" : "text-red-500"}`}>
              {testResult.ok ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              {testResult.message}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
