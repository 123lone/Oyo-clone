"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, CreditCard, Phone, Mail, X ,DoorOpen} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Booking {
  id: string
  hotel_id: string
  check_in_date: string
  check_out_date: string
  guests: number
  room_type: string
  total_amount: number
  payment_status: string
  booking_status: string
  user_name: string
  user_email: string
  user_phone: string
  created_at: string
  number_of_rooms: number
  hotels: {
    name: string
    city: string
    state: string
    images: string[]
    address: string
    star_rating: number
  }
}

export default function MyBookingsPage() {
  const { user, userProfile } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingBooking, setCancellingBooking] = useState<string | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null)

  useEffect(() => {
    if (user) {
      fetchBookings()
    }
  }, [user])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          hotels (
            name,
            city,
            state,
            images,
            address,
            star_rating
          )
        `,
        )
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (booking: Booking) => {
    setBookingToCancel(booking)
    setShowCancelDialog(true)
  }

  const confirmCancelBooking = async () => {
  if (!bookingToCancel) return

  try {
    setCancellingBooking(bookingToCancel.id)

    const { error } = await supabase
      .from("bookings")
      .update({
        booking_status: "cancelled",
        // removed updated_at since it doesn't exist in the schema
      })
      .eq("id", bookingToCancel.id)

    if (error) throw error

    // Update local state
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === bookingToCancel.id ? { ...booking, booking_status: "cancelled" } : booking,
      ),
    )

    alert("Booking cancelled successfully!")
  } catch (error) {
    console.error("Error cancelling booking:", error)
    alert("Failed to cancel booking. Please try again.")
  } finally {
    setCancellingBooking(null)
    setShowCancelDialog(false)
    setBookingToCancel(null)
  }
}

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const calculateNights = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const canCancelBooking = (booking: Booking) => {
    const checkInDate = new Date(booking.check_in_date)
    const today = new Date()
    const daysDifference = Math.ceil((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    return booking.booking_status === "confirmed" && daysDifference > 1
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please login to view your bookings</h1>
            <p className="text-gray-600">You need to be logged in to access this page.</p>
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
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600">Manage your hotel reservations</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600 mb-6">You haven't made any hotel bookings yet.</p>
              <Button className="bg-red-500 hover:bg-red-600 text-white">Browse Hotels</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row">
                    {/* Hotel Image */}
                    <div className="lg:w-1/4">
                      <img
                        src={booking.hotels.images[0] || "/placeholder.svg?height=200&width=300"}
                        alt={booking.hotels.name}
                        className="w-full h-48 lg:h-full object-cover"
                      />
                    </div>

                    {/* Booking Details */}
                    <div className="lg:w-3/4 p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-1">
                          {/* Hotel Info */}
                          <div className="mb-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{booking.hotels.name}</h3>
                            <div className="flex items-center text-gray-600 mb-2">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>
                                {booking.hotels.city}, {booking.hotels.state}
                              </span>
                            </div>
                            <div className="flex items-center">
                              {[...Array(booking.hotels.star_rating)].map((_, i) => (
                                <span key={i} className="text-yellow-400">
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Booking Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>Check-in: {new Date(booking.check_in_date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>Check-out: {new Date(booking.check_out_date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Users className="w-4 h-4 mr-2" />
                                <span>
                                  {booking.guests} Guest{booking.guests > 1 ? "s" : ""}
                                </span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <DoorOpen className="w-4 h-4 mr-2" />
                                <span>
                                  Number of room{booking.guests > 1 ? "s" : ""}:{booking.number_of_rooms} 
                                </span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <span className="font-medium">Room Type: </span>
                                <span className="ml-1">{booking.room_type}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <span className="font-medium">Nights: </span>
                                <span className="ml-1">
                                  {calculateNights(booking.check_in_date, booking.check_out_date)}
                                </span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <CreditCard className="w-4 h-4 mr-2" />
                                <span className="font-bold">₹{booking.total_amount.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Guest Info */}
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Guest Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                              <div className="flex items-center">
                                <span className="font-medium">Name: </span>
                                <span className="ml-1">{booking.user_name}</span>
                              </div>
                              <div className="flex items-center">
                                <Mail className="w-4 h-4 mr-1" />
                                <span>{booking.user_email}</span>
                              </div>
                              {booking.user_phone && (
                                <div className="flex items-center">
                                  <Phone className="w-4 h-4 mr-1" />
                                  <span>{booking.user_phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status and Actions */}
                        <div className="lg:ml-6 flex flex-col items-end space-y-3">
                          <div className="flex flex-col items-end space-y-2">
                            <Badge className={getStatusColor(booking.booking_status)}>
                              {booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1)}
                            </Badge>
                            <Badge className={getPaymentStatusColor(booking.payment_status)}>
                              Payment:{" "}
                              {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                            </Badge>
                          </div>

                          <div className="text-xs text-gray-500">
                            Booked on: {new Date(booking.created_at).toLocaleDateString()}
                          </div>

                          {canCancelBooking(booking) && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancelBooking(booking)}
                              disabled={cancellingBooking === booking.id}
                            >
                              {cancellingBooking === booking.id ? "Cancelling..." : "Cancel Booking"}
                            </Button>
                          )}

                          {booking.booking_status === "cancelled" && (
                            <p className="text-xs text-red-600">Booking was cancelled</p>
                          )}

                          {!canCancelBooking(booking) && booking.booking_status === "confirmed" && (
                            <p className="text-xs text-gray-500">Cannot cancel (check-in within 24 hours)</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Cancel Confirmation Dialog */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                Cancel Booking
                <Button variant="ghost" size="sm" onClick={() => setShowCancelDialog(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to cancel your booking at{" "}
                <span className="font-semibold">{bookingToCancel?.hotels.name}</span>?
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Cancellation Policy:</strong> Free cancellation up to 24 hours before check-in. Refunds will
                  be processed according to the payment method used.
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                  Keep Booking
                </Button>
                <Button variant="destructive" onClick={confirmCancelBooking} disabled={cancellingBooking !== null}>
                  {cancellingBooking ? "Cancelling..." : "Yes, Cancel Booking"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
