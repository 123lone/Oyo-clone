import { createClient } from "@supabase/supabase-js"
import { config } from "./config"

export const supabase = createClient(config.supabase.url, config.supabase.anonKey)

export type Hotel = {
  id: string
  name: string
  description: string
  city: string
  state: string
  address: string
  latitude: number
  longitude: number
  star_rating: number
  price_per_night: number
  images: string[]
  amenities: string[]
  room_types: string[]
  total_rooms: number
  available_rooms: number
  created_at: string
  updated_at: string
}

export type Booking = {
  id: string
  hotel_id: string
  user_email: string
  user_name: string
  user_phone: string
  check_in_date: string
  check_out_date: string
  guests: number
  room_type: string
  total_amount: number
  payment_status: string
  payment_id: string
  booking_status: string
  created_at: string
}
