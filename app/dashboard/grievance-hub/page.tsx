import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { GrievanceForm } from "@/components/grievance/grievance-form"
import { GrievanceTracker } from "@/components/grievance/grievance-tracker"

export default async function GrievanceHubPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's devices
  const { data: devices } = await supabase.from("devices").select("*").eq("user_id", user.id)

  return (
    <main className="flex-1 w-full flex flex-col gap-8 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold">Grievance Automation Hub</h1>
        <p className="text-muted-foreground mt-2">
          File formal complaints with AI-powered assistance and track their status
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GrievanceForm devices={devices || []} />
        </div>

        <div>
          <GrievanceTracker />
        </div>
      </div>
    </main>
  )
}
