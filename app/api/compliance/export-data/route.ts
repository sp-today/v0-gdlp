import { createClient } from "@/lib/supabase/server"
import { exportUserData } from "@/lib/compliance/data-privacy"
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

    const userData = await exportUserData(user.id)

    await logAuditEvent(user.id, "data_exported", {
      export_type: "full_user_data",
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json(userData)
  } catch (error) {
    console.error("Error exporting user data:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}
