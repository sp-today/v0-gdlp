import { createClient } from "@/lib/supabase/server"
import { anonymizeUserData } from "@/lib/compliance/data-privacy"
import { logAuditEvent } from "@/lib/security/audit-logger"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Anonymize user data
    await anonymizeUserData(user.id)

    // Log the deletion
    await logAuditEvent(user.id, "user_deleted", {
      deletion_type: "user_requested",
      timestamp: new Date().toISOString(),
    })

    // Delete auth user
    await supabase.auth.admin.deleteUser(user.id)

    return NextResponse.json({ success: true, message: "Account deleted successfully" })
  } catch (error) {
    console.error("Error deleting account:", error)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}
