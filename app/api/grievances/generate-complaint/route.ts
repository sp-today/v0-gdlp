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
    const { grievance_type, title, description, device_id } = body

    // Get user profile for personalization
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    // Get device info if provided
    let deviceInfo = ""
    if (device_id) {
      const { data: device } = await supabase.from("devices").select("*").eq("id", device_id).single()
      if (device) {
        deviceInfo = `Device: ${device.brand} ${device.model} (Serial: ${device.serial_number || "N/A"})\n`
      }
    }

    // Generate AI-powered complaint text
    const aiGeneratedComplaint = generateComplaint({
      grievance_type,
      title,
      description,
      user_name: profile?.full_name || "Valued Customer",
      device_info: deviceInfo,
    })

    return NextResponse.json({
      ai_generated_complaint: aiGeneratedComplaint,
      template_used: "standard_complaint",
    })
  } catch (error) {
    console.error("Error generating complaint:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function generateComplaint(params: {
  grievance_type: string
  title: string
  description: string
  user_name: string
  device_info: string
}): string {
  const templates: Record<string, string> = {
    warranty_denial: `FORMAL COMPLAINT - WARRANTY CLAIM DENIAL

To the Concerned Authority,

I, ${params.user_name}, am writing to lodge a formal complaint regarding the unjustified denial of my warranty claim.

ISSUE DETAILS:
${params.device_info}
Issue: ${params.title}
Description: ${params.description}

COMPLAINT:
My warranty claim has been wrongfully denied despite the device being within the warranty period and the issue being covered under the warranty terms. This denial is in violation of consumer protection laws and the warranty agreement provided at the time of purchase.

RELIEF SOUGHT:
1. Immediate review and approval of the warranty claim
2. Free repair or replacement of the device
3. Compensation for inconvenience caused
4. Written explanation for the initial denial

I request immediate action on this matter and expect a response within 7 days.

Yours faithfully,
${params.user_name}`,

    poor_service: `FORMAL COMPLAINT - POOR SERVICE QUALITY

To the Concerned Authority,

I, ${params.user_name}, am filing a complaint regarding poor service quality received.

SERVICE DETAILS:
${params.device_info}
Issue: ${params.title}
Description: ${params.description}

COMPLAINT:
The service provided was below acceptable standards and did not meet the promised quality. This has caused significant inconvenience and dissatisfaction.

RELIEF SOUGHT:
1. Immediate rectification of the service
2. Full refund of service charges
3. Compensation for time and inconvenience
4. Assurance of improved service standards

I request urgent resolution of this matter.

Yours faithfully,
${params.user_name}`,

    counterfeit_parts: `FORMAL COMPLAINT - COUNTERFEIT PARTS USED

To the Concerned Authority,

I, ${params.user_name}, am lodging a serious complaint regarding the use of counterfeit parts in my device repair.

INCIDENT DETAILS:
${params.device_info}
Issue: ${params.title}
Description: ${params.description}

COMPLAINT:
Counterfeit or substandard parts were used in the repair of my device, which is a violation of consumer protection laws and ethical business practices. This poses a safety risk and violates my consumer rights.

RELIEF SOUGHT:
1. Immediate replacement with genuine parts
2. Full refund of repair charges
3. Compensation for damages caused
4. Investigation into the service center's practices

This matter requires urgent attention and legal action if necessary.

Yours faithfully,
${params.user_name}`,

    billing_issue: `FORMAL COMPLAINT - BILLING DISCREPANCY

To the Concerned Authority,

I, ${params.user_name}, am filing a complaint regarding billing irregularities.

BILLING DETAILS:
${params.device_info}
Issue: ${params.title}
Description: ${params.description}

COMPLAINT:
I have been overcharged or billed incorrectly for services/products. The charges do not match the agreed-upon price or the services actually rendered.

RELIEF SOUGHT:
1. Immediate correction of the billing
2. Refund of overcharged amount
3. Written explanation of charges
4. Assurance of transparent billing practices

I request resolution within 5 business days.

Yours faithfully,
${params.user_name}`,

    other: `FORMAL COMPLAINT - CONSUMER GRIEVANCE

To the Concerned Authority,

I, ${params.user_name}, am filing a formal complaint regarding the following matter.

DETAILS:
${params.device_info}
Issue: ${params.title}
Description: ${params.description}

COMPLAINT:
As detailed above, I have experienced an issue that violates my consumer rights and requires immediate attention and resolution.

RELIEF SOUGHT:
1. Investigation into the matter
2. Appropriate remedial action
3. Compensation if applicable
4. Prevention of similar incidents

I request your urgent intervention and a response within 7 days.

Yours faithfully,
${params.user_name}`,
  }

  return templates[params.grievance_type] || templates.other
}
