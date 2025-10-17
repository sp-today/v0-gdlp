"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Clock, Volume2, ChevronDown, ChevronUp } from "lucide-react"
import type { RepairGuide } from "@/lib/types/database"

interface RepairGuideViewerProps {
  guideId: string
}

export function RepairGuideViewer({ guideId }: RepairGuideViewerProps) {
  const [guide, setGuide] = useState<RepairGuide | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0]))
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGuide()
  }, [guideId])

  const fetchGuide = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/repair-guides/${guideId}`)
      if (!response.ok) throw new Error("Failed to fetch guide")
      const data = await response.json()
      setGuide(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch guide")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleStep = (index: number) => {
    const newExpanded = new Set(expandedSteps)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedSteps(newExpanded)
  }

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = guide?.language || "en"
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading repair guide...</div>
  }

  if (error || !guide) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">{error || "Guide not found"}</div>
    )
  }

  const steps = Array.isArray(guide.steps) ? guide.steps : Object.values(guide.steps || {})

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl">{guide.title}</CardTitle>
              <CardDescription className="mt-2">{guide.description}</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => speakText(guide.title + ". " + guide.description)}
              disabled={isSpeaking}
            >
              <Volume2 className="w-4 h-4 mr-2" />
              {isSpeaking ? "Speaking..." : "Listen"}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="outline">{guide.device_type}</Badge>
            <Badge variant="outline">
              {guide.brand} {guide.model}
            </Badge>
            <Badge
              variant={
                guide.difficulty_level === "easy"
                  ? "default"
                  : guide.difficulty_level === "medium"
                    ? "secondary"
                    : "destructive"
              }
            >
              {guide.difficulty_level?.toUpperCase()}
            </Badge>
            {guide.estimated_time_minutes && (
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                {guide.estimated_time_minutes} min
              </Badge>
            )}
            {guide.success_rate && (
              <Badge variant="outline">
                <CheckCircle className="w-3 h-3 mr-1" />
                {(guide.success_rate * 100).toFixed(0)}% success
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {guide.tools_required && guide.tools_required.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tools Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-2">
              {guide.tools_required.map((tool, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{tool}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Step-by-Step Instructions</h3>
        {steps.map((step: any, idx: number) => (
          <Card key={idx} className="overflow-hidden">
            <button
              onClick={() => toggleStep(idx)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 text-left">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-semibold">
                  {idx + 1}
                </div>
                <div>
                  <p className="font-medium">{step.title || `Step ${idx + 1}`}</p>
                  {step.description && <p className="text-sm text-muted-foreground line-clamp-1">{step.description}</p>}
                </div>
              </div>
              {expandedSteps.has(idx) ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {expandedSteps.has(idx) && (
              <CardContent className="pt-0 border-t">
                <div className="space-y-3 mt-4">
                  {step.description && <p className="text-sm">{step.description}</p>}

                  {step.warnings && step.warnings.length > 0 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="flex gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-900 text-sm">Warnings:</p>
                          <ul className="text-sm text-yellow-800 mt-1 space-y-1">
                            {step.warnings.map((warning: string, widx: number) => (
                              <li key={widx}>• {warning}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {step.tips && step.tips.length > 0 && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="font-medium text-blue-900 text-sm mb-2">Tips:</p>
                      <ul className="text-sm text-blue-800 space-y-1">
                        {step.tips.map((tip: string, tidx: number) => (
                          <li key={tidx}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => speakText(step.description || `Step ${idx + 1}`)}
                    disabled={isSpeaking}
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    Read Aloud
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {guide.video_url && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Video Tutorial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <iframe src={guide.video_url} className="w-full h-full" allowFullScreen title="Repair Guide Video" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
