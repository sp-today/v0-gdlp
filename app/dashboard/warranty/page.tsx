import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { WarrantyVault } from "@/components/warranty/warranty-vault"
import { WarrantyClaims } from "@/components/warranty/warranty-claims"

export default async function WarrantyPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: devices, error: devicesError } = await supabase
    .from("devices")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (devicesError) {
    throw devicesError
  }

  return (
    <main className="flex-1 w-full flex flex-col gap-8 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold">Warranty Guardian</h1>
        <p className="text-muted-foreground mt-2">Manage your device warranties, documents, and claims in one place</p>
      </div>

      {devices && devices.length > 0 ? (
        <div className="space-y-8">
          {devices.map((device) => (
            <div key={device.id} className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{device.device_name}</CardTitle>
                      <CardDescription>
                        {device.brand} {device.model}
                      </CardDescription>
                    </div>
                    <Link href={`/dashboard/devices/${device.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Warranty Type</p>
                      <p className="font-medium capitalize">{device.warranty_type || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Warranty Expires</p>
                      <p className="font-medium">
                        {device.warranty_end_date
                          ? new Date(device.warranty_end_date).toLocaleDateString()
                          : "Not specified"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <WarrantyVault device={device} />
              <WarrantyClaims device={device} />
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No devices registered yet</p>
              <Link href="/dashboard/devices">
                <Button>Add Your First Device</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
