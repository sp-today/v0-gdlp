import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin or support
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!["admin", "support"].includes(profile?.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    let query = supabase.from("grievances").select("*", { count: "exact" })

    if (status) {
      query = query.eq("status", status)
    }

    const { data: grievances, count } = await query.range(offset, offset + limit - 1).order("created_at", {
      ascending: false,
    })

    return NextResponse.json({
      grievances,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching grievances:", error)
    return NextResponse.json({ error: "Failed to fetch grievances" }, { status: 500 })
  }
}
