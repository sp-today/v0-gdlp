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
      .from("repair_bookings")
      .select("*, devices(*), repair_centers(*)")
      .eq("user_id", user.id)
      .order("booking_date", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching repair bookings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
