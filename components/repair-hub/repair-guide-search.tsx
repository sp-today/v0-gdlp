"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"
import type { RepairGuide } from "@/lib/types/database"

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "kn", name: "Kannada" },
  { code: "ml", name: "Malayalam" },
  { code: "mr", name: "Marathi" },
  { code: "gu", name: "Gujarati" },
  { code: "bn", name: "Bengali" },
  { code: "pa", name: "Punjabi" },
]

const DEVICE_TYPES = ["smartphone", "laptop", "tablet", "smartwatch", "headphones", "camera"]

const ISSUE_CATEGORIES = [
  "battery",
  "screen",
  "charging",
  "software",
  "hardware",
  "connectivity",
  "performance",
  "audio",
]

interface RepairGuideSearchProps {
  onGuideSelect?: (guide: RepairGuide) => void
}

export function RepairGuideSearch({ onGuideSelect }: RepairGuideSearchProps) {
  const [guides, setGuides] = useState<RepairGuide[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const [filters, setFilters] = useState({
    device_type: "",
    brand: "",
    issue_category: "",
    language: "en",
    difficulty_level: "",
  })

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await fetch(`/api/repair-guides/search?${params}`)
      if (!response.ok) throw new Error("Search failed")

      const data = await response.json()
      setGuides(data)
      setHasSearched(true)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Find Repair Guides</CardTitle>
          <CardDescription>Search for step-by-step repair instructions in your preferred language</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="device-type">Device Type</Label>
                <Select
                  value={filters.device_type}
                  onValueChange={(value) => setFilters({ ...filters, device_type: value })}
                >
                  <SelectTrigger id="device-type">
                    <SelectValue placeholder="Select device type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEVICE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  placeholder="e.g., Apple, Samsung, OnePlus"
                  value={filters.brand}
                  onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="issue">Issue Category</Label>
                <Select
                  value={filters.issue_category}
                  onValueChange={(value) => setFilters({ ...filters, issue_category: value })}
                >
                  <SelectTrigger id="issue">
                    <SelectValue placeholder="Select issue category" />
                  </SelectTrigger>
                  <SelectContent>
                    {ISSUE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={filters.language} onValueChange={(value) => setFilters({ ...filters, language: value })}>
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select
                  value={filters.difficulty_level}
                  onValueChange={(value) => setFilters({ ...filters, difficulty_level: value })}
                >
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Any difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              <Search className="w-4 h-4 mr-2" />
              {isLoading ? "Searching..." : "Search Guides"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {hasSearched && (
        <div className="space-y-3">
          <h3 className="font-semibold">
            {guides.length} {guides.length === 1 ? "guide" : "guides"} found
          </h3>

          {guides.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No guides found. Try adjusting your search filters.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {guides.map((guide) => (
                <Card key={guide.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <Link href={`/dashboard/repair-hub/${guide.id}`}>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-lg">{guide.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{guide.description}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
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
                            className="text-xs"
                          >
                            {guide.difficulty_level?.toUpperCase()}
                          </Badge>
                          {guide.estimated_time_minutes && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {guide.estimated_time_minutes} min
                            </Badge>
                          )}
                          {guide.success_rate && (
                            <Badge variant="outline" className="text-xs">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              {(guide.success_rate * 100).toFixed(0)}% success
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
