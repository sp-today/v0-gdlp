import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RepairGuideSearch } from "@/components/repair-hub/repair-guide-search"

export default async function RepairHubPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  return (
    <main className="flex-1 w-full flex flex-col gap-8 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold">Vernacular Fix Hub</h1>
        <p className="text-muted-foreground mt-2">
          Learn how to fix your devices with step-by-step guides in 10+ Indian languages
        </p>
      </div>

      <RepairGuideSearch />
    </main>
  )
}
