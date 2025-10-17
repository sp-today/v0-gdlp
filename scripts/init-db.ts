// Database initialization script
// Run: npx ts-node scripts/init-db.ts

import { Pool } from "pg"
import {
  userSchema,
  deviceSchema,
  warrantySchema,
  repairServiceSchema,
  partAuthenticationSchema,
  grievanceSchema,
  serviceProviderSchema,
  repairBookingSchema,
  documentVaultSchema,
  notificationSchema,
  analyticsSchema,
} from "@/lib/db/schema"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function initializeDatabase() {
  const client = await pool.connect()

  try {
    console.log("Starting database initialization...")

    // Create schemas
    const schemas = [
      userSchema,
      deviceSchema,
      warrantySchema,
      repairServiceSchema,
      partAuthenticationSchema,
      grievanceSchema,
      serviceProviderSchema,
      repairBookingSchema,
      documentVaultSchema,
      notificationSchema,
      analyticsSchema,
    ]

    for (const schema of schemas) {
      await client.query(schema)
      console.log("✓ Schema created successfully")
    }

    console.log("✓ Database initialization completed successfully!")
  } catch (error) {
    console.error("✗ Database initialization failed:", error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

initializeDatabase()
