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

    if (!gs1_code) {
      return NextResponse.json({ error: "GS1 code is required" }, { status: 400 })
    }

    // Search for part by GS1 code
    const { data: part, error: partError } = await supabase
      .from("spare_parts")
      .select("*")
      .eq("gs1_code", gs1_code)
      .single()

    let verificationStatus = "unknown"
    let partData = null

    if (!partError && part) {
      verificationStatus = part.is_genuine ? "authentic" : "counterfeit"
      partData = part
    }

    // Log the verification check
    const { data: check, error: checkError } = await supabase
      .from("part_authenticity_checks")
      .insert([
        {
          part_id: part?.id || part_id,
          user_id: user.id,
          gs1_scan_result: {
            gs1_code,
            scanned_at: new Date().toISOString(),
            found_in_database: !!part,
          },
          verification_status: verificationStatus,
        },
      ])
      .select()
      .single()

    if (checkError) throw checkError

    return NextResponse.json({
      verification: check,
      part: partData,
      status: verificationStatus,
      message:
        verificationStatus === "authentic"
          ? "Part verified as genuine"
          : verificationStatus === "counterfeit"
            ? "Warning: Counterfeit part detected"
            : "Part not found in database. Please verify manually.",
    })
  } catch (error) {
    console.error("Error verifying GS1 code:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
