export type UserRole = "user" | "admin" | "support" | "provider"

export const rolePermissions: Record<UserRole, string[]> = {
  user: [
    "view_own_devices",
    "create_warranty_claim",
    "view_repair_guides",
    "verify_parts",
    "create_grievance",
    "view_own_bookings",
  ],
  admin: [
    "view_all_devices",
    "manage_users",
    "manage_repair_centers",
    "view_analytics",
    "manage_grievances",
    "export_data",
  ],
  support: ["view_all_devices", "manage_grievances", "view_analytics", "respond_to_grievances"],
  provider: ["view_assigned_bookings", "update_booking_status", "view_own_profile", "update_availability"],
}

export function hasPermission(role: UserRole, permission: string): boolean {
  return rolePermissions[role]?.includes(permission) || false
}

export function hasAnyPermission(role: UserRole, permissions: string[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission))
}
