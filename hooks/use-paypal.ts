"use client"

import { useEffect, useState } from "react"

export function usePayPal() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

    // Don't load PayPal if no client ID is provided
    if (!clientId || clientId === "YOUR_PAYPAL_CLIENT_ID") {
      console.warn("PayPal client ID not configured. Payment functionality will be disabled.")
      return
    }

    // Check if PayPal is already loaded
    if (window.paypal) {
      setIsLoaded(true)
      return
    }

    // Check if script is already being loaded
    if (document.querySelector('script[src*="paypal.com/sdk"]')) {
      return
    }

    setIsLoading(true)

    const script = document.createElement("script")
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`
    script.async = true

    script.onload = () => {
      setIsLoaded(true)
      setIsLoading(false)
    }

    script.onerror = () => {
      console.error("Failed to load PayPal SDK")
      setIsLoading(false)
    }

    document.head.appendChild(script)

    return () => {
      // Cleanup if component unmounts
      const existingScript = document.querySelector('script[src*="paypal.com/sdk"]')
      if (existingScript) {
        document.head.removeChild(existingScript)
      }
    }
  }, [])

  return { isLoaded, isLoading }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    paypal?: any
  }
}
