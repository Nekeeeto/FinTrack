import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import { getSetting } from "@/lib/settings"
import {
  sendMessage,
  editMessageText,
  answerCallbackQuery,
  downloadPhoto,
  type TelegramUpdate,
  type InlineKeyboardButton,
} from "@/lib/telegram"
import { processReceiptImage, type OCRResult } from "@/lib/ocr"
import {
  inferCategory,
  getDefaultAccount,
  getAllCategories,
  getAllAccounts,
} from "@/lib/categorize"

// --- Persistencia en Supabase (tabla pending_receipts) ---

interface PendingData {
  ocr: OCRResult
  categoryId: string
  accountId: string
}

async function savePending(chatId: number, msgId: number, data: PendingData) {
  const key = `${chatId}:${msgId}`
  await supabaseAdmin
    .from("pending_receipts")
    .upsert({ key, chat_id: chatId, message_id: msgId, data, created_at: new Date().toISOString() }, { onConflict: "key" })
}

async function getPending(chatId: number, msgId: number): Promise<PendingData | null> {
  const key = `${chatId}:${msgId}`
  const { data } = await supabaseAdmin
    .from("pending_receipts")
    .select("data")
    .eq("key", key)
    .single()
  return data?.data ?? null
}

async function deletePending(chatId: number, msgId: number) {
  const key = `${chatId}:${msgId}`
  await supabaseAdmin.from("pending_receipts").delete().eq("key", key)
}

async function updatePending(chatId: number, msgId: number, updates: Partial<PendingData>) {
  const existing = await getPending(chatId, msgId)
  if (!existing) return null
  const updated = { ...existing, ...updates }
  await savePending(chatId, msgId, updated)
  return updated
}

// --- Webhook handler ---

export async function POST(req: NextRequest) {
  // Verificar secret
  const webhookSecret = await getSetting("TELEGRAM_WEBHOOK_SECRET")
  const secret = req.headers.get("x-telegram-bot-api-secret-token")
  if (webhookSecret && secret !== webhookSecret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const update: TelegramUpdate = await req.json()

  try {
    if (update.callback_query) {
      await handleCallback(update.callback_query)
    } else if (update.message?.photo) {
      await handlePhoto(update.message)
    } else if (update.message?.text) {
      await handleText(update.message)
    }
  } catch (err) {
    console.error("Error en webhook de Telegram:", err)
  }

  return NextResponse.json({ ok: true })
}

// --- Manejo de fotos (ticket/boleta) ---

async function handlePhoto(msg: TelegramUpdate["message"] & {}) {
  const chatId = msg.chat.id
  const photos = msg.photo!
  const bestPhoto = photos[photos.length - 1]

  await sendMessage(chatId, "📸 Procesando tu ticket...")

  try {
    const { buffer, mimeType } = await downloadPhoto(bestPhoto.file_id)
    const ocr = await processReceiptImage(buffer, mimeType)

    if (!ocr.monto && ocr.confianza === "baja" && ocr.texto_raw.includes("no parece")) {
      await sendMessage(
        chatId,
        "🤔 Eso no parece ser un ticket o boleta. Mandame una foto de un ticket de compra y lo proceso."
      )
      return
    }

    const category = await inferCategory(ocr.comercio, ocr.items)
    const account = await getDefaultAccount()

    if (!account) {
      await sendMessage(chatId, "⚠️ No encontré la cuenta GENERAL. Revisá la configuración.")
      return
    }

    const categoryId = category?.id ?? ""
    const categoryName = category?.name ?? "Sin categoría"

    const summary = buildSummary(ocr, categoryName, account.name)
    const keyboard = buildConfirmKeyboard()

    const result = await sendMessage(chatId, summary, {
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: keyboard },
    })

    if (result.ok) {
      const botMsgId = result.result.message_id
      await savePending(chatId, botMsgId, {
        ocr,
        categoryId,
        accountId: account.id,
      })
    }
  } catch (err) {
    console.error("Error procesando foto:", err)
    await sendMessage(
      chatId,
      "❌ Hubo un error procesando la imagen. Intentá de nuevo o mandá otra foto."
    )
  }
}

// --- Manejo de texto ---

async function handleText(msg: TelegramUpdate["message"] & {}) {
  const chatId = msg.chat.id
  const text = msg.text!.trim()

  if (text === "/start") {
    await sendMessage(
      chatId,
      "👋 ¡Hola! Soy tu bot de finanzas.\n\n" +
        "📸 Mandame una foto de un ticket o boleta y lo proceso automáticamente.\n\n" +
        "Voy a extraer el monto, comercio y categoría, y vos confirmás antes de guardar."
    )
    return
  }

  if (text === "/help") {
    await sendMessage(
      chatId,
      "📋 <b>Comandos disponibles:</b>\n\n" +
        "/start — Iniciar el bot\n" +
        "/help — Ver esta ayuda\n\n" +
        "📸 Mandá una foto de un ticket para registrar un gasto.",
      { parse_mode: "HTML" }
    )
    return
  }

  await sendMessage(
    chatId,
    "📸 Mandame una foto de un ticket o boleta y lo proceso.\n\nSi necesitás ayuda: /help"
  )
}

// --- Manejo de callbacks (botones inline) ---

async function handleCallback(cb: NonNullable<TelegramUpdate["callback_query"]>) {
  const chatId = cb.message?.chat.id
  const msgId = cb.message?.message_id
  if (!chatId || !msgId) return

  const data = cb.data ?? ""
  const pending = await getPending(chatId, msgId)

  // --- CONFIRMAR guardado ---
  if (data === "confirm") {
    if (!pending) {
      await answerCallbackQuery(cb.id, "⚠️ Datos expirados, mandá la foto de nuevo.")
      return
    }
    if (!pending.categoryId) {
      await answerCallbackQuery(cb.id, "⚠️ Elegí una categoría primero.")
      return
    }

    await answerCallbackQuery(cb.id, "Guardando...")
    await saveTransaction(chatId, msgId, pending)
    await deletePending(chatId, msgId)
    return
  }

  // --- CANCELAR ---
  if (data === "cancel") {
    await deletePending(chatId, msgId)
    await answerCallbackQuery(cb.id, "Cancelado")
    await editMessageText(chatId, msgId, "❌ Operación cancelada.")
    return
  }

  // --- Cambiar categoría: mostrar lista ---
  if (data === "change_cat") {
    const categories = await getAllCategories()
    const keyboard: InlineKeyboardButton[][] = []
    for (let i = 0; i < categories.length; i += 2) {
      const row: InlineKeyboardButton[] = [
        { text: categories[i].name, callback_data: `set_cat:${categories[i].id}` },
      ]
      if (categories[i + 1]) {
        row.push({
          text: categories[i + 1].name,
          callback_data: `set_cat:${categories[i + 1].id}`,
        })
      }
      keyboard.push(row)
    }
    keyboard.push([{ text: "⬅️ Volver", callback_data: "back" }])

    await answerCallbackQuery(cb.id)
    await editMessageText(chatId, msgId, "Elegí la categoría:", {
      reply_markup: { inline_keyboard: keyboard },
    })
    return
  }

  // --- Seleccionar categoría ---
  if (data.startsWith("set_cat:")) {
    if (!pending) {
      await answerCallbackQuery(cb.id, "⚠️ Datos expirados.")
      return
    }
    const newCatId = data.replace("set_cat:", "")
    await updatePending(chatId, msgId, { categoryId: newCatId })

    const { data: cat } = await supabaseAdmin
      .from("categories")
      .select("name")
      .eq("id", newCatId)
      .single()

    await answerCallbackQuery(cb.id, `Categoría: ${cat?.name ?? "?"}`)
    const updated = await getPending(chatId, msgId)
    if (updated) await showUpdatedSummary(chatId, msgId, updated)
    return
  }

  // --- Cambiar cuenta: mostrar lista ---
  if (data === "change_acc") {
    const accounts = await getAllAccounts()
    const keyboard: InlineKeyboardButton[][] = accounts.map((a) => [
      { text: `${a.name} (${a.currency})`, callback_data: `set_acc:${a.id}` },
    ])
    keyboard.push([{ text: "⬅️ Volver", callback_data: "back" }])

    await answerCallbackQuery(cb.id)
    await editMessageText(chatId, msgId, "Elegí la cuenta:", {
      reply_markup: { inline_keyboard: keyboard },
    })
    return
  }

  // --- Seleccionar cuenta ---
  if (data.startsWith("set_acc:")) {
    if (!pending) {
      await answerCallbackQuery(cb.id, "⚠️ Datos expirados.")
      return
    }
    const newAccId = data.replace("set_acc:", "")
    await updatePending(chatId, msgId, { accountId: newAccId })

    const { data: acc } = await supabaseAdmin
      .from("accounts")
      .select("name")
      .eq("id", newAccId)
      .single()

    await answerCallbackQuery(cb.id, `Cuenta: ${acc?.name ?? "?"}`)
    const updated = await getPending(chatId, msgId)
    if (updated) await showUpdatedSummary(chatId, msgId, updated)
    return
  }

  // --- Volver al resumen ---
  if (data === "back") {
    if (!pending) {
      await answerCallbackQuery(cb.id, "⚠️ Datos expirados.")
      return
    }
    await answerCallbackQuery(cb.id)
    await showUpdatedSummary(chatId, msgId, pending)
    return
  }
}

// --- Helpers ---

function buildSummary(ocr: OCRResult, categoryName: string, accountName: string): string {
  const montoStr = ocr.monto != null
    ? `${ocr.moneda === "USD" ? "US$" : "$"} ${ocr.monto.toLocaleString("es-UY")}`
    : "⚠️ No detectado"

  const lines = [
    `<b>🧾 Ticket procesado</b>`,
    ``,
    `<b>Monto:</b> ${montoStr}`,
    `<b>Comercio:</b> ${ocr.comercio ?? "No detectado"}`,
    `<b>Fecha:</b> ${ocr.fecha ?? "Hoy"}`,
    `<b>Categoría:</b> ${categoryName}`,
    `<b>Cuenta:</b> ${accountName}`,
  ]

  if (ocr.items.length > 0) {
    lines.push(`<b>Ítems:</b> ${ocr.items.slice(0, 5).join(", ")}`)
  }

  if (ocr.confianza === "baja") {
    lines.push(`\n⚠️ <i>Confianza baja — revisá los datos antes de confirmar.</i>`)
  }

  return lines.join("\n")
}

function buildConfirmKeyboard(): InlineKeyboardButton[][] {
  return [
    [
      { text: "✏️ Categoría", callback_data: "change_cat" },
      { text: "🏦 Cuenta", callback_data: "change_acc" },
    ],
    [
      { text: "✅ Confirmar", callback_data: "confirm" },
      { text: "❌ Cancelar", callback_data: "cancel" },
    ],
  ]
}

async function showUpdatedSummary(chatId: number, msgId: number, pending: PendingData) {
  const [catRes, accRes] = await Promise.all([
    pending.categoryId
      ? supabaseAdmin.from("categories").select("name").eq("id", pending.categoryId).single()
      : Promise.resolve({ data: null }),
    supabaseAdmin.from("accounts").select("name").eq("id", pending.accountId).single(),
  ])

  const catName = catRes.data?.name ?? "Sin categoría"
  const accName = accRes.data?.name ?? "?"

  const summary = buildSummary(pending.ocr, catName, accName)
  const keyboard = buildConfirmKeyboard()

  await editMessageText(chatId, msgId, summary, {
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: keyboard },
  })
}

async function saveTransaction(chatId: number, msgId: number, pending: PendingData) {
  const { ocr, categoryId, accountId } = pending

  if (!ocr.monto) {
    await editMessageText(
      chatId,
      msgId,
      "⚠️ No se pudo detectar el monto. No se guardó la transacción."
    )
    return
  }

  const today = new Date().toISOString().split("T")[0]

  const { data: tx, error } = await supabaseAdmin
    .from("transactions")
    .insert({
      account_id: accountId,
      category_id: categoryId,
      amount: ocr.monto,
      currency: ocr.moneda,
      description: ocr.comercio ?? "Ticket escaneado",
      date: ocr.fecha ?? today,
      source: "telegram" as const,
      raw_ocr_data: ocr as unknown as Record<string, unknown>,
    })
    .select("*, account:accounts(*), category:categories(*)")
    .single()

  if (error) {
    console.error("Error guardando transacción:", error)
    await editMessageText(chatId, msgId, "❌ Error al guardar. Intentá de nuevo.")
    return
  }

  // Actualizar balance de la cuenta
  const { data: category } = await supabaseAdmin
    .from("categories")
    .select("type")
    .eq("id", categoryId)
    .single()

  const balanceChange = category?.type === "income" ? ocr.monto : -ocr.monto

  await supabaseAdmin.rpc("update_account_balance", {
    p_account_id: accountId,
    p_amount: balanceChange,
  }).then(async (res) => {
    if (res.error) {
      const { data: account } = await supabaseAdmin
        .from("accounts")
        .select("balance")
        .eq("id", accountId)
        .single()
      if (account) {
        await supabaseAdmin
          .from("accounts")
          .update({ balance: Number(account.balance) + balanceChange })
          .eq("id", accountId)
      }
    }
  })

  const montoStr = `${ocr.moneda === "USD" ? "US$" : "$"} ${ocr.monto.toLocaleString("es-UY")}`
  await editMessageText(
    chatId,
    msgId,
    `✅ <b>Gasto guardado</b>\n\n` +
      `<b>${montoStr}</b> — ${ocr.comercio ?? "Ticket"}\n` +
      `📁 ${tx.category?.name ?? "?"} · 🏦 ${tx.account?.name ?? "?"}`,
    { parse_mode: "HTML" }
  )
}
