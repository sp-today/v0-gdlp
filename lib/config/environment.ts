// Environment configuration for GDLP

export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
    timeout: 30000,
    retryAttempts: 3,
  },

  // Database Configuration
  database: {
    postgresql: {
      url: process.env.DATABASE_URL,
      pool: {
        min: 2,
        max: 10,
      },
    },
    mongodb: {
      url: process.env.MONGODB_URI,
    },
  },

  // Authentication
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiry: "7d",
    refreshTokenExpiry: "30d",
  },

  // External Services
  services: {
    ocr: {
      provider: process.env.OCR_PROVIDER || "affinda",
      apiKey: process.env.OCR_API_KEY,
      endpoint: process.env.OCR_ENDPOINT,
    },
    language: {
      provider: process.env.LANGUAGE_PROVIDER || "bhashini",
      apiKey: process.env.LANGUAGE_API_KEY,
      endpoint: process.env.LANGUAGE_ENDPOINT,
    },
    storage: {
      provider: process.env.STORAGE_PROVIDER || "aws-s3",
      bucket: process.env.STORAGE_BUCKET,
      region: process.env.STORAGE_REGION,
    },
  },

  // Feature Flags
  features: {
    enableVoiceInput: true,
    enableOfflineMode: true,
    enableARGuidance: false, // Phase 2
    enableBlockchain: false, // Phase 2
  },

  // Supported Languages
  languages: ["en", "hi", "te", "ta", "mr", "bn", "gu", "kn", "ml", "pa"],

  // Application Settings
  app: {
    name: "GDLP",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  },
}
