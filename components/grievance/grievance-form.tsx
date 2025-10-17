"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader, Sparkles, Copy, Check } from "lucide-react"
import type { Device } from "@/lib/types/database"

interface GrievanceFormProps {
  devices: Device[]
  onGrievanceSubmitted?: () => void
}

export function GrievanceForm({ devices, onGrievanceSubmitted }: GrievanceFormProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generatedComplaint, setGeneratedComplaint] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    grievance_type: "warranty_denial",
    title: "",
    description: "",
    device_id: "",
    priority_level: "medium",
  })

  const handleGenerateComplaint = async () => {
    if (!formData.title || !formData.description) {
      setError("Please fill in title and description")
      return
    }

    try {
      setIsGenerating(true)
      setError(null)

      const response = await fetch("/api/grievances/generate-complaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grievance_type: formData.grievance_type,
          title: formData.title,
          description: formData.description,
          device_id: formData.device_id || null,
        }),
      })

      if (!response.ok) throw new Error("Generation failed")

      const data = await response.json()
      setGeneratedComplaint(data.ai_generated_complaint)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      setError(null)

      const response = await fetch("/api/grievances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          ai_generated_complaint: generatedComplaint,
        }),
      })

      if (!response.ok) throw new Error("Submission failed")

      onGrievanceSubmitted?.()
      setFormData({
        grievance_type: "warranty_denial",
        title: "",
        description: "",
        device_id: "",
        priority_level: "medium",
      })
      setGeneratedComplaint(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = () => {
    if (generatedComplaint) {
      navigator.clipboard.writeText(generatedComplaint)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>File a Grievance</CardTitle>
          <CardDescription>Submit a formal complaint with AI-powered assistance</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>
            )}

            <div className="space-y-2">
              <Label htmlFor="grievance-type">Grievance Type</Label>
              <Select
                value={formData.grievance_type}
                onValueChange={(value) => setFormData({ ...formData, grievance_type: value })}
              >
                <SelectTrigger id="grievance-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warranty_denial">Warranty Claim Denial</SelectItem>
                  <SelectItem value="poor_service">Poor Service Quality</SelectItem>
                  <SelectItem value="counterfeit_parts">Counterfeit Parts Used</SelectItem>
                  <SelectItem value="billing_issue">Billing Issue</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {devices.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="device">Related Device (Optional)</Label>
                <Select
                  value={formData.device_id}
                  onValueChange={(value) => setFormData({ ...formData, device_id: value })}
                >
                  <SelectTrigger id="device">
                    <SelectValue placeholder="Select a device" />
                  </SelectTrigger>
                  <SelectContent>
                    {devices.map((device) => (
                      <SelectItem key={device.id} value={device.id}>
                        {device.device_name} ({device.brand} {device.model})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Grievance Title</Label>
              <input
                id="title"
                type="text"
                placeholder="Brief title of your grievance"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description</Label>
              <Textarea
                id="description"
                placeholder="Provide detailed information about your grievance..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level</Label>
              <Select
                value={formData.priority_level}
                onValueChange={(value) => setFormData({ ...formData, priority_level: value })}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateComplaint}
              disabled={isGenerating || !formData.title || !formData.description}
              className="w-full bg-transparent"
            >
              {isGenerating ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Complaint
                </>
              )}
            </Button>

            <Button type="submit" disabled={isSubmitting || !generatedComplaint} className="w-full">
              {isSubmitting ? "Submitting..." : "Submit Grievance"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {generatedComplaint && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">AI-Generated Complaint</CardTitle>
                <CardDescription>Review and submit your formal complaint</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={copyToClipboard} className="text-blue-600 hover:text-blue-700">
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded-md border border-blue-200 whitespace-pre-wrap text-sm font-mono max-h-96 overflow-y-auto">
              {generatedComplaint}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
