"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  hotelOwnerProfile: HotelOwnerProfile | null
  userType: "customer" | "hotel_owner" | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (
    email: string,
    password: string,
    name: string,
    userType: "customer" | "hotel_owner",
    businessData?: BusinessData,
  ) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: any }>
  updateHotelOwnerProfile: (data: Partial<HotelOwnerProfile>) => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
}

interface UserProfile {
  id: string
  email: string
  name: string
  phone?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

interface HotelOwnerProfile {
  id: string
  email: string
  name: string
  phone?: string
  business_name?: string
  business_license?: string
  avatar_url?: string
  verification_status: string
  created_at: string
  updated_at: string
}

interface BusinessData {
  businessName: string
  businessLicense: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [hotelOwnerProfile, setHotelOwnerProfile] = useState<HotelOwnerProfile | null>(null)
  const [userType, setUserType] = useState<"customer" | "hotel_owner" | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchUserData(session.user.id)
      }
    } catch (error) {
      console.error("Error initializing auth:", error)
    } finally {
      setLoading(false)
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchUserData(session.user.id)
        } else {
          clearUserData()
        }
      } catch (error) {
        console.error("Error in auth state change:", error)
      } finally {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }

  const clearUserData = () => {
    setUserProfile(null)
    setHotelOwnerProfile(null)
    setUserType(null)
  }

  const fetchUserData = async (userId: string) => {
    try {
      // Get user type
      const { data: userTypeData, error: userTypeError } = await supabase
        .from("user_types")
        .select("user_type")
        .eq("user_id", userId)
        .single()

      if (userTypeError) {
        console.error("Error fetching user type:", userTypeError)
        return
      }

      const currentUserType = userTypeData?.user_type || "customer"
      setUserType(currentUserType)

      if (currentUserType === "hotel_owner") {
        await fetchHotelOwnerProfile(userId)
      } else {
        await fetchUserProfile(userId)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("user_profiles").select("*").eq("id", userId).single()

      if (error) {
        console.error("Error fetching user profile:", error)
        return
      }

      setUserProfile(data)
    } catch (error) {
      console.error("Error in fetchUserProfile:", error)
    }
  }

  const fetchHotelOwnerProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("hotel_owners").select("*").eq("id", userId).single()

      if (error) {
        console.error("Error fetching hotel owner profile:", error)
        return
      }

      setHotelOwnerProfile(data)
    } catch (error) {
      console.error("Error in fetchHotelOwnerProfile:", error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error }
    } catch (error) {
      console.error("Error in signIn:", error)
      return { error }
    }
  }

  const signUp = async (
    email: string,
    password: string,
    name: string,
    userType: "customer" | "hotel_owner",
    businessData?: BusinessData,
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            userType,
            ...(businessData && {
              businessName: businessData.businessName,
              businessLicense: businessData.businessLicense,
            }),
          },
        },
      })

      return { error }
    } catch (error) {
      console.error("Error in signUp:", error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      clearUserData()
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Error signing out:", error)
      }

      // Always redirect to home
      window.location.href = "/"
    } catch (error) {
      console.error("Error in signOut:", error)
      window.location.href = "/"
    }
  }

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    try {
      if (!user) return { error: new Error("No user logged in") }

      const { error } = await supabase
        .from("user_profiles")
        .update({ ...profileData, updated_at: new Date().toISOString() })
        .eq("id", user.id)

      if (!error) {
        setUserProfile((prev) => (prev ? { ...prev, ...profileData } : null))
      }

      return { error }
    } catch (error) {
      console.error("Error updating profile:", error)
      return { error }
    }
  }

  const updateHotelOwnerProfile = async (profileData: Partial<HotelOwnerProfile>) => {
    try {
      if (!user) return { error: new Error("No user logged in") }

      const { error } = await supabase
        .from("hotel_owners")
        .update({ ...profileData, updated_at: new Date().toISOString() })
        .eq("id", user.id)

      if (!error) {
        setHotelOwnerProfile((prev) => (prev ? { ...prev, ...profileData } : null))
      }

      return { error }
    } catch (error) {
      console.error("Error updating hotel owner profile:", error)
      return { error }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      return { error }
    } catch (error) {
      console.error("Error resetting password:", error)
      return { error }
    }
  }

  const value = {
    user,
    userProfile,
    hotelOwnerProfile,
    userType,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updateHotelOwnerProfile,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
