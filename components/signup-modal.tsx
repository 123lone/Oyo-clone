"use client"

import type React from "react"

import { useState } from "react"
import { X, Mail, Lock, User, Eye, EyeOff, ArrowLeft, Building2, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToLogin: () => void
  userType?: "customer" | "hotel_owner"
  onBackToTypeSelection?: () => void
}

export function SignupModal({ isOpen, onClose, onSwitchToLogin, userType, onBackToTypeSelection }: SignupModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    businessLicense: "",
  })
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userType) return

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters long")
      return
    }

    setLoading(true)

    try {
      const businessData =
        userType === "hotel_owner"
          ? {
              businessName: formData.businessName,
              businessLicense: formData.businessLicense,
            }
          : undefined

      const { error } = await signUp(formData.email, formData.password, formData.name, userType, businessData)

      if (error) {
        console.error("Signup error:", error)
        alert("Signup failed: " + error.message)
      } else {
        console.log("Signup successful")
        alert("Signup successful! Please check your email for verification.")
        onClose()
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          businessName: "",
          businessLicense: "",
        })
      }
    } catch (error) {
      console.error("Signup exception:", error)
      alert("An error occurred during signup")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getUserTypeTitle = () => {
    if (userType === "hotel_owner") return "Create Hotel Owner Account"
    return "Create Customer Account"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center">
              {onBackToTypeSelection && (
                <Button variant="ghost" size="sm" onClick={onBackToTypeSelection} className="mr-2">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              {userType ? getUserTypeTitle() : "Create Account"}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {userType === "hotel_owner" && (
            <>
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="businessName"
                    type="text"
                    placeholder="Enter your business name"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange("businessName", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="businessLicense">Business License Number</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="businessLicense"
                    type="text"
                    placeholder="Enter your business license number"
                    value={formData.businessLicense}
                    onChange={(e) => handleInputChange("businessLicense", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 h-full px-3"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input type="checkbox" className="mr-2" required />
            <span className="text-sm text-gray-600">
              I agree to the{" "}
              <a href="#" className="text-red-500 hover:text-red-600">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-red-500 hover:text-red-600">
                Privacy Policy
              </a>
            </span>
          </div>

          <Button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 text-white"
            disabled={loading || !userType}
          >
            {loading ? "Creating account..." : "Create Account"}
          </Button>

          <div className="text-center">
            <span className="text-sm text-gray-600">Already have an account? </span>
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-sm text-red-500 hover:text-red-600 font-medium"
            >
              Sign in
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
