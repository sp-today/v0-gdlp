import { createClient } from "@/lib/supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function getAuthHeaders() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return {
    Authorization: `Bearer ${session?.access_token}`,
  };
}

export async function uploadWarrantyDocument(file: File, deviceId: string, documentType: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("device_id", deviceId);
  formData.append("document_type", documentType);

  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/warranty-documents`, {
    method: "POST",
    headers: {
      ...headers,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to upload document");
  }

  return response.json();
}

export async function getWarrantyDocument(documentId: string) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/warranty-documents/${documentId}`, {
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch document");
  }

  return response.json();
}

export async function deleteWarrantyDocument(documentId: string) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/warranty-documents/${documentId}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to delete document");
  }

  return response.json();
}