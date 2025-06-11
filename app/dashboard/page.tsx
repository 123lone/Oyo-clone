"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, CreditCard, User, Settings } from "lucide-react"
import { Navbar } from "@/components/navbar"

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
  created_at: string
  hotels: {
    name: string
    city: string
    state: string
    images: string[]
  }
}

export default function DashboardPage() {
  const { user, userProfile, updateProfile } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState({
    name: userProfile?.name || "",
    phone: userProfile?.phone || "",
  })

  useEffect(() => {
    if (user) {
      fetchBookings()
    }
  }, [user])

  useEffect(() => {
    if (userProfile) {
      setProfileData({
        name: userProfile.name,
        phone: userProfile.phone || "",
      })
    }
  }, [userProfile])

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          hotels (
            name,
            city,
            state,
            images
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

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await updateProfile(profileData)
    if (error) {
      alert("Failed to update profile: " + error.message)
    } else {
      alert("Profile updated successfully!")
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please login to access your dashboard</h1>
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
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userProfile?.name}!</h1>
          <p className="text-gray-600">Manage your bookings and profile settings</p>
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="bookings" className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              My Bookings
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Your Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading bookings...</div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No bookings found</p>
                    <Button className="mt-4 bg-red-500 hover:bg-red-600">Book Your First Hotel</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <Card key={booking.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                              <img
                                src={booking.hotels.images[0] || "/placeholder.svg"}
                                alt={booking.hotels.name}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                              <div>
                                <h3 className="font-semibold text-lg">{booking.hotels.name}</h3>
                                <div className="flex items-center text-gray-600 mb-2">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {booking.hotels.city}, {booking.hotels.state}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {booking.check_in_date} to {booking.check_out_date}
                                  </div>
                                  <div className="flex items-center">
                                    <Users className="w-4 h-4 mr-1" />
                                    {booking.guests} guests
                                  </div>
                                  <div className="flex items-center">
                                    <CreditCard className="w-4 h-4 mr-1" />₹{booking.total_amount.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge
                                variant={
                                  booking.booking_status === "confirmed"
                                    ? "default"
                                    : booking.booking_status === "cancelled"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {booking.booking_status}
                              </Badge>
                              <div className="mt-2">
                                <Badge
                                  variant={
                                    booking.payment_status === "completed"
                                      ? "default"
                                      : booking.payment_status === "pending"
                                        ? "secondary"
                                        : "destructive"
                                  }
                                >
                                  {booking.payment_status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={userProfile?.email || ""} disabled className="bg-gray-100" />
                    <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <Button type="submit" className="bg-red-500 hover:bg-red-600 text-white">
                    Update Profile
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Account Information</h3>
                    <p className="text-sm text-gray-600">
                      Account created: {new Date(userProfile?.created_at || "").toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">User ID: {user.id}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Danger Zone</h3>
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
