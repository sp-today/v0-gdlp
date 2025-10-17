"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Clock, XCircle, Loader } from "lucide-react"
import type { Grievance } from "@/lib/types/database"

export function GrievanceTracker() {
  const [grievances, setGrievances] = useState<Grievance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGrievances()
  }, [])

  const fetchGrievances = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/grievances")
      if (!response.ok) throw new Error("Failed to fetch grievances")
      const data = await response.json()
      setGrievances(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch grievances")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />
      case "under_investigation":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "acknowledged":
        return <AlertCircle className="w-5 h-5 text-blue-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string }> = {
      submitted: { bg: "bg-gray-100", text: "text-gray-800" },
      acknowledged: { bg: "bg-blue-100", text: "text-blue-800" },
      under_investigation: { bg: "bg-yellow-100", text: "text-yellow-800" },
      resolved: { bg: "bg-green-100", text: "text-green-800" },
      rejected: { bg: "bg-red-100", text: "text-red-800" },
    }

    const config = statusConfig[status] || statusConfig.submitted
    return <Badge className={`${config.bg} ${config.text}`}>{status.replace("_", " ")}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, string> = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    }

    return <Badge className={priorityConfig[priority] || priorityConfig.medium}>{priority}</Badge>
  }

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Loader className="w-5 h-5 animate-spin mx-auto mb-2" />
        Loading grievances...
      </div>
    )
  }

  if (error) {
    return <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">{error}</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grievance Tracker</CardTitle>
        <CardDescription>Monitor the status of your submitted grievances</CardDescription>
      </CardHeader>
      <CardContent>
        {grievances.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No grievances filed yet</p>
        ) : (
          <div className="space-y-3">
            {grievances.map((grievance) => (
              <div key={grievance.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(grievance.grievance_status)}
                    <div className="flex-1">
                      <p className="font-medium">{grievance.title}</p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{grievance.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {grievance.grievance_type.replace("_", " ")}
                        </Badge>
                        {getPriorityBadge(grievance.priority_level)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Submitted: {new Date(grievance.submitted_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">{getStatusBadge(grievance.grievance_status)}</div>
                </div>

                {grievance.government_portal_reference && (
                  <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
                    <p className="text-blue-900">
                      Portal Reference: <span className="font-mono">{grievance.government_portal_reference}</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
