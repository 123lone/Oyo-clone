"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { X, CreditCard } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { type Hotel, supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { usePayPal } from "@/hooks/use-paypal"

interface BookingModalProps {
  hotel: Hotel | null
  isOpen: boolean
  onClose: () => void
  searchFilters?: {
    checkIn: string
    checkOut: string
    guests: number
  }
}

export function BookingModal({ hotel, isOpen, onClose, searchFilters }: BookingModalProps) {
  const { user, userProfile } = useAuth()
  const { isLoaded: isPayPalLoaded, isLoading: isPayPalLoading } = usePayPal()
  const paypalContainerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
    numberOfRooms: 1,
    roomType: "",
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "manual">("manual")
  const [error, setError] = useState<string | null>(null)

  // Handle component mounting
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && hotel && mounted) {
      setFormData({
        name: userProfile?.name || "",
        email: userProfile?.email || "",
        phone: userProfile?.phone || "",
        checkIn: searchFilters?.checkIn || "",
        checkOut: searchFilters?.checkOut || "",
        guests: searchFilters?.guests || 1,
        numberOfRooms: 1,
        roomType: hotel.room_types?.[0] || "",
      })
      setError(null)
    }
  }, [isOpen, hotel, userProfile, searchFilters, mounted])

  const calculateNights = useCallback(() => {
    if (!formData.checkIn || !formData.checkOut) return 0
    
    try {
      const checkIn = new Date(formData.checkIn)
      const checkOut = new Date(formData.checkOut)
      
      if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return 0
      if (checkOut <= checkIn) return 0
      
      const diffTime = checkOut.getTime() - checkIn.getTime()
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    } catch {
      return 0
    }
  }, [formData.checkIn, formData.checkOut])

  const nights = calculateNights()
  const totalAmount = hotel ? nights * hotel.price_per_night * formData.numberOfRooms : 0

  const handleInputChange = useCallback((field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError(null)
  }, [])

  const validateForm = useCallback(() => {
    if (!formData.name.trim()) return "Please enter your full name"
    if (!formData.email.trim()) return "Please enter your email"
    if (!formData.phone.trim()) return "Please enter your phone number"
    if (!formData.checkIn) return "Please select check-in date"
    if (!formData.checkOut) return "Please select check-out date"
    if (nights <= 0) return "Check-out date must be after check-in date"
    return null
  }, [formData, nights])

  const handleBooking = useCallback(async () => {
    if (!hotel || !user || isLoading) return

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const bookingData = {
        user_id: user.id,
        hotel_id: hotel.id,
        user_name: formData.name.trim(),
        user_email: formData.email.trim(),
        user_phone: formData.phone.trim(),
        check_in_date: formData.checkIn,
        check_out_date: formData.checkOut,
        guests: formData.guests,
        number_of_rooms: formData.numberOfRooms,
        room_type: formData.roomType,
        payment_status: "pending",
        booking_status: paymentMethod === "manual" ? "confirmed" : "pending",
        total_amount: totalAmount,
      }

      const { data, error: supabaseError } = await supabase
        .from("bookings")
        .insert([bookingData])
        .select()
        .single()

      if (supabaseError) throw supabaseError
      if (!data) throw new Error("No booking data returned")

      if (paymentMethod === "manual") {
        // Update to confirmed for manual payment
        await supabase
          .from("bookings")
          .update({ payment_status: "pending", booking_status: "confirmed" })
          .eq("id", data.id)
        
        alert("Booking confirmed! Please pay at the hotel.")
        onClose()
      } else {
        // For PayPal, the payment will be handled by PayPal buttons
        alert("Booking created! Complete payment with PayPal below.")
      }
    } catch (err) {
      console.error("Booking error:", err)
      setError(err instanceof Error ? err.message : "Booking failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [hotel, user, formData, paymentMethod, totalAmount, nights, validateForm, onClose, isLoading])

  // Clean up PayPal buttons when payment method changes
  useEffect(() => {
    if (paypalContainerRef.current && paymentMethod !== "paypal") {
      paypalContainerRef.current.innerHTML = ""
    }
  }, [paymentMethod])

  const renderPayPalButtons = useCallback(() => {
    if (!isPayPalLoaded || !window.paypal || !hotel || !user) return

    const container = paypalContainerRef.current
    if (!container) return

    // Clear existing buttons
    container.innerHTML = ""

    try {
      window.paypal.Buttons({
        createOrder: (_: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: totalAmount.toFixed(2),
                currency_code: "USD",
              },
              description: `Hotel booking for ${hotel.name}`,
            }],
          })
        },
        onApprove: async (data: any, actions: any) => {
          try {
            const order = await actions.order.capture()
            
            // Find the most recent booking for this user and hotel
            const { data: bookings } = await supabase
              .from("bookings")
              .select("*")
              .eq("user_id", user.id)
              .eq("hotel_id", hotel.id)
              .eq("payment_status", "pending")
              .order("created_at", { ascending: false })
              .limit(1)

            if (bookings && bookings.length > 0) {
              await supabase
                .from("bookings")
                .update({
                  payment_status: "completed",
                  payment_id: order.id,
                  booking_status: "confirmed",
                })
                .eq("id", bookings[0].id)
            }

            alert("Payment successful! Your booking is confirmed.")
            onClose()
          } catch (err) {
            console.error("Payment processing error:", err)
            alert("Payment completed but there was an issue updating your booking. Please contact support.")
          }
        },
        onError: (err: any) => {
          console.error("PayPal error:", err)
          setError("Payment failed. Please try again.")
        },
        onCancel: () => {
          setError("Payment was cancelled.")
        },
      }).render(container)
    } catch (err) {
      console.error("PayPal render error:", err)
      setError("Unable to load PayPal. Please try manual payment.")
    }
  }, [isPayPalLoaded, hotel, user, totalAmount, onClose])

  // Render PayPal buttons when conditions are met
  useEffect(() => {
    if (paymentMethod === "paypal" && isPayPalLoaded && mounted) {
      const timer = setTimeout(renderPayPalButtons, 100)
      return () => clearTimeout(timer)
    }
  }, [paymentMethod, isPayPalLoaded, renderPayPalButtons, mounted])

  if (!mounted || !hotel) return null

  if (!user) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">Please login to book a hotel.</p>
            <Button onClick={onClose} className="bg-red-500 hover:bg-red-600 text-white">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const isFormValid = formData.name.trim() && 
                     formData.email.trim() && 
                     formData.phone.trim() && 
                     formData.checkIn && 
                     formData.checkOut && 
                     nights > 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Book Your Stay
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Hotel Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <img
                  src={hotel.images?.[0] || "/placeholder.svg"}
                  alt={hotel.name}
                  className="w-24 h-24 object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg"
                  }}
                />
                <div>
                  <h3 className="font-semibold text-lg">{hotel.name}</h3>
                  <p className="text-gray-600">{hotel.city}, {hotel.state}</p>
                  <p className="text-lg font-bold text-red-500">
                    ₹{hotel.price_per_night?.toLocaleString() || 0}/night
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="roomType">Room Type</Label>
              <select
                id="roomType"
                value={formData.roomType}
                onChange={(e) => handleInputChange("roomType", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md disabled:opacity-50"
                disabled={isLoading}
              >
                {hotel.room_types?.map((type) => (
                  <option key={type} value={type}>{type}</option>
                )) || <option value="">No room types available</option>}
              </select>
            </div>
            <div>
              <Label htmlFor="checkIn">Check-in Date *</Label>
              <Input
                id="checkIn"
                type="date"
                value={formData.checkIn}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => handleInputChange("checkIn", e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="checkOut">Check-out Date *</Label>
              <Input
                id="checkOut"
                type="date"
                value={formData.checkOut}
                min={formData.checkIn || new Date().toISOString().split('T')[0]}
                onChange={(e) => handleInputChange("checkOut", e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="guests">Number of Guests</Label>
              <select
                id="guests"
                value={formData.guests}
                onChange={(e) => handleInputChange("guests", Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md disabled:opacity-50"
                disabled={isLoading}
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} Guest{num > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="numberOfRooms">Number of Rooms</Label>
              <select
                id="numberOfRooms"
                value={formData.numberOfRooms}
                onChange={(e) => handleInputChange("numberOfRooms", Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md disabled:opacity-50"
                disabled={isLoading}
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} Room{num > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Booking Summary */}
          {nights > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Booking Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Room Rate (per night)</span>
                    <span>₹{hotel.price_per_night?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Number of Nights</span>
                    <span>{nights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Number of Rooms</span>
                    <span>{formData.numberOfRooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Room Type</span>
                    <span>{formData.roomType || "Not selected"}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total Amount</span>
                    <span>₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Section */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Method
            </h3>

            <div className="space-y-4">
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="manual"
                    checked={paymentMethod === "manual"}
                    onChange={(e) => setPaymentMethod(e.target.value as "manual")}
                    disabled={isLoading}
                    className="mr-2"
                  />
                  Pay at Hotel
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === "paypal"}
                    onChange={(e) => setPaymentMethod(e.target.value as "paypal")}
                    disabled={isLoading || !isPayPalLoaded}
                    className="mr-2"
                  />
                  PayPal {isPayPalLoading ? "(Loading...)" : !isPayPalLoaded ? "(Unavailable)" : ""}
                </label>
              </div>

              {paymentMethod === "paypal" && (
                <div>
                  {isPayPalLoaded ? (
                    <div>
                      <div ref={paypalContainerRef} className="min-h-[50px]"></div>
                      <p className="text-sm text-gray-600 mt-2">
                        Complete your booking first, then use PayPal to pay.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-yellow-800 text-sm">
                        PayPal is not available. Please choose "Pay at Hotel".
                      </p>
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={handleBooking}
                disabled={isLoading || !isFormValid}
                className="w-full bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
              >
                {isLoading ? "Processing..." : "Create Booking"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}