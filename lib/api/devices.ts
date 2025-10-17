import { createClient } from "@/lib/supabase/server"
import type { Device } from "@/lib/types/database"

export async function getUserDevices(userId: string): Promise<Device[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("devices")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getDeviceById(deviceId: string): Promise<Device | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("devices").select("*").eq("id", deviceId).single()

  if (error && error.code !== "PGRST116") throw error
  return data || null
}

export async function createDevice(
  userId: string,
  device: Omit<Device, "id" | "created_at" | "updated_at">,
): Promise<Device> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("devices")
    .insert([{ ...device, user_id: userId }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateDevice(deviceId: string, updates: Partial<Device>): Promise<Device> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("devices").update(updates).eq("id", deviceId).select().single()

  if (error) throw error
  return data
}
