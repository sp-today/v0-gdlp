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
    const { device_id, repair_center_id, booking_date, booking_time, issue_description, estimated_cost } = body

    // Predict completion date
    const { data: device, error: deviceError } = await supabase.from("devices").select("*").eq("id", device_id).single()

    if (deviceError) throw deviceError

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from("repair_bookings")
      .insert([
        {
          device_id,
          user_id: user.id,
          repair_center_id,
          booking_date,
          booking_time,
          issue_description,
          estimated_cost,
          booking_status: "scheduled",
          predicted_completion_date: new Date(new Date(booking_date).getTime() + 2 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        },
      ])
      .select()
      .single()

    if (bookingError) throw bookingError

    // Create notification
    await supabase.from("notifications").insert([
      {
        user_id: user.id,
        notification_type: "booking_confirmed",
        title: "Repair Booking Confirmed",
        message: `Your repair booking has been confirmed for ${booking_date}`,
        related_entity_id: booking.id,
      },
    ])

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error("Error creating repair booking:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
