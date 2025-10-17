import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  // For client-side code we must only reference NEXT_PUBLIC_* env vars so
  // Next replaces them at build time. Do not reference server-only envs here.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase NEXT_PUBLIC environment variables")
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
