"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Star, MapPin } from "lucide-react"
import Link from "next/link"
import { FilterSidebar, FilterState } from "@/components/filter-sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Hotel {
  id: string
  name: string
  description: string
  city: string
  state: string
  star_rating: number
  price_per_night: number
  images: string[]
  amenities: string[]
  room_types: string[]
}

export default function Hotels() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 50000],
    starRating: [],
    roomTypes: [],
    amenities: [],
  })
  const [loading, setLoading] = useState(true)
  const [sortOption, setSortOption] = useState<string>("")

  // Fetch hotels from Supabase
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("hotels")
          .select("id, name, description, city, state, star_rating, price_per_night, images, amenities, room_types")
        
        if (error) {
          console.error("Error fetching hotels:", error)
          return
        }

        setHotels(data || [])
        setFilteredHotels(data || [])
      } catch (error) {
        console.error("Unexpected error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHotels()
  }, [])

  // Apply filters, search, and sorting
  useEffect(() => {
    let result = [...hotels]

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(hotel =>
        hotel.name.toLowerCase().includes(query) ||
        hotel.city.toLowerCase().includes(query) ||
        hotel.state.toLowerCase().includes(query) ||
        hotel.description.toLowerCase().includes(query)
      )
    }

    // Apply price range filter
    result = result.filter(hotel =>
      hotel.price_per_night >= filters.priceRange[0] &&
      hotel.price_per_night <= filters.priceRange[1]
    )

    // Apply star rating filter
    if (filters.starRating.length > 0) {
      result = result.filter(hotel => filters.starRating.includes(hotel.star_rating))
    }

    // Apply room types filter
    if (filters.roomTypes.length > 0) {
      result = result.filter(hotel =>
        filters.roomTypes.some(type => hotel.room_types.includes(type))
      )
    }

    // Apply amenities filter
    if (filters.amenities.length > 0) {
      result = result.filter(hotel =>
        filters.amenities.every(amenity => hotel.amenities.includes(amenity))
      )
    }

    // Apply sorting
    if (sortOption) {
      switch (sortOption) {
        case "price-low-high":
          result.sort((a, b) => a.price_per_night - b.price_per_night)
          break
        case "price-high-low":
          result.sort((a, b) => b.price_per_night - a.price_per_night)
          break
        case "star-high-low":
          result.sort((a, b) => b.star_rating - a.star_rating)
          break
        case "star-low-high":
          result.sort((a, b) => a.star_rating - b.star_rating)
          break
      }
    }

    setFilteredHotels(result)
  }, [searchQuery, filters, hotels, sortOption])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar links={[
        { label: "Home", href: "/" },
        { label: "Hotels", href: "/hotels" },
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "Add Hotel", href: "/add-hotel", variant: "outline", className: "ml-auto" },
      ]} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Input
            placeholder="Search Hotels"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md bg-white border border-gray-300 rounded-full py-2 px-4 shadow-sm focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter Sidebar */}
          <div className="w-full lg:w-64">
            <FilterSidebar filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {filteredHotels.length} Hotels Found
              </h2>
              <Select onValueChange={setSortOption} value={sortOption}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                  <SelectItem value="price-high-low">Price: High to Low</SelectItem>
                  <SelectItem value="star-high-low">Star Rating: High to Low</SelectItem>
                  <SelectItem value="star-low-high">Star Rating: Low to High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Hotel Cards */}
            {loading ? (
              <div className="text-center text-gray-600">Loading hotels...</div>
            ) : filteredHotels.length === 0 ? (
              <div className="text-center text-gray-600">No hotels found matching your criteria.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHotels.map(hotel => (
                  <Card key={hotel.id} className="overflow-hidden border-none shadow-md">
                    <div className="relative h-48">
                      <img
                        src={hotel.images[0] || "/placeholder.svg"}
                        alt={hotel.name}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold">{hotel.name}</h3>
                        <div className="flex">
                          {[...Array(hotel.star_rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {hotel.city}, {hotel.state}
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-1">{hotel.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}