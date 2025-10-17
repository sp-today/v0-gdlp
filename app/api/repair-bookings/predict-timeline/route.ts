import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { issue_category, device_type, repair_center_id } = body

    // Get repair center info
    const { data: center, error: centerError } = await supabase
      .from("repair_centers")
      .select("*")
      .eq("id", repair_center_id)
      .single()

    if (centerError) throw centerError

    // Predict completion time based on issue category and device type
    const prediction = predictRepairTimeline(issue_category, device_type, center)

    return NextResponse.json(prediction)
  } catch (error) {
    console.error("Error predicting timeline:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function predictRepairTimeline(
  issueCategory: string,
  deviceType: string,
  center: any,
): {
  estimated_days: number
  estimated_cost_range: { min: number; max: number }
  confidence: number
  factors: string[]
} {
  // ML-based prediction logic (simplified)
  const baseTimeline: Record<string, number> = {
    battery: 1,
    screen: 2,
    charging: 1,
    software: 0.5,
    hardware: 3,
    connectivity: 1,
    performance: 1,
    audio: 1,
  }

  const deviceMultiplier: Record<string, number> = {
    smartphone: 1,
    laptop: 1.5,
    tablet: 1.2,
    smartwatch: 0.8,
    headphones: 0.5,
    camera: 1.3,
  }

  const baseDays = baseTimeline[issueCategory] || 2
  const multiplier = deviceMultiplier[deviceType] || 1
  const estimatedDays = Math.ceil(baseDays * multiplier)

  // Cost estimation
  const baseCost: Record<string, { min: number; max: number }> = {
    battery: { min: 1500, max: 3000 },
    screen: { min: 5000, max: 15000 },
    charging: { min: 1000, max: 2500 },
    software: { min: 500, max: 1500 },
    hardware: { min: 3000, max: 10000 },
    connectivity: { min: 1000, max: 3000 },
    performance: { min: 1000, max: 2500 },
    audio: { min: 1000, max: 3000 },
  }

  const costRange = baseCost[issueCategory] || { min: 2000, max: 5000 }

  const factors = [
    `${deviceType} repair typically takes ${estimatedDays} day(s)`,
    `${center.center_name} has ${center.total_reviews} verified reviews`,
    `Average rating: ${center.rating || "N/A"}/5`,
  ]

  return {
    estimated_days: estimatedDays,
    estimated_cost_range: costRange,
    confidence: 0.85,
    factors,
  }
}
