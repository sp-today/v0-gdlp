import { createClient } from "@/lib/supabase/server"
import { submitToGovernmentPortal } from "@/lib/services/government-portal-service"
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
    const { grievance_id } = body

    // Fetch grievance details
    const { data: grievance, error: grievanceError } = await supabase
      .from("grievances")
      .select("*")
      .eq("id", grievance_id)
      .eq("user_id", user.id)
      .single()

    if (grievanceError) throw grievanceError

    // Fetch user profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    // Submit to government portal
    const portalResult = await submitToGovernmentPortal({
      title: grievance.title,
      description: grievance.description,
      complaint_text: grievance.ai_generated_complaint || grievance.description,
      user_name: profile?.full_name || "Consumer",
      user_email: profile?.email || "",
      user_phone: profile?.phone_number || "",
    })

    // Update grievance with portal reference
    await supabase
      .from("grievances")
      .update({
        government_portal_reference: portalResult.reference_number,
        grievance_status: "acknowledged",
      })
      .eq("id", grievance_id)

    return NextResponse.json(portalResult)
  } catch (error) {
    console.error("Government portal submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
