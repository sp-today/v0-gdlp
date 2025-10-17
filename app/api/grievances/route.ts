import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("grievances")
      .select("*")
      .eq("user_id", user.id)
      .order("submitted_date", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching grievances:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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
    const { grievance_type, title, description, device_id, ai_generated_complaint, priority_level } = body

    const { data, error } = await supabase
      .from("grievances")
      .insert([
        {
          user_id: user.id,
          device_id: device_id || null,
          grievance_type,
          title,
          description,
          ai_generated_complaint,
          priority_level: priority_level || "medium",
          grievance_status: "submitted",
        },
      ])
      .select()
      .single()

    if (error) throw error

    // Create notification
    await supabase.from("notifications").insert([
      {
        user_id: user.id,
        notification_type: "grievance_submitted",
        title: "Grievance Submitted",
        message: `Your grievance "${title}" has been submitted successfully`,
        related_entity_id: data.id,
      },
    ])

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error creating grievance:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
