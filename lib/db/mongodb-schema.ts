// MongoDB Collections Schema for GDLP Platform
// Used for unstructured data: guides, content, logs

export const mongoCollections = {
  repairGuides: {
    collectionName: "repair_guides",
    schema: {
      _id: "ObjectId",
      title: "String",
      description: "String",
      device_type: "String",
      issue_category: "String",
      languages: ["String"], // en, hi, te, ta, mr, bn
      steps: [
        {
          step_number: "Number",
          title: "String",
          description: "String",
          images: ["String"],
          video_url: "String",
          estimated_time_minutes: "Number",
          difficulty_level: "String", // easy, medium, hard
        },
      ],
      tools_required: ["String"],
      safety_warnings: ["String"],
      success_rate: "Number",
      created_at: "Date",
      updated_at: "Date",
    },
  },

  troubleshootingContent: {
    collectionName: "troubleshooting_content",
    schema: {
      _id: "ObjectId",
      device_model: "String",
      issue_description: "String",
      solutions: [
        {
          solution_id: "String",
          title: "String",
          description: "String",
          steps: ["String"],
          success_probability: "Number",
          estimated_time_minutes: "Number",
        },
      ],
      related_guides: ["ObjectId"],
      created_at: "Date",
      updated_at: "Date",
    },
  },

  systemLogs: {
    collectionName: "system_logs",
    schema: {
      _id: "ObjectId",
      log_level: "String", // info, warning, error, critical
      service_name: "String",
      message: "String",
      error_details: "Object",
      user_id: "String",
      timestamp: "Date",
      request_id: "String",
    },
  },

  userSessions: {
    collectionName: "user_sessions",
    schema: {
      _id: "ObjectId",
      user_id: "String",
      session_token: "String",
      device_info: "Object",
      ip_address: "String",
      created_at: "Date",
      expires_at: "Date",
      last_activity: "Date",
    },
  },

  mlModelMetrics: {
    collectionName: "ml_model_metrics",
    schema: {
      _id: "ObjectId",
      model_name: "String",
      model_version: "String",
      accuracy: "Number",
      precision: "Number",
      recall: "Number",
      f1_score: "Number",
      inference_time_ms: "Number",
      training_date: "Date",
      last_updated: "Date",
    },
  },
}
