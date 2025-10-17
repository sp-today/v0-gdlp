import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { RepairGuideViewer } from "@/components/repair-hub/repair-guide-viewer"

export default async function RepairGuidePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  return (
    <main className="flex-1 w-full flex flex-col gap-8 px-4 py-8">
      <Link href="/dashboard/repair-hub">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Guides
        </Button>
      </Link>

      <RepairGuideViewer guideId={params.id} />
    </main>
  )
}
