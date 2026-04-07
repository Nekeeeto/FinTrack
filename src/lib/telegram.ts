import { getSetting } from "@/lib/settings"

async function getApi() {
  const token = await getSetting("TELEGRAM_BOT_TOKEN")
  return `https://api.telegram.org/bot${token}`
}

async function getToken() {
  return getSetting("TELEGRAM_BOT_TOKEN")
}

// --- Tipos de Telegram ---

export interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
  callback_query?: CallbackQuery
}

export interface TelegramMessage {
  message_id: number
  chat: { id: number }
  from?: { id: number; first_name: string }
  text?: string
  photo?: PhotoSize[]
  date: number
}

export interface CallbackQuery {
  id: string
  from: { id: number; first_name: string }
  message?: TelegramMessage
  data?: string
}

interface PhotoSize {
  file_id: string
  file_unique_id: string
  width: number
  height: number
  file_size?: number
}

export interface InlineKeyboardButton {
  text: string
  callback_data: string
}

// --- Helpers ---

export async function sendMessage(
  chatId: number,
  text: string,
  opts?: {
    reply_markup?: { inline_keyboard: InlineKeyboardButton[][] }
    parse_mode?: "HTML" | "MarkdownV2"
  }
) {
  const api = await getApi()
  const res = await fetch(`${api}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, ...opts }),
  })
  return res.json()
}

export async function editMessageText(
  chatId: number,
  messageId: number,
  text: string,
  opts?: {
    reply_markup?: { inline_keyboard: InlineKeyboardButton[][] }
    parse_mode?: "HTML" | "MarkdownV2"
  }
) {
  const api = await getApi()
  const res = await fetch(`${api}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text,
      ...opts,
    }),
  })
  return res.json()
}

export async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  const api = await getApi()
  await fetch(`${api}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
  })
}

/** Descarga el archivo de una foto de Telegram y devuelve el buffer + mime type */
export async function downloadPhoto(fileId: string): Promise<{ buffer: Buffer; mimeType: string }> {
  const api = await getApi()
  const token = await getToken()

  // Obtener la ruta del archivo
  const fileRes = await fetch(`${api}/getFile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file_id: fileId }),
  })
  const fileData = await fileRes.json()
  const filePath: string = fileData.result.file_path

  // Descargar el archivo
  const downloadUrl = `https://api.telegram.org/file/bot${token}/${filePath}`
  const downloadRes = await fetch(downloadUrl)
  const arrayBuffer = await downloadRes.arrayBuffer()

  const ext = filePath.split(".").pop()?.toLowerCase()
  const mimeType =
    ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg"

  return { buffer: Buffer.from(arrayBuffer), mimeType }
}
