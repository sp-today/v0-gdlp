import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { gs1_code, part_id } = body

    // Verify part authenticity
    const { data: part, error: partError } = await supabase
      .from("spare_parts")
      .select("*")
      .eq("gs1_code", gs1_code)
      .single()

    if (partError && partError.code !== "PGRST116") throw partError

    const verificationStatus = part ? "authentic" : "unknown"

    // Log the verification check
    const { data, error } = await supabase
      .from("part_authenticity_checks")
      .insert([
        {
          part_id: part?.id || part_id,
          user_id: user.id,
          gs1_scan_result: { gs1_code, scanned_at: new Date().toISOString() },
          verification_status: verificationStatus,
        },
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      verification: data,
      part: part || null,
      status: verificationStatus,
    })
  } catch (error) {
    console.error("Error verifying part:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
