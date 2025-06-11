"use client"

import { X, User, Building2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface UserTypeModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectType: (type: "customer" | "hotel_owner") => void
  mode: "login" | "signup"
}

export function UserTypeModal({ isOpen, onClose, onSelectType, mode }: UserTypeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {mode === "login" ? "How would you like to sign in?" : "How would you like to join?"}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onSelectType("customer")}>
            <CardContent className="p-6 text-center">
              <User className="w-12 h-12 mx-auto mb-4 text-blue-500" />
              <h3 className="font-semibold text-lg mb-2">Customer</h3>
              <p className="text-gray-600 text-sm">
                {mode === "login"
                  ? "Sign in to book hotels and manage your reservations"
                  : "Join as a customer to book amazing hotels across India"}
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onSelectType("hotel_owner")}
          >
            <CardContent className="p-6 text-center">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h3 className="font-semibold text-lg mb-2">Hotel Owner</h3>
              <p className="text-gray-600 text-sm">
                {mode === "login"
                  ? "Sign in to manage your hotels and bookings"
                  : "Join as a hotel owner to list your properties and manage bookings"}
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
