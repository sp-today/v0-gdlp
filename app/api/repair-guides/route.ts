import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const deviceType = searchParams.get("device_type")
    const brand = searchParams.get("brand")
    const language = searchParams.get("language") || "en"

    let query = supabase.from("repair_guides").select("*").eq("language", language)

    if (deviceType) query = query.eq("device_type", deviceType)
    if (brand) query = query.eq("brand", brand)

    const { data, error } = await query.order("success_rate", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching repair guides:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
