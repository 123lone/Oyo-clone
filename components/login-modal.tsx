"use client"

import type React from "react"

import { useState } from "react"
import { X, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToSignup: () => void
  userType?: "customer" | "hotel_owner"
  onBackToTypeSelection?: () => void
}

export function LoginModal({ isOpen, onClose, onSwitchToSignup, userType, onBackToTypeSelection }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userType) return

    setLoading(true)

    try {
      const { error } = await signIn(formData.email, formData.password, userType)

      if (error) {
        alert("Login failed: " + error.message)
      } else {
        alert("Login successful!")
        onClose()
        setFormData({ email: "", password: "" })
      }
    } catch (error) {
      alert("An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getUserTypeTitle = () => {
    if (userType === "hotel_owner") return "Hotel Owner Login"
    return "Customer Login"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center">
              {onBackToTypeSelection && (
                <Button variant="ghost" size="sm" onClick={onBackToTypeSelection} className="mr-2">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              {userType ? getUserTypeTitle() : "Welcome Back"}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
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

          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm">
              <input type="checkbox" className="mr-2" />
              Remember me
            </label>
            <a href="#" className="text-sm text-red-500 hover:text-red-600">
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 text-white"
            disabled={loading || !userType}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <div className="text-center">
            <span className="text-sm text-gray-600">Don't have an account? </span>
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-sm text-red-500 hover:text-red-600 font-medium"
            >
              Sign up
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
