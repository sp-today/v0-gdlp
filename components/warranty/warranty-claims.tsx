"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react"
import type { Device, WarrantyClaim } from "@/lib/types/database"

interface WarrantyClaimsProps {
  device: Device
}

export function WarrantyClaims({ device }: WarrantyClaimsProps) {
  const [claims, setClaims] = useState<WarrantyClaim[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    claim_type: "repair" as const,
    issue_description: "",
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchClaims()
  }, [device.id])

  const fetchClaims = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/warranty-claims?device_id=${device.id}`)
      if (!response.ok) throw new Error("Failed to fetch claims")
      const data = await response.json()
      setClaims(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch claims")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      setError(null)

      const response = await fetch("/api/warranty-claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_id: device.id,
          ...formData,
        }),
      })

      if (!response.ok) throw new Error("Failed to submit claim")

      const newClaim = await response.json()
      setClaims([newClaim, ...claims])
      setShowForm(false)
      setFormData({ claim_type: "repair", issue_description: "" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit claim")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />
      case "under_review":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "completed":
        return <CheckCircle className="w-5 h-5 text-blue-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Warranty Claims</h2>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "File New Claim"}</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>File a Warranty Claim</CardTitle>
            <CardDescription>Submit a new warranty claim for {device.device_name}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitClaim} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>
              )}

              <div className="space-y-2">
                <Label htmlFor="claim-type">Claim Type</Label>
                <Select
                  value={formData.claim_type}
                  onValueChange={(value: any) => setFormData({ ...formData, claim_type: value })}
                >
                  <SelectTrigger id="claim-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="repair">Repair</SelectItem>
                    <SelectItem value="replacement">Replacement</SelectItem>
                    <SelectItem value="refund">Refund</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="issue">Issue Description</Label>
                <Textarea
                  id="issue"
                  placeholder="Describe the issue with your device..."
                  value={formData.issue_description}
                  onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
                  required
                  rows={4}
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Submitting..." : "Submit Claim"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading claims...</div>
        ) : claims.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No claims filed yet</div>
        ) : (
          <div className="grid gap-3">
            {claims.map((claim) => (
              <Card key={claim.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3 flex-1">
                    {getStatusIcon(claim.claim_status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium capitalize">{claim.claim_type} Claim</p>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded capitalize">
                          {claim.claim_status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{claim.issue_description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Submitted {new Date(claim.submitted_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {claim.claim_amount && (
                    <div className="text-right">
                      <p className="font-semibold">₹{claim.claim_amount.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
