import { createClient } from "@/lib/supabase/server"

export async function anonymizeUserData(userId: string) {
  const supabase = await createClient()

  // Update user profile to remove personal information
  await supabase
    .from("profiles")
    .update({
      full_name: "Deleted User",
      phone: null,
      address: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  // Archive warranty documents
  await supabase.from("warranty_documents").update({ is_archived: true }).eq("user_id", userId)

  // Archive repair bookings
  await supabase.from("repair_bookings").update({ is_archived: true }).eq("user_id", userId)
}

export async function exportUserData(userId: string) {
  const supabase = await createClient()

  const [profile, devices, warranties, claims, grievances] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("devices").select("*").eq("user_id", userId),
    supabase.from("warranty_documents").select("*").eq("user_id", userId),
    supabase.from("warranty_claims").select("*").eq("user_id", userId),
    supabase.from("grievances").select("*").eq("user_id", userId),
  ])

  return {
    profile: profile.data,
    devices: devices.data,
    warranties: warranties.data,
    claims: claims.data,
    grievances: grievances.data,
    exportedAt: new Date().toISOString(),
  }
}
