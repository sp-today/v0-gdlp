"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Loader, TrendingUp } from "lucide-react"
import type { Device, RepairCenter } from "@/lib/types/database"

interface BookingFormProps {
  device: Device
  repairCenter: RepairCenter
  onBookingComplete?: () => void
}

export function BookingForm({ device, repairCenter, onBookingComplete }: BookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPredicting, setIsPredicting] = useState(false)
  const [prediction, setPrediction] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    booking_date: "",
    booking_time: "10:00",
    issue_description: "",
    issue_category: "hardware",
  })

  const handlePredictTimeline = async () => {
    try {
      setIsPredicting(true)
      const response = await fetch("/api/repair-bookings/predict-timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issue_category: formData.issue_category,
          device_type: device.device_type,
          repair_center_id: repairCenter.id,
        }),
      })

      if (!response.ok) throw new Error("Prediction failed")
      const data = await response.json()
      setPrediction(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prediction failed")
    } finally {
      setIsPredicting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      setError(null)

      const response = await fetch("/api/repair-bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_id: device.id,
          repair_center_id: repairCenter.id,
          booking_date: formData.booking_date,
          booking_time: formData.booking_time,
          issue_description: formData.issue_description,
          estimated_cost: prediction?.estimated_cost_range.max || 5000,
        }),
      })

      if (!response.ok) throw new Error("Booking failed")

      onBookingComplete?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Book Repair Service</CardTitle>
          <CardDescription>Schedule a repair appointment for {device.device_name}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>
            )}

            <div className="space-y-2">
              <Label>Device</Label>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="font-medium">{device.device_name}</p>
                <p className="text-sm text-muted-foreground">
                  {device.brand} {device.model}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Repair Center</Label>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="font-medium">{repairCenter.center_name}</p>
                <p className="text-sm text-muted-foreground">{repairCenter.location}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="booking-date">Booking Date</Label>
                <Input
                  id="booking-date"
                  type="date"
                  value={formData.booking_date}
                  onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                  required
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking-time">Booking Time</Label>
                <Input
                  id="booking-time"
                  type="time"
                  value={formData.booking_time}
                  onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue-category">Issue Category</Label>
              <Select
                value={formData.issue_category}
                onValueChange={(value) => {
                  setFormData({ ...formData, issue_category: value })
                  setPrediction(null)
                }}
              >
                <SelectTrigger id="issue-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="battery">Battery</SelectItem>
                  <SelectItem value="screen">Screen</SelectItem>
                  <SelectItem value="charging">Charging</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="hardware">Hardware</SelectItem>
                  <SelectItem value="connectivity">Connectivity</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue-description">Issue Description</Label>
              <Textarea
                id="issue-description"
                placeholder="Describe the issue with your device..."
                value={formData.issue_description}
                onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
                required
                rows={4}
              />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handlePredictTimeline}
              disabled={isPredicting || !formData.issue_category}
              className="w-full bg-transparent"
            >
              {isPredicting ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Predicting...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Predict Timeline & Cost
                </>
              )}
            </Button>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Booking..." : "Confirm Booking"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {prediction && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">Predicted Timeline & Cost</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Estimated Completion</p>
                <p className="text-2xl font-bold">{prediction.estimated_days} day(s)</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated Cost Range</p>
                <p className="text-2xl font-bold">
                  ₹{prediction.estimated_cost_range.min.toLocaleString()} - ₹
                  {prediction.estimated_cost_range.max.toLocaleString()}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Confidence: {(prediction.confidence * 100).toFixed(0)}%</p>
              <div className="space-y-1">
                {prediction.factors.map((factor: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
