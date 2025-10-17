import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const deviceType = searchParams.get("device_type")
    const brand = searchParams.get("brand")
    const model = searchParams.get("model")
    const issueCategory = searchParams.get("issue_category")
    const language = searchParams.get("language") || "en"
    const difficultyLevel = searchParams.get("difficulty_level")

    let query = supabase.from("repair_guides").select("*").eq("language", language)

    if (deviceType) query = query.eq("device_type", deviceType)
    if (brand) query = query.eq("brand", brand)
    if (model) query = query.eq("model", model)
    if (issueCategory) query = query.eq("issue_category", issueCategory)
    if (difficultyLevel) query = query.eq("difficulty_level", difficultyLevel)

    const { data, error } = await query.order("success_rate", { ascending: false }).limit(20)

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error searching repair guides:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
