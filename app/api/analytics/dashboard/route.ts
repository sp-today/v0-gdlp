import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get key metrics
    const [
      { count: totalUsers },
      { count: totalDevices },
      { count: totalClaims },
      { count: totalGrievances },
      { count: totalBookings },
      { data: claimsByStatus },
      { data: grievancesByStatus },
      { data: recentClaims },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("devices").select("*", { count: "exact", head: true }),
      supabase.from("warranty_claims").select("*", { count: "exact", head: true }),
      supabase.from("grievances").select("*", { count: "exact", head: true }),
      supabase.from("repair_bookings").select("*", { count: "exact", head: true }),
      supabase.rpc("get_claims_by_status"),
      supabase.rpc("get_grievances_by_status"),
      supabase.from("warranty_claims").select("*").order("created_at", { ascending: false }).limit(10),
    ])

    return NextResponse.json({
      metrics: {
        totalUsers: totalUsers || 0,
        totalDevices: totalDevices || 0,
        totalClaims: totalClaims || 0,
        totalGrievances: totalGrievances || 0,
        totalBookings: totalBookings || 0,
      },
      claimsByStatus: claimsByStatus || [],
      grievancesByStatus: grievancesByStatus || [],
      recentClaims: recentClaims || [],
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
