import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RepairCenterFinder } from "@/components/service-connect/repair-center-finder"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, MapPin, CheckCircle } from "lucide-react"

export default async function ServiceConnectPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's repair bookings
  const { data: bookings } = await supabase
    .from("repair_bookings")
    .select("*, devices(*), repair_centers(*)")
    .eq("user_id", user.id)
    .order("booking_date", { ascending: false })
    .limit(3)

  return (
    <main className="flex-1 w-full flex flex-col gap-8 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold">Predictive Service-Connect</h1>
        <p className="text-muted-foreground mt-2">
          Find verified repair centers and get AI-powered timeline predictions
        </p>
      </div>

      {bookings && bookings.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Recent Bookings</h2>
          <div className="grid gap-3">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="font-medium">{booking.devices.device_name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {booking.repair_centers.center_name}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(booking.booking_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        {booking.booking_status}
                      </div>
                      {booking.predicted_completion_date && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Est. completion: {new Date(booking.predicted_completion_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <RepairCenterFinder />
    </main>
  )
}
