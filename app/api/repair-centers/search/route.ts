import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const latitude = searchParams.get("latitude")
    const longitude = searchParams.get("longitude")
    const radius = Number.parseInt(searchParams.get("radius") || "10") // km
    const specialization = searchParams.get("specialization")
    const minRating = Number.parseFloat(searchParams.get("min_rating") || "0")

    let query = supabase
      .from("repair_centers")
      .select("*")
      .eq("is_verified", true)
      .gte("rating", minRating)
      .order("rating", { ascending: false })

    if (specialization) {
      query = query.contains("specializations", [specialization])
    }

    const { data, error } = await query.limit(20)

    if (error) throw error

    // Filter by distance if coordinates provided
    let filteredData = data
    if (latitude && longitude) {
      const lat = Number.parseFloat(latitude)
      const lon = Number.parseFloat(longitude)

      filteredData = data.filter((center) => {
        if (!center.latitude || !center.longitude) return false

        const distance = calculateDistance(lat, lon, center.latitude, center.longitude)
        return distance <= radius
      })
    }

    return NextResponse.json(filteredData)
  } catch (error) {
    console.error("Error searching repair centers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
