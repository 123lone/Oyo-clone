import HotelContactClient from "@/components/hotel-contact-client"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Hotel Owner | Hotel Booking",
  description: "Send a message to the hotel owner for inquiries or special requests.",
}

export default function HotelContact({ params }: { params: Promise<{ slug: string }> }) {
  return <HotelContactClient params={params} />
}