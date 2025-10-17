import { translateText } from "@/lib/services/translation-service"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, target_language, source_language = "en" } = body

    if (!text || !target_language) {
      return NextResponse.json({ error: "Text and target language are required" }, { status: 400 })
    }

    const result = await translateText(text, target_language, source_language)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Translation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
