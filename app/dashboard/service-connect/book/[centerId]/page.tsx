import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { BookingForm } from "@/components/service-connect/booking-form"
import { Card, CardContent } from "@/components/ui/card"

export default async function BookRepairPage({ params }: { params: { centerId: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch repair center
  const { data: center, error: centerError } = await supabase
    .from("repair_centers")
    .select("*")
    .eq("id", params.centerId)
    .single()

  if (centerError || !center) {
    return (
      <main className="flex-1 w-full flex flex-col gap-8 px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-600">Repair center not found</p>
          </CardContent>
        </Card>
      </main>
    )
  }

  // Fetch user's devices
  const { data: devices } = await supabase.from("devices").select("*").eq("user_id", user.id)

  return (
    <main className="flex-1 w-full flex flex-col gap-8 px-4 py-8">
      <Link href="/dashboard/service-connect">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Service Connect
        </Button>
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {devices && devices.length > 0 ? (
            <div className="space-y-6">
              {devices.map((device) => (
                <BookingForm key={device.id} device={device} repairCenter={center} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No devices registered yet</p>
                  <Link href="/dashboard/devices">
                    <Button>Add Your First Device</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardContent className="pt-6 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Repair Center</p>
                <p className="font-semibold">{center.center_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{center.location}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{center.phone_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-sm break-all">{center.email}</p>
              </div>
              {center.rating && (
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="font-medium">
                    {center.rating}/5 ({center.total_reviews} reviews)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
