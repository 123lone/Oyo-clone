"use client"

import { useState, useEffect, use } from "react"
import { Navbar } from "@/components/navbar"
import { supabase } from "@/lib/supabase"
import { BookingModal } from "@/components/booking-modal"
import Link from "next/link"
import type { Hotel } from "@/lib/supabase"
import {
  FaMapMarkerAlt, FaStar, FaRupeeSign, FaBed, FaWifi, FaPaw, FaSwimmer,
  FaUtensils, FaSpa, FaCar, FaDumbbell, FaConciergeBell
} from "react-icons/fa"

interface HotelDetailsClientProps {
  params: Promise<{ slug: string }>
}

export default function HotelDetailsClient({ params }: HotelDetailsClientProps) {
  const resolvedParams = use(params)
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  // Fetch hotel data
  useEffect(() => {
    fetchHotelData()
  }, [resolvedParams.slug])

  const fetchHotelData = async () => {
    try {
      setLoading(true)
      setError(null) // Reset error state

      // Normalize the slug for better matching
      const searchName = resolvedParams.slug.replace(/-/g, " ").toLowerCase()
      console.log("Searching for hotel with name like:", searchName) // Debug log

      const { data, error } = await supabase
        .from("hotels")
        .select("*")
        .ilike("name", `%${searchName}%`)
        .single()

      if (error) {
        console.error("Supabase error:", error) // Debug log
        throw new Error(`Failed to fetch hotel: ${error.message}`)
      }

      if (!data) {
        throw new Error("Hotel not found")
      }

      console.log("Fetched hotel:", data) // Debug log
      setHotel(data)
    } catch (err: any) {
      console.error("Error fetching hotel data:", err)
      setError(err.message || "Error loading hotel details")
    } finally {
      setLoading(false)
    }
  }

  const handleBookNow = () => {
    if (hotel) {
      setIsBookingModalOpen(true)
    }
  }

  // Default search filters for the booking modal
  const defaultSearchFilters = {
    location: hotel?.city || "",
    checkIn: "",
    checkOut: "",
    guests: 1,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hotel details...</p>
        </div>
      </div>
    )
  }

  if (error || !hotel) {
    return (
      <div className="text-red-500 font-semibold text-center mt-10">
        {error || "Error loading hotel details"}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden relative">
          {/* Header Image with overlay */}
          <div className="relative">
            <img
              src={hotel.images[0] || "/placeholder.svg"}
              alt={hotel.name}
              className="w-full h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <h1 className="absolute bottom-4 left-6 text-4xl font-bold text-white drop-shadow-lg">
              {hotel.name}
            </h1>
            {/* Availability Badge */}
            {hotel.available_rooms < 5 && hotel.available_rooms > 0 && (
              <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Only {hotel.available_rooms} rooms left
              </div>
            )}
            {hotel.available_rooms === 0 && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Sold Out
              </div>
            )}
          </div>

          <div className="p-6 space-y-6">
            {/* Location */}
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <FaMapMarkerAlt className="mr-2 text-red-500" />
              <span className="text-lg">{hotel.address}, {hotel.city}, {hotel.state}</span>
            </div>

            {/* Description */}
            <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">{hotel.description}</p>

            {/* Stars & Price */}
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex space-x-1 text-yellow-500">
                {[...Array(hotel.star_rating)].map((_, i) => <FaStar key={i} />)}
              </div>
              <p className="text-xl font-semibold text-gray-800 dark:text-white">
                <FaRupeeSign className="inline-block mr-1" />
                {hotel.price_per_night.toLocaleString()} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/night</span>
              </p>
            </div>

            {/* Rooms */}
            <div className="flex justify-between flex-wrap border-t border-gray-200 dark:border-gray-700 pt-4 text-gray-700 dark:text-gray-300 gap-2">
              <p><strong>Available Rooms:</strong> {hotel.available_rooms} / {hotel.total_rooms}</p>
              <div className="flex flex-wrap gap-2">
                {hotel.room_types.map((type: string) => (
                  <span key={type} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {type}
                  </span>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Amenities</h2>
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-gray-700 dark:text-gray-300">
                {hotel.amenities.includes("WiFi") && <li className="flex items-center"><FaWifi className="mr-2 text-blue-500" />WiFi</li>}
                {hotel.amenities.includes("Restaurant") && <li className="flex items-center"><FaUtensils className="mr-2 text-orange-500" />Restaurant</li>}
                {hotel.amenities.includes("Pool") && <li className="flex items-center"><FaSwimmer className="mr-2 text-cyan-600" />Pool</li>}
                {hotel.amenities.includes("Spa") && <li className="flex items-center"><FaSpa className="mr-2 text-purple-500" />Spa</li>}
                {hotel.amenities.includes("AC") && <li className="flex items-center"><FaBed className="mr-2 text-gray-600" />AC</li>}
                {hotel.amenities.includes("Parking") && <li className="flex items-center"><FaCar className="mr-2 text-gray-700" />Parking</li>}
                {hotel.amenities.includes("Gym") && <li className="flex items-center"><FaDumbbell className="mr-2 text-red-600" />Gym</li>}
                {hotel.amenities.includes("Room Service") && <li className="flex items-center"><FaConciergeBell className="mr-2 text-amber-600" />Room Service</li>}
                {hotel.amenities.includes("Pet-friendly") && <li className="flex items-center"><FaPaw className="mr-2 text-pink-500" />Pet-friendly</li>}
              </ul>
            </div>

            {/* Coordinates */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 text-sm text-gray-500 dark:text-gray-400">
              <strong>Coordinates:</strong> Latitude: {hotel.latitude || "N/A"}, Longitude: {hotel.longitude || "N/A"}
            </div>

            {/* Buttons */}
            <div className="pt-6 px-6 text-right flex justify-end gap-4">
              <Link href={`/hotels/${resolvedParams.slug}/contact`}>
                <button
                  className="px-6 py-2 rounded-lg font-semibold shadow-lg transition bg-red-500 hover:bg-red-900 text-white"
                >
                  Contact Us
                </button>
              </Link>
              <button
                className={`px-6 py-2 rounded-full font-semibold shadow-lg transition ${
                  hotel.available_rooms === 0
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
                onClick={handleBookNow}
                disabled={hotel.available_rooms === 0}
              >
                {hotel.available_rooms === 0 ? "Sold Out" : "Book Now"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        hotel={hotel}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        searchFilters={defaultSearchFilters}
      />
    </div>
  )
}