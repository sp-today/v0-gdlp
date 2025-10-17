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

    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get("device_id")

    let query = supabase.from("warranty_documents").select("*").order("uploaded_at", { ascending: false })

    if (deviceId) {
      query = query.eq("device_id", deviceId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching warranty documents:", error)
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

    const formData = await request.formData()
    const file = formData.get("file") as File
    const deviceId = formData.get("device_id") as string
    const documentType = formData.get("document_type") as string

    if (!file || !deviceId || !documentType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Upload file to Supabase Storage
    const fileName = `${deviceId}/${documentType}/${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("warranty-documents")
      .upload(fileName, file)

    if (uploadError) throw uploadError

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("warranty-documents").getPublicUrl(fileName)

    // Create warranty document record
    const { data, error } = await supabase
      .from("warranty_documents")
      .insert([
        {
          device_id: deviceId,
          document_type: documentType,
          document_url: publicUrl,
          document_status: "pending",
        },
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error uploading warranty document:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
