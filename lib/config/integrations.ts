// Integration configuration and status

export const INTEGRATIONS = {
  ocr: {
    name: "OCR Processing",
    provider: "Google Vision API",
    status: process.env.GOOGLE_VISION_API_KEY ? "configured" : "not_configured",
    description: "Document text extraction and entity recognition",
  },
  translation: {
    name: "Multi-Language Translation",
    provider: "Bhashini API",
    status: process.env.BHASHINI_API_KEY ? "configured" : "not_configured",
    description: "Support for 10+ Indian languages",
  },
  gs1_verification: {
    name: "GS1 Code Verification",
    provider: "GS1 India",
    status: process.env.GS1_API_KEY ? "configured" : "not_configured",
    description: "Spare parts authenticity verification",
  },
  government_portal: {
    name: "Government Portal Integration",
    provider: "National Consumer Portal",
    status: process.env.GOVERNMENT_PORTAL_API_KEY ? "configured" : "not_configured",
    description: "Automatic grievance submission to government portals",
  },
}

export function getIntegrationStatus() {
  return Object.entries(INTEGRATIONS).map(([key, config]) => ({
    id: key,
    ...config,
  }))
}
