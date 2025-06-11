
"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { SearchHero, type SearchFilters } from "@/components/search-hero"
import { FilterSidebar, type FilterState } from "@/components/filter-sidebar"
import { HotelCard } from "@/components/hotel-card"
import { BookingModal } from "@/components/booking-modal"
import { Pagination } from "@/components/pagination"
import { type Hotel, supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    location: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
  })
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 50000],
    starRating: [],
    roomTypes: [],
    amenities: [],
  })
  const [sortOption, setSortOption] = useState<string>("Recommended")

  // State for number of hotels per page, dynamic based on screen size
  const [hotelsPerPage, setHotelsPerPage] = useState(6)

  // Dynamic Hotels Per Page Logic
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setHotelsPerPage(4)
      } else {
        setHotelsPerPage(6)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Fetch hotels from Supabase
  useEffect(() => {
    fetchHotels()
  }, [])

  // Apply filters and sort whenever filters, search, or sort option changes
  useEffect(() => {
    applyFiltersAndSort()
  }, [hotels, filters, searchFilters, sortOption])

  const fetchHotels = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("hotels")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setHotels(data || [])
    } catch (error) {
      console.error("Error fetching hotels:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSort = () => {
    let filtered = [...hotels]

    // Location filter
    if (searchFilters.location) {
      filtered = filtered.filter(
        (hotel) =>
          hotel.city.toLowerCase().includes(searchFilters.location.toLowerCase()) ||
          hotel.state.toLowerCase().includes(searchFilters.location.toLowerCase()) ||
          hotel.name.toLowerCase().includes(searchFilters.location.toLowerCase())
      )
    }

    // Price range filter
    filtered = filtered.filter(
      (hotel) => hotel.price_per_night >= filters.priceRange[0] && hotel.price_per_night <= filters.priceRange[1]
    )

    // Star rating filter
    if (filters.starRating.length > 0) {
      filtered = filtered.filter((hotel) => filters.starRating.includes(hotel.star_rating))
    }

    // Room type filter
    if (filters.roomTypes.length > 0) {
      filtered = filtered.filter((hotel) => filters.roomTypes.some((roomType) => hotel.room_types.includes(roomType)))
    }

    // Amenities filter
    if (filters.amenities.length > 0) {
      filtered = filtered.filter((hotel) => filters.amenities.every((amenity) => hotel.amenities.includes(amenity)))
    }

    // Sort the filtered hotels based on sortOption
    let sorted = [...filtered]
    switch (sortOption) {
      case "Price: Low to High":
        sorted.sort((a, b) => a.price_per_night - b.price_per_night)
        break
      case "Price: High to Low":
        sorted.sort((a, b) => b.price_per_night - a.price_per_night)
        break
      case "Star Rating":
        sorted.sort((a, b) => b.star_rating - a.star_rating) // Descending (5-star first)
        break
      case "Recommended":
      default:
        // Maintain default order from Supabase (created_at descending)
        break
    }

    setFilteredHotels(sorted)
    setCurrentPage(1) // Reset to first page when filters or sort change
  }

  const handleSearch = (newSearchFilters: SearchFilters) => {
    setSearchFilters(newSearchFilters)
  }

  const handleBookNow = (hotel: Hotel) => {
    setSelectedHotel(hotel)
    setIsBookingModalOpen(true)
  }

  const handleViewDetails = (hotel: Hotel) => {
    alert(`View details for ${hotel.name}`)
  }

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(event.target.value)
  }

  const totalPages = Math.ceil(filteredHotels.length / hotelsPerPage)
  const startIndex = (currentPage - 1) * hotelsPerPage
  const endIndex = startIndex + hotelsPerPage
  const currentHotels = filteredHotels.slice(startIndex, endIndex)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <SearchHero onSearch={handleSearch} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <FilterSidebar filters={filters} onFiltersChange={setFilters} />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredHotels.length} Hotels Found
                {searchFilters.location && ` in ${searchFilters.location}`}
              </h2>
              <select
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={sortOption}
                onChange={handleSortChange}
              >
                <option>Sort by: Recommended</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Star Rating</option>
              </select>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                <span className="ml-2 text-gray-600">Loading hotels...</span>
              </div>
            )}

            {/* Hotels Grid */}
            {!loading && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols- gap-6">
                  {currentHotels.map((hotel) => (
                    <HotelCard
                      key={hotel.id}
                      hotel={hotel}
                      onBookNow={handleBookNow}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>

                {/* No Results */}
                {filteredHotels.length === 0 && (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No hotels found</h3>
                    <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters or search criteria</p>
                  </div>
                )}

                {/* Pagination */}
                {filteredHotels.length > 0 && (
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">HotelBook</h3>
              <p className="text-gray-400">Find and book the perfect hotel for your stay across India.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Press
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Safety
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 HotelBook. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Booking Modal */}
      <BookingModal
        hotel={selectedHotel}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        searchFilters={searchFilters}
      />
    </div>
  )
}
