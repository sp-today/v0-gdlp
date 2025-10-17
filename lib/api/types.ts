// TypeScript types for GDLP API

export interface User {
  id: string
  email: string
  phoneNumber: string
  fullName: string
  preferredLanguage: string
  profilePictureUrl?: string
  dateOfBirth?: Date
  address?: Address
  isVerified: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Address {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  latitude?: number
  longitude?: number
}

export interface Device {
  id: string
  userId: string
  deviceName: string
  deviceType: "smartphone" | "laptop" | "tablet" | "appliance"
  brand: string
  model: string
  serialNumber?: string
  imeiNumber?: string
  purchaseDate: Date
  purchasePrice?: number
  deviceStatus: "active" | "inactive" | "disposed"
  isPrimary: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Warranty {
  id: string
  deviceId: string
  warrantyType: "manufacturer" | "extended" | "accidental"
  startDate: Date
  endDate: Date
  coverageDetails: Record<string, any>
  termsAndConditions?: string
  documentUrl?: string
  isActive: boolean
  complianceStatus: "compliant" | "at_risk" | "violated"
  createdAt: Date
  updatedAt: Date
}

export interface RepairService {
  id: string
  deviceId: string
  issueDescription: string
  issueCategory: string
  repairStatus: "pending" | "in_progress" | "completed" | "cancelled"
  estimatedCompletionDate?: Date
  actualCompletionDate?: Date
  repairCost?: number
  partsUsed?: PartUsed[]
  serviceProviderId?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface PartUsed {
  partId: string
  partName: string
  quantity: number
  cost: number
  isAuthenticated: boolean
}

export interface PartAuthentication {
  id: string
  partName: string
  partSku: string
  manufacturer: string
  qrCodeData?: string
  barcodeData?: string
  hologramId?: string
  serialNumber?: string
  authenticationStatus: "pending" | "verified" | "counterfeit" | "unverified"
  verificationTimestamp?: Date
  verificationMethod?: string
  confidenceScore?: number
  deviceId?: string
  repairServiceId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Grievance {
  id: string
  userId: string
  deviceId?: string
  grievanceType: string
  description: string
  supportingDocuments?: string[]
  grievanceStatus: "draft" | "submitted" | "acknowledged" | "resolved" | "rejected"
  governmentPortalId?: string
  governmentPortalType?: "INGRAM" | "NCH"
  submissionDate?: Date
  resolutionDate?: Date
  resolutionNotes?: string
  createdAt: Date
  updatedAt: Date
}

export interface ServiceProvider {
  id: string
  providerName: string
  providerType: "authorized" | "certified" | "independent"
  email?: string
  phoneNumber?: string
  address: Address
  certificationDetails?: Record<string, any>
  isVerified: boolean
  averageRating?: number
  totalReviews: number
  averageRepairTimeDays?: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface RepairBooking {
  id: string
  userId: string
  deviceId: string
  serviceProviderId: string
  bookingDate: Date
  scheduledDate: Date
  estimatedCompletionDate?: Date
  actualCompletionDate?: Date
  bookingStatus: "confirmed" | "in_progress" | "completed" | "cancelled"
  pickupRequired: boolean
  estimatedCost?: number
  actualCost?: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, any>
  }
  timestamp: Date
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}
