import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { GS1Scanner } from "@/components/parts/gs1-scanner"
import { VerificationHistory } from "@/components/parts/verification-history"

export default async function PartsAuthenticityPage() {
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
        <h1 className="text-3xl font-bold">Part Authenticity Network</h1>
        <p className="text-muted-foreground mt-2">
          Verify spare parts using GS1 codes to ensure you get genuine components
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GS1Scanner />
        </div>

        <div>
          <VerificationHistory />
        </div>
      </div>
    </main>
  )
}
