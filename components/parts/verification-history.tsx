"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Loader } from "lucide-react"

interface VerificationRecord {
  id: string
  verification_status: "authentic" | "counterfeit" | "unknown"
  checked_at: string
  spare_parts: {
    part_name: string
    part_number: string
    brand: string
    model: string
  } | null
}

export function VerificationHistory() {
  const [history, setHistory] = useState<VerificationRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/spare-parts/verification-history")
      if (!response.ok) throw new Error("Failed to fetch history")
      const data = await response.json()
      setHistory(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch history")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "authentic":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "counterfeit":
        return <XCircle className="w-5 h-5 text-red-500" />
      case "unknown":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "authentic":
        return <Badge className="bg-green-100 text-green-800">Authentic</Badge>
      case "counterfeit":
        return <Badge className="bg-red-100 text-red-800">Counterfeit</Badge>
      case "unknown":
        return <Badge className="bg-yellow-100 text-yellow-800">Unknown</Badge>
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Loader className="w-5 h-5 animate-spin mx-auto mb-2" />
        Loading verification history...
      </div>
    )
  }

  if (error) {
    return <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">{error}</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification History</CardTitle>
        <CardDescription>Your recent part authenticity checks</CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No verification history yet</p>
        ) : (
          <div className="space-y-3">
            {history.map((record) => (
              <div key={record.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(record.verification_status)}
                  <div className="flex-1">
                    {record.spare_parts ? (
                      <>
                        <p className="font-medium">{record.spare_parts.part_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {record.spare_parts.brand} {record.spare_parts.model}
                        </p>
                      </>
                    ) : (
                      <p className="font-medium text-muted-foreground">Unknown Part</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{new Date(record.checked_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="ml-2">{getStatusBadge(record.verification_status)}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
