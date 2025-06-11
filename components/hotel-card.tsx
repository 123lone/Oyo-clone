"use client"

import { useState } from "react"
import { Star, MapPin, Wifi, Car, Dumbbell, Utensils, Waves, Dog } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import type { Hotel } from "@/lib/supabase"

interface HotelCardProps {
  hotel: Hotel
  onBookNow: (hotel: Hotel) => void
}

const amenityIcons = {
  WiFi: Wifi,
  Pool: Waves,
  AC: Star,
  Gym: Dumbbell,
  Parking: Car,
  Restaurant: Utensils,
  "Pet-friendly": Dog,
  Spa: Star,
  "Business Center": Star,
  "Room Service": Star,
  "Beach Access": Waves,
  Heritage: Star,
}

export function HotelCard({ hotel, onBookNow }: HotelCardProps) {
  const router = useRouter()

  const handleViewDetails = () => {
    // Create a URL-friendly slug from the hotel name
    const slug = hotel.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
    router.push(`/hotels/${slug}`) // Fixed the route to /hotels/[slug]
  }

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
      <div className="relative">
        <img
          src={hotel.images[0] || "/placeholder.svg?height=200&width=300"}
          alt={hotel.name}
          className="w-full h-48 object-cover"
        />
        {hotel.available_rooms < 5 && hotel.available_rooms > 0 && (
          <Badge className="absolute top-3 left-3 bg-orange-500 text-white">
            Only {hotel.available_rooms} rooms left
          </Badge>
        )}
        {hotel.available_rooms === 0 && <Badge className="absolute top-3 left-3 bg-red-500 text-white">Sold Out</Badge>}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1">{hotel.name}</h3>
          <div className="flex items-center">
            {[...Array(hotel.star_rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
        </div>

        <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">
            {hotel.city}, {hotel.state}
          </span>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{hotel.description}</p>

        {/* Room Types */}
        <div className="flex flex-wrap gap-1 mb-3">
          {hotel.room_types.slice(0, 3).map((roomType, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {roomType}
            </Badge>
          ))}
        </div>

        {/* Amenities */}
        <div className="flex items-center gap-2 mb-4">
          {hotel.amenities.slice(0, 4).map((amenity, index) => {
            const Icon = amenityIcons[amenity as keyof typeof amenityIcons] || Star
            return (
              <div key={index} className="flex items-center text-gray-500" title={amenity}>
                <Icon className="w-4 h-4" />
              </div>
            )
          })}
          {hotel.amenities.length > 4 && (
            <span className="text-xs text-gray-500">+{hotel.amenities.length - 4} more</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              ₹{hotel.price_per_night.toLocaleString()}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">/night</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleViewDetails}>
              View Details
            </Button>
            <Button
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => onBookNow(hotel)}
              disabled={hotel.available_rooms === 0}
            >
              Book Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}