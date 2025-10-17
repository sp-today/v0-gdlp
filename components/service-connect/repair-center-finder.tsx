"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Mail, Star, Loader } from "lucide-react"
import Link from "next/link"
import type { RepairCenter } from "@/lib/types/database"

interface RepairCenterFinderProps {
  onCenterSelect?: (center: RepairCenter) => void
}

export function RepairCenterFinder({ onCenterSelect }: RepairCenterFinderProps) {
  const [centers, setCenters] = useState<RepairCenter[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)

  const [filters, setFilters] = useState({
    radius: "10",
    specialization: "",
    min_rating: "0",
  })

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        })
      })
    }
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)

      const params = new URLSearchParams()
      if (userLocation) {
        params.append("latitude", userLocation.lat.toString())
        params.append("longitude", userLocation.lon.toString())
      }
      params.append("radius", filters.radius)
      if (filters.specialization) params.append("specialization", filters.specialization)
      params.append("min_rating", filters.min_rating)

      const response = await fetch(`/api/repair-centers/search?${params}`)
      if (!response.ok) throw new Error("Search failed")

      const data = await response.json()
      setCenters(data)
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
          <CardTitle>Find Repair Centers</CardTitle>
          <CardDescription>Locate verified repair centers near you</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="radius">Search Radius (km)</Label>
                <Select value={filters.radius} onValueChange={(value) => setFilters({ ...filters, radius: value })}>
                  <SelectTrigger id="radius">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 km</SelectItem>
                    <SelectItem value="10">10 km</SelectItem>
                    <SelectItem value="25">25 km</SelectItem>
                    <SelectItem value="50">50 km</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Select
                  value={filters.specialization}
                  onValueChange={(value) => setFilters({ ...filters, specialization: value })}
                >
                  <SelectTrigger id="specialization">
                    <SelectValue placeholder="Any specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any specialization</SelectItem>
                    <SelectItem value="smartphone">Smartphone</SelectItem>
                    <SelectItem value="laptop">Laptop</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                    <SelectItem value="smartwatch">Smartwatch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Minimum Rating</Label>
                <Select
                  value={filters.min_rating}
                  onValueChange={(value) => setFilters({ ...filters, min_rating: value })}
                >
                  <SelectTrigger id="rating">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any rating</SelectItem>
                    <SelectItem value="3">3+ stars</SelectItem>
                    <SelectItem value="4">4+ stars</SelectItem>
                    <SelectItem value="4.5">4.5+ stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search Repair Centers"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {hasSearched && (
        <div className="space-y-3">
          <h3 className="font-semibold">
            {centers.length} {centers.length === 1 ? "center" : "centers"} found
          </h3>

          {centers.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No repair centers found. Try adjusting your search filters.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {centers.map((center) => (
                <Card key={center.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-lg">{center.center_name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{center.rating || "N/A"}</span>
                            <span className="text-sm text-muted-foreground">({center.total_reviews} reviews)</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Verified
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {center.location}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          {center.phone_number}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          {center.email}
                        </div>
                      </div>

                      {center.specializations && center.specializations.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {center.specializations.map((spec, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <Link href={`/dashboard/service-connect/book/${center.id}`}>
                        <Button className="w-full mt-2">Book Service</Button>
                      </Link>
                    </div>
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
