import { createClient } from "@/lib/supabase/server"
import { processDocumentWithOCR } from "@/lib/services/ocr-service"
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
    const { document_url, document_id } = body

    if (!document_url) {
      return NextResponse.json({ error: "Document URL is required" }, { status: 400 })
    }

    // Process document with OCR
    const ocrResult = await processDocumentWithOCR(document_url)

    // Update warranty document with OCR results
    if (document_id) {
      await supabase
        .from("warranty_documents")
        .update({
          ocr_extracted_text: ocrResult.text,
          document_status: "verified",
        })
        .eq("id", document_id)
    }

    return NextResponse.json(ocrResult)
  } catch (error) {
    console.error("OCR processing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
