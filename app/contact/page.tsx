import { Metadata } from "next"
import ContactClient from "@/components/hotel-contact-client"

export const metadata: Metadata = {
  title: "Contact Us | Hotel Booking",
  description: "Get in touch with our support team for any inquiries or assistance.",
}

export default function Contact() {
  return <ContactClient />
}