import { jest } from "@jest/globals"

export function createMockSupabaseClient() {
  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null }),
    }),
  }
}

export function createMockUser(overrides = {}) {
  return {
    id: "test-user-id",
    email: "test@example.com",
    role: "user",
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

export function createMockDevice(overrides = {}) {
  return {
    id: "test-device-id",
    user_id: "test-user-id",
    device_name: "iPhone 13",
    brand: "Apple",
    model: "iPhone 13",
    serial_number: "ABC123XYZ",
    purchase_date: "2023-01-01",
    warranty_expiry: "2025-01-01",
    created_at: new Date().toISOString(),
    ...overrides,
  }
}
