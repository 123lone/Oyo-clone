"use client"

import { useState } from "react"
import { MapPin, Calendar, Users, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface SearchHeroProps {
  onSearch: (filters: SearchFilters) => void
}

export interface SearchFilters {
  location: string
  checkIn: string
  checkOut: string
  guests: number
}

export function SearchHero({ onSearch }: SearchHeroProps) {
  const [location, setLocation] = useState("")
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(1)

  const handleSearch = () => {
    onSearch({
      location,
      checkIn,
      checkOut,
      guests,
    })
  }

  return (
    <section className="relative bg-gradient-to-r from-red-500 to-pink-600 py-20">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Find Your Perfect Stay</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Discover amazing hotels across India with the best prices and amenities
          </p>
        </div>

        <Card className="max-w-6xl mx-auto p-6 bg-white/95 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Location */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Where to?</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="City, hotel, or area"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            {/* Check-in */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Check-in</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            {/* Check-out */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Check-out</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            {/* Guests */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Guests</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full pl-10 pr-4 h-12 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} Guest{num > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Button
              onClick={handleSearch}
              size="lg"
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 text-lg"
            >
              <Search className="w-5 h-5 mr-2" />
              Search Hotels
            </Button>
          </div>
        </Card>
      </div>
    </section>
  )
}
