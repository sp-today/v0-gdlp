import { verifyGS1Code } from "@/lib/services/gs1-verification-service"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gs1_code } = body

    if (!gs1_code) {
      return NextResponse.json({ error: "GS1 code is required" }, { status: 400 })
    }

    const result = await verifyGS1Code(gs1_code)

    return NextResponse.json(result)
  } catch (error) {
    console.error("GS1 verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
