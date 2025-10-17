import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("warranty_documents")
      .select("*, devices(user_id)")
      .eq("id", params.id)
      .single()

    if (error) throw error

    // Verify ownership
    if (data.devices.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching warranty document:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get document to verify ownership
    const { data: doc, error: docError } = await supabase
      .from("warranty_documents")
      .select("*, devices(user_id)")
      .eq("id", params.id)
      .single()

    if (docError) throw docError

    if (doc.devices.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete from storage
    const fileName = doc.document_url.split("/").pop()
    await supabase.storage.from("warranty-documents").remove([`${doc.device_id}/${fileName}`])

    // Delete record
    const { error: deleteError } = await supabase.from("warranty_documents").delete().eq("id", params.id)

    if (deleteError) throw deleteError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting warranty document:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
