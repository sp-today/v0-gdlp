import { getIntegrationStatus } from "@/lib/config/integrations"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const status = getIntegrationStatus()
    return NextResponse.json(status)
  } catch (error) {
    console.error("Error fetching integration status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
