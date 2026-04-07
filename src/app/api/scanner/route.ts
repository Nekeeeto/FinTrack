import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isAuthError } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase/server"
import { processReceiptImage } from "@/lib/ocr"
import type { UserProfile } from "@/types/database"

const FREE_PHOTO_LIMIT = 15

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  try {
    // Obtener perfil del usuario
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("user_id", auth.userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "No se encontró el perfil del usuario" },
        { status: 404 }
      )
    }

    const userProfile = profile as UserProfile
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let photoCount = userProfile.photo_count_month

    // Resetear contador si pasó el mes
    const resetDate = new Date(userProfile.photo_reset_date)
    resetDate.setHours(0, 0, 0, 0)

    if (resetDate < today) {
      photoCount = 0
      const nextReset = new Date(today.getFullYear(), today.getMonth() + 1, 1)
      await supabaseAdmin
        .from("user_profiles")
        .update({
          photo_count_month: 0,
          photo_reset_date: nextReset.toISOString().split("T")[0],
        })
        .eq("user_id", auth.userId)
    }

    // Verificar cuota para plan free
    if (userProfile.plan === "free" && photoCount >= FREE_PHOTO_LIMIT) {
      return NextResponse.json(
        {
          error:
            "Límite de fotos alcanzado. Actualizá a Premium para escaneos ilimitados.",
          quota: { used: photoCount, limit: FREE_PHOTO_LIMIT },
        },
        { status: 403 }
      )
    }

    // Parsear la imagen del form data
    const formData = await req.formData()
    const file = formData.get("image") as File | null

    if (!file) {
      return NextResponse.json(
        { error: "No se envió ninguna imagen" },
        { status: 400 }
      )
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato de imagen no soportado. Usá JPG, PNG o WebP." },
        { status: 400 }
      )
    }

    // Convertir a Buffer y procesar con OCR
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const ocrResult = await processReceiptImage(buffer, file.type, auth.userId)

    // Incrementar contador de fotos
    const newCount = photoCount + 1
    await supabaseAdmin
      .from("user_profiles")
      .update({ photo_count_month: newCount })
      .eq("user_id", auth.userId)

    return NextResponse.json({
      ocr: ocrResult,
      quota: {
        used: newCount,
        limit: userProfile.plan === "free" ? FREE_PHOTO_LIMIT : null,
        plan: userProfile.plan,
      },
    })
  } catch (err) {
    console.error("Error en scanner:", err)
    return NextResponse.json(
      { error: "Error al procesar la imagen" },
      { status: 500 }
    )
  }
}
