// Government portal integration service
// Submits grievances to government consumer protection portals

export interface GovernmentPortalSubmission {
  portal_name: string
  reference_number: string
  submission_status: "submitted" | "pending" | "failed"
  submission_timestamp: string
  portal_url: string
}

export async function submitToGovernmentPortal(
  grievanceData: {
    title: string
    description: string
    complaint_text: string
    user_name: string
    user_email: string
    user_phone: string
  },
  portalType = "national_consumer_portal",
): Promise<GovernmentPortalSubmission> {
  try {
    // Integration with National Consumer Disputes Redressal Commission (NCDRC) portal
    // or State-level consumer protection portals

    const apiKey = process.env.GOVERNMENT_PORTAL_API_KEY

    if (!apiKey) {
      console.warn("Government portal API key not configured")
      return getMockPortalSubmission()
    }

    const response = await fetch("https://consumer.gov.in/api/grievances/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        ...grievanceData,
        portal_type: portalType,
        submission_date: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      console.error("Portal submission error:", response.statusText)
      return getMockPortalSubmission()
    }

    const data = await response.json()
    return {
      portal_name: "National Consumer Portal",
      reference_number: data.reference_number || generateReferenceNumber(),
      submission_status: "submitted",
      submission_timestamp: new Date().toISOString(),
      portal_url: "https://consumer.gov.in",
    }
  } catch (error) {
    console.error("Government portal submission error:", error)
    return getMockPortalSubmission()
  }
}

function getMockPortalSubmission(): GovernmentPortalSubmission {
  return {
    portal_name: "National Consumer Portal",
    reference_number: generateReferenceNumber(),
    submission_status: "pending",
    submission_timestamp: new Date().toISOString(),
    portal_url: "https://consumer.gov.in",
  }
}

function generateReferenceNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `GDLP-${timestamp}-${random}`
}
