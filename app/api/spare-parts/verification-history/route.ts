import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("part_authenticity_checks")
      .select("*, spare_parts(part_name, part_number, brand, model)")
      .eq("user_id", user.id)
      .order("checked_at", { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching verification history:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
