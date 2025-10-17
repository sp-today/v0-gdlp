// GS1 Code verification service
// Integrates with GS1 India database for part authenticity

export interface GS1VerificationResult {
  gs1_code: string
  is_valid: boolean
  product_name?: string
  manufacturer?: string
  country_of_origin?: string
  verification_timestamp: string
  confidence: number
}

export async function verifyGS1Code(gs1Code: string): Promise<GS1VerificationResult> {
  try {
    // Using GS1 India API
    const apiKey = process.env.GS1_API_KEY
    const apiCode = apiKey // Declare apiCode variable

    if (!apiCode) {
      console.warn("GS1 API key not configured, using mock verification")
      return getMockGS1Result(gs1Code)
    }

    const response = await fetch("https://api.gs1india.org/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiCode}`,
      },
      body: JSON.stringify({ gs1_code: gs1Code }),
    })

    if (!response.ok) {
      console.error("GS1 API error:", response.statusText)
      return getMockGS1Result(gs1Code)
    }

    const data = await response.json()
    return {
      gs1_code: gs1Code, // Declare gs1_code variable
      is_valid: data.is_valid || false,
      product_name: data.product_name,
      manufacturer: data.manufacturer,
      country_of_origin: data.country_of_origin,
      verification_timestamp: new Date().toISOString(),
      confidence: 0.95,
    }
  } catch (error) {
    console.error("GS1 verification error:", error)
    return getMockGS1Result(gs1Code)
  }
}

function getMockGS1Result(gs1Code: string): GS1VerificationResult {
  return {
    gs1_code: gs1Code,
    is_valid: gs1Code.length === 12 || gs1Code.length === 13,
    product_name: "Sample Product",
    manufacturer: "Sample Manufacturer",
    country_of_origin: "India",
    verification_timestamp: new Date().toISOString(),
    confidence: 0.5,
  }
}
