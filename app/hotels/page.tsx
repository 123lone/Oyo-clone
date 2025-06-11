"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Navbar } from "@/components/navbar"
import { Input } from "@/components/ui/input"
import { HotelCard } from "@/components/hotel-card"
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
  const [sortOption, setSortOption] = useState<string>("Recommended")

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
    if (sortOption && sortOption !== "Recommended") {
      switch (sortOption) {
        case "Price: Low to High":
          result.sort((a, b) => a.price_per_night - b.price_per_night)
          break
        case "Price: High to Low":
          result.sort((a, b) => b.price_per_night - a.price_per_night)
          break
        case "Star Rating":
          result.sort((a, b) => b.star_rating - a.star_rating)
          break
      }
    }

    setFilteredHotels(result)
  }, [searchQuery, filters, hotels, sortOption])

  const handleBookNow = (hotel: Hotel) => {
    alert(`Book now for ${hotel.name}`)
  }

  const handleViewDetails = (hotel: Hotel) => {
    alert(`View details for ${hotel.name}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Input
            placeholder="Search Hotels"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md bg-white border border-gray-300 rounded-full py-2 px-4 shadow-sm focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <FilterSidebar filters={filters} onFiltersChange={setFilters} />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredHotels.length} Hotels Found
              </h2>
              <select
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option>Recommended</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Star Rating</option>
              </select>
            </div>

            {/* Hotel Cards */}
            {loading ? (
              <div className="text-center text-gray-600">Loading hotels...</div>
            ) : filteredHotels.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No hotels found</h3>
                <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters or search criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                {filteredHotels.map(hotel => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    onBookNow={handleBookNow}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}