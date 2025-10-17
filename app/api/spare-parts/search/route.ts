import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const partName = searchParams.get("part_name")
    const partNumber = searchParams.get("part_number")
    const deviceType = searchParams.get("device_type")
    const brand = searchParams.get("brand")
    const model = searchParams.get("model")
    const gs1Code = searchParams.get("gs1_code")

    let query = supabase.from("spare_parts").select("*")

    if (partName) query = query.ilike("part_name", `%${partName}%`)
    if (partNumber) query = query.eq("part_number", partNumber)
    if (deviceType) query = query.eq("device_type", deviceType)
    if (brand) query = query.eq("brand", brand)
    if (model) query = query.eq("model", model)
    if (gs1Code) query = query.eq("gs1_code", gs1Code)

    const { data, error } = await query.order("is_genuine", { ascending: false }).limit(50)

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error searching spare parts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
