"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Plus, Edit, Eye, Trash2, Users, Calendar, DollarSign } from "lucide-react"
import { Navbar } from "@/components/navbar"
import Link from "next/link"

interface Hotel {
  id: string
  name: string
  city: string
  state: string
  price_per_night: number
  star_rating: number
  images: string[]
  total_rooms: number
  available_rooms: number
  created_at: string
}

export default function OwnerDashboard() {
  const { user, userType, hotelOwnerProfile } = useAuth()
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalHotels: 0,
    totalBookings: 0,
    totalRevenue: 0,
    occupancyRate: 0,
  })

  useEffect(() => {
    if (user && userType === "hotel_owner") {
      fetchHotels()
      fetchStats()
    }
  }, [user, userType])

  const fetchHotels = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("hotels")
        .select("*")
        .eq("hotel_owner_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching hotels:", error)
        return
      }

      setHotels(data || [])
    } catch (error) {
      console.error("Error in fetchHotels:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Get total bookings and revenue
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("total_amount, booking_status")
        .in(
          "hotel_id",
          hotels.map((h) => h.id),
        )

      if (bookingsError) {
        console.error("Error fetching bookings stats:", bookingsError)
        return
      }

      const totalBookings = bookingsData?.length || 0
      const totalRevenue =
        bookingsData?.reduce(
          (sum, booking) => (booking.booking_status === "confirmed" ? sum + booking.total_amount : sum),
          0,
        ) || 0

      setStats((prev) => ({
        ...prev,
        totalHotels: hotels.length,
        totalBookings,
        totalRevenue,
        occupancyRate:
          hotels.length > 0
            ? (hotels.reduce((sum, hotel) => sum + (hotel.total_rooms - hotel.available_rooms), 0) /
                hotels.reduce((sum, hotel) => sum + hotel.total_rooms, 0)) *
              100
            : 0,
      }))
    } catch (error) {
      console.error("Error in fetchStats:", error)
    }
  }

  const handleDeleteHotel = async (hotelId: string) => {
    if (!confirm("Are you sure you want to delete this hotel? This action cannot be undone.")) {
      return
    }

    try {
      const { error } = await supabase.from("hotels").delete().eq("id", hotelId).eq("hotel_owner_id", user?.id)

      if (error) {
        console.error("Error deleting hotel:", error)
        alert("Failed to delete hotel")
        return
      }

      setHotels((prev) => prev.filter((hotel) => hotel.id !== hotelId))
      alert("Hotel deleted successfully")
    } catch (error) {
      console.error("Error in handleDeleteHotel:", error)
      alert("An error occurred while deleting the hotel")
    }
  }

  if (!user || userType !== "hotel_owner") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-gray-600">You need to be logged in as a hotel owner to access this page.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hotel Dashboard</h1>
              <p className="text-gray-600">Welcome back, {hotelOwnerProfile?.name}!</p>
            </div>
            <Button asChild className="bg-red-500 hover:bg-red-600 text-white">
              <Link href="/owner/add-hotel">
                <Plus className="w-4 h-4 mr-2" />
                Add New Hotel
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building2 className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Hotels</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalHotels}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.occupancyRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hotels List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Hotels</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading your hotels...</p>
              </div>
            ) : hotels.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No hotels found</h3>
                <p className="text-gray-600 mb-6">Start by adding your first hotel property.</p>
                <Button asChild className="bg-red-500 hover:bg-red-600 text-white">
                  <Link href="/owner/add-hotel">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Hotel
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {hotels.map((hotel) => (
                  <div key={hotel.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <img
                          src={hotel.images[0] || "/placeholder.svg?height=100&width=150"}
                          alt={hotel.name}
                          className="w-24 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <h3 className="font-semibold text-lg">{hotel.name}</h3>
                          <p className="text-gray-600">
                            {hotel.city}, {hotel.state}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center">
                              {[...Array(hotel.star_rating)].map((_, i) => (
                                <span key={i} className="text-yellow-400">
                                  ★
                                </span>
                              ))}
                            </div>
                            <Badge variant="secondary">₹{hotel.price_per_night.toLocaleString()}/night</Badge>
                            <Badge variant={hotel.available_rooms > 0 ? "default" : "destructive"}>
                              {hotel.available_rooms}/{hotel.total_rooms} available
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteHotel(hotel.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
