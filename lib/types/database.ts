// Database type definitions for GDLP

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone_number: string | null
  user_type: "consumer" | "repair_center" | "oem" | "admin"
  language_preference: string
  created_at: string
  updated_at: string
}

export interface Device {
  id: string
  user_id: string
  device_name: string
  device_type: string
  brand: string
  model: string
  serial_number: string | null
  imei_number: string | null
  purchase_date: string
  purchase_price: number | null
  warranty_start_date: string | null
  warranty_end_date: string | null
  warranty_type: "manufacturer" | "extended" | "third_party" | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WarrantyDocument {
  id: string
  device_id: string
  document_type: "invoice" | "warranty_card" | "receipt" | "certificate"
  document_url: string
  ocr_extracted_text: string | null
  document_status: "pending" | "verified" | "rejected"
  uploaded_at: string
  created_at: string
}

export interface WarrantyClaim {
  id: string
  device_id: string
  user_id: string
  claim_type: "repair" | "replacement" | "refund"
  issue_description: string
  claim_status: "submitted" | "under_review" | "approved" | "rejected" | "completed"
  claim_amount: number | null
  submitted_date: string
  resolution_date: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
}

export interface RepairGuide {
  id: string
  device_type: string
  brand: string
  model: string
  issue_category: string
  title: string
  description: string
  steps: Record<string, any>
  difficulty_level: "easy" | "medium" | "hard"
  estimated_time_minutes: number | null
  tools_required: string[]
  language: string
  video_url: string | null
  success_rate: number | null
  created_at: string
  updated_at: string
}

export interface SparePart {
  id: string
  part_name: string
  part_number: string
  device_type: string
  brand: string
  model: string
  gs1_code: string | null
  manufacturer: string
  price: number | null
  is_genuine: boolean
  authenticity_verified_at: string | null
  created_at: string
  updated_at: string
}

export interface RepairCenter {
  id: string
  user_id: string
  center_name: string
  location: string
  latitude: number | null
  longitude: number | null
  phone_number: string
  email: string
  rating: number | null
  total_reviews: number
  is_verified: boolean
  specializations: string[]
  created_at: string
  updated_at: string
}

export interface RepairBooking {
  id: string
  device_id: string
  user_id: string
  repair_center_id: string
  booking_date: string
  booking_time: string
  issue_description: string
  estimated_cost: number | null
  actual_cost: number | null
  booking_status: "scheduled" | "in_progress" | "completed" | "cancelled"
  predicted_completion_date: string | null
  actual_completion_date: string | null
  created_at: string
  updated_at: string
}

export interface Grievance {
  id: string
  user_id: string
  device_id: string | null
  grievance_type: "warranty_denial" | "poor_service" | "counterfeit_parts" | "billing_issue" | "other"
  title: string
  description: string
  grievance_status: "submitted" | "acknowledged" | "under_investigation" | "resolved" | "rejected"
  priority_level: "low" | "medium" | "high" | "critical"
  ai_generated_complaint: string | null
  government_portal_reference: string | null
  submitted_date: string
  resolution_date: string | null
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  notification_type: string
  title: string
  message: string
  related_entity_id: string | null
  is_read: boolean
  created_at: string
}
