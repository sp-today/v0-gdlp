"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, XCircle, Camera, Loader } from "lucide-react"

interface GS1ScannerProps {
  onVerificationComplete?: (result: any) => void
}

export function GS1Scanner({ onVerificationComplete }: GS1ScannerProps) {
  const [gs1Code, setGs1Code] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gs1Code.trim()) {
      setError("Please enter a GS1 code")
      return
    }

    try {
      setIsVerifying(true)
      setError(null)
      setResult(null)

      const response = await fetch("/api/spare-parts/verify-gs1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gs1_code: gs1Code }),
      })

      if (!response.ok) throw new Error("Verification failed")

      const data = await response.json()
      setResult(data)
      onVerificationComplete?.(data)
      setGs1Code("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed")
    } finally {
      setIsVerifying(false)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraActive(true)
      }
    } catch (err) {
      setError("Camera access denied")
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      setIsCameraActive(false)
    }
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Verify Part Authenticity</CardTitle>
          <CardDescription>Scan or enter GS1 code to verify if a spare part is genuine</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>}

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gs1-code">GS1 Code</Label>
              <div className="flex gap-2">
                <Input
                  id="gs1-code"
                  placeholder="Enter or scan GS1 code (e.g., 8901234567890)"
                  value={gs1Code}
                  onChange={(e) => setGs1Code(e.target.value)}
                  disabled={isVerifying}
                />
                <Button type="submit" disabled={isVerifying}>
                  {isVerifying ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={isCameraActive ? stopCamera : startCamera}
                className="flex-1 bg-transparent"
              >
                <Camera className="w-4 h-4 mr-2" />
                {isCameraActive ? "Stop Camera" : "Start Camera"}
              </Button>
            </div>
          </form>

          {isCameraActive && (
            <div className="space-y-2">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg bg-black"
                style={{ maxHeight: "300px" }}
              />
              <p className="text-xs text-muted-foreground text-center">Point camera at barcode to scan</p>
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card
          className={
            result.status === "authentic"
              ? "border-green-200 bg-green-50"
              : result.status === "counterfeit"
                ? "border-red-200 bg-red-50"
                : "border-yellow-200 bg-yellow-50"
          }
        >
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                {result.status === "authentic" ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                ) : result.status === "counterfeit" ? (
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p
                    className={
                      result.status === "authentic"
                        ? "font-semibold text-green-900"
                        : result.status === "counterfeit"
                          ? "font-semibold text-red-900"
                          : "font-semibold text-yellow-900"
                    }
                  >
                    {result.message}
                  </p>
                </div>
              </div>

              {result.part && (
                <div className="space-y-2 pt-4 border-t">
                  <h4 className="font-semibold">Part Details</h4>
                  <div className="grid gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Part Name</p>
                      <p className="font-medium">{result.part.part_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Part Number</p>
                      <p className="font-medium">{result.part.part_number}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Manufacturer</p>
                      <p className="font-medium">{result.part.manufacturer}</p>
                    </div>
                    {result.part.price && (
                      <div>
                        <p className="text-muted-foreground">Price</p>
                        <p className="font-medium">₹{result.part.price.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
