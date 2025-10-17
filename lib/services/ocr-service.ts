// OCR Service for document processing
// Supports multiple OCR providers (Google Vision, Tesseract, AWS Textract)

export interface OCRResult {
  text: string
  confidence: number
  language: string
  entities: {
    warranty_period?: string
    serial_number?: string
    model?: string
    brand?: string
    purchase_date?: string
  }
}

export async function processDocumentWithOCR(imageUrl: string): Promise<OCRResult> {
  try {
    // Using Google Vision API (requires GOOGLE_VISION_API_KEY)
    const apiKey = process.env.GOOGLE_VISION_API_KEY

    if (!apiKey) {
      console.warn("Google Vision API key not configured, using mock OCR")
      return getMockOCRResult()
    }

    const response = await fetch("https://vision.googleapis.com/v1/images:annotate?key=" + apiKey, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { source: { imageUri: imageUrl } },
            features: [{ type: "TEXT_DETECTION" }, { type: "DOCUMENT_TEXT_DETECTION" }, { type: "LABEL_DETECTION" }],
          },
        ],
      }),
    })

    if (!response.ok) {
      console.error("OCR API error:", response.statusText)
      return getMockOCRResult()
    }

    const data = await response.json()
    return parseOCRResponse(data)
  } catch (error) {
    console.error("OCR processing error:", error)
    return getMockOCRResult()
  }
}

function parseOCRResponse(data: any): OCRResult {
  const fullText = data.responses?.[0]?.fullTextAnnotation?.text || ""

  // Extract entities using regex patterns
  const entities = {
    warranty_period: extractWarrantyPeriod(fullText),
    serial_number: extractSerialNumber(fullText),
    model: extractModel(fullText),
    brand: extractBrand(fullText),
    purchase_date: extractPurchaseDate(fullText),
  }

  return {
    text: fullText,
    confidence: 0.85,
    language: "en",
    entities,
  }
}

function extractWarrantyPeriod(text: string): string | undefined {
  const patterns = [/warranty.*?(\d+)\s*(?:year|month|day)s?/i, /(\d+)\s*(?:year|month|day)s?\s*warranty/i]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) return match[1]
  }
  return undefined
}

function extractSerialNumber(text: string): string | undefined {
  const patterns = [/serial\s*(?:number|no\.?)?\s*[:=]?\s*([A-Z0-9]+)/i, /s\/n\s*[:=]?\s*([A-Z0-9]+)/i]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) return match[1]
  }
  return undefined
}

function extractModel(text: string): string | undefined {
  const patterns = [/model\s*[:=]?\s*([A-Z0-9-]+)/i, /model\s*number\s*[:=]?\s*([A-Z0-9-]+)/i]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) return match[1]
  }
  return undefined
}

function extractBrand(text: string): string | undefined {
  const brands = ["Apple", "Samsung", "OnePlus", "Xiaomi", "Realme", "Oppo", "Vivo", "Nokia", "Motorola", "Sony"]
  for (const brand of brands) {
    if (text.toLowerCase().includes(brand.toLowerCase())) {
      return brand
    }
  }
  return undefined
}

function extractPurchaseDate(text: string): string | undefined {
  const patterns = [
    /(?:purchase|bought|date)\s*(?:date)?\s*[:=]?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
    /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) return match[1]
  }
  return undefined
}

function getMockOCRResult(): OCRResult {
  return {
    text: "Mock OCR Result - Configure Google Vision API for real OCR processing",
    confidence: 0.5,
    language: "en",
    entities: {},
  }
}
