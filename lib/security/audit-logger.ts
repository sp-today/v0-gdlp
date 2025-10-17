import { createClient } from "@/lib/supabase/server"

export type AuditAction =
  | "user_login"
  | "user_logout"
  | "warranty_claim_created"
  | "grievance_submitted"
  | "part_verified"
  | "booking_created"
  | "data_exported"
  | "user_deleted"

export async function logAuditEvent(
  userId: string,
  action: AuditAction,
  details: Record<string, any>,
  ipAddress?: string,
) {
  try {
    const supabase = await createClient()

    await supabase.from("audit_logs").insert({
      user_id: userId,
      action,
      details,
      ip_address: ipAddress,
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Failed to log audit event:", error)
  }
}
