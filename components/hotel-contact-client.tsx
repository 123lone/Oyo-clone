"use client"

import { useState, useEffect, use } from "react"
import { Navbar } from "@/components/navbar"
import { supabase } from "@/lib/supabase"
import ContactForm from "@/components/contact-form"
import type { Hotel } from "@/lib/supabase"

interface HotelContactClientProps {
  params: Promise<{ slug: string }>
}

export default function HotelContactClient({ params }: HotelContactClientProps) {
  const resolvedParams = use(params)
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [userEmail, setUserEmail] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  console.log("Resolved params slug:", resolvedParams.slug)

  // Fetch user email, hotel data, and validate hotel owner
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        console.log("Fetching user email...")

        // Fetch user email
        const { data: { user } } = await supabase.auth.getUser()
        console.log("User email fetched:", user?.email)
        setUserEmail(user?.email || "")

        // Prepare the search pattern
        const searchPattern = resolvedParams.slug.replace(/-/g, " ")
        // const searchPattern = "taj west end" // Hardcode for testing
        console.log("Search pattern:", searchPattern)

        // Fetch hotel data with owner details
        console.log("Fetching hotel data for pattern:", `%${searchPattern}%`)
        const { data: hotelData, error: hotelError } = await supabase
          .from("hotels")
          .select(`
            *,
            hotel_owners (
              id,
              email
            )
          `)
          .ilike("name", `%${searchPattern}%`)

        console.log("Hotel data:", hotelData)
        console.log("Hotel error:", hotelError)

        if (hotelError || !hotelData || hotelData.length === 0) {
          console.log("Setting error: Hotel not found")
          setError("Hotel not found")
          return
        }

        const hotel = hotelData[0] // Take the first match
        if (!hotel.hotel_owners) {
          console.log("Setting error: Could not find hotel owner")
          setError("Could not find hotel owner")
          return
        }

        console.log("Setting hotel data")
        setHotel(hotel)
      } catch (err) {
        console.log("Caught error:", err)
        setError("Error loading hotel details")
      } finally {
        console.log("Setting loading to false")
        setLoading(false)
      }
    }
    fetchData()
  }, [resolvedParams.slug])

  const handleCloseForm = () => {
    // Redirect back to hotel details page after submission
    window.location.href = `/hotels/${resolvedParams.slug}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {console.log("Rendering ContactForm with hotel:", hotel)}
          <ContactForm
            onClose={handleCloseForm}
            userEmail={userEmail}
            hotel={hotel}
          />
        </div>
      </div>
    </div>
  )
}