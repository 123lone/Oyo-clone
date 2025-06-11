"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import ContactForm from "@/components/contact-form"
import { supabase } from "@/lib/supabase"

export default function ContactClient() {
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string>("")

  // Fetch user email from Supabase auth
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        setUserEmail(user?.email || "")
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [])

  const handleCloseForm = () => {
    // Optionally redirect or refresh the page after form submission
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {isLoading ? (
            <div className="text-center text-gray-600 dark:text-gray-400">
              <div className="w-8 h-8 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin mx-auto mb-2" />
              Loading form...
            </div>
          ) : (
            <ContactForm
              onClose={handleCloseForm}
              userEmail={userEmail}
            />
          )}
        </div>
      </div>
    </div>
  )
}