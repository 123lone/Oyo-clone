"use client"

import { useState } from "react"
import { Menu, X, User, Heart, LogOut, Settings, Calendar, Building2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoginModal } from "@/components/auth/login-modal"
import { SignupModal } from "@/components/auth/signup-modal"
import { UserTypeModal } from "@/components/auth/user-type-modal"
import { useAuth } from "@/contexts/auth-context"
import Hotels from "./hotels"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserTypeModalOpen, setIsUserTypeModalOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [selectedUserType, setSelectedUserType] = useState<"customer" | "hotel_owner" | null>(null)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")

  const { user, userProfile, hotelOwnerProfile, userType, signOut } = useAuth()

  const currentProfile = userType === "hotel_owner" ? hotelOwnerProfile : userProfile

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleAuthClick = (mode: "login" | "signup") => {
    setAuthMode(mode)
    setIsUserTypeModalOpen(true)
  }

  const handleUserTypeSelect = (type: "customer" | "hotel_owner") => {
    setSelectedUserType(type)
    setIsUserTypeModalOpen(false)

    if (authMode === "login") {
      setIsLoginModalOpen(true)
    } else {
      setIsSignupModalOpen(true)
    }
  }

  const handleBackToTypeSelection = () => {
    setIsLoginModalOpen(false)
    setIsSignupModalOpen(false)
    setSelectedUserType(null)
    setIsUserTypeModalOpen(true)
  }

  const closeAllModals = () => {
    setIsUserTypeModalOpen(false)
    setIsLoginModalOpen(false)
    setIsSignupModalOpen(false)
    setSelectedUserType(null)
  }

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">HotelBook</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-red-500 transition-colors">
              Home
            </Link>
            <a href="/hotels" className="text-gray-700 dark:text-gray-300 hover:text-red-500 transition-colors">
              Hotels
            </a>
            <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-red-500 transition-colors">
              About
            </a>
            {/* <a href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-red-500 transition-colors">
              Contact
            </a> */}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {userType === "hotel_owner" ? (
                  <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300" asChild>
                    <Link href="/owner/add-hotel">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Hotel
                    </Link>
                  </Button>
                ) : (
                  // <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300">
                  //   <Heart className="w-4 h-4 mr-2" />
                  //   Wishlist
                  // </Button>
                  <div></div>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={currentProfile?.avatar_url || "/placeholder.svg"}
                          alt={currentProfile?.name}
                        />
                        <AvatarFallback>{currentProfile?.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium leading-none">{currentProfile?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{currentProfile?.email}</p>
                      {userType === "hotel_owner" && <p className="text-xs leading-none text-blue-600">Hotel Owner</p>}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>

                    {userType === "hotel_owner" ? (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/owner/dashboard">
                            <Building2 className="mr-2 h-4 w-4" />
                            <span>My Hotels</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/owner/bookings">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>Bookings</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem asChild>
                        <Link href="/my-bookings">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>My Bookings</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem asChild>
                      <Link href="/profile?tab=security">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300">
                  <Heart className="w-4 h-4 mr-2" />
                  Wishlist
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAuthClick("login")}
                  className="text-gray-700 dark:text-gray-300"
                >
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAuthClick("signup")}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-red-500 transition-colors">
                Home
              </Link>
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-red-500 transition-colors">
                Hotels
              </a>
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-red-500 transition-colors">
                About
              </a>
              {/* <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-red-500 transition-colors">
                
              </a> */}
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                {user ? (
                  <>
                    <div className="flex items-center space-x-2 px-3 py-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={currentProfile?.avatar_url || "/placeholder.svg"}
                          alt={currentProfile?.name}
                        />
                        <AvatarFallback>{currentProfile?.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{currentProfile?.name}</p>
                        <p className="text-xs text-gray-500">{currentProfile?.email}</p>
                        {userType === "hotel_owner" && <p className="text-xs text-blue-600">Hotel Owner</p>}
                      </div>
                    </div>

                    {userType === "hotel_owner" ? (
                      <Button variant="ghost" size="sm" className="justify-start" asChild>
                        <Link href="/owner/add-hotel">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Hotel
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="justify-start">
                        <Heart className="w-4 h-4 mr-2" />
                        Wishlist
                      </Button>
                    )}

                    <Button variant="ghost" size="sm" className="justify-start" asChild>
                      <Link href="/profile">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                    </Button>

                    {userType === "hotel_owner" ? (
                      <>
                        <Button variant="ghost" size="sm" className="justify-start" asChild>
                          <Link href="/owner/dashboard">
                            <Building2 className="w-4 h-4 mr-2" />
                            My Hotels
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="justify-start" asChild>
                          <Link href="/owner/bookings">
                            <Calendar className="w-4 h-4 mr-2" />
                            Bookings
                          </Link>
                        </Button>
                      </>
                    ) : (
                      <Button variant="ghost" size="sm" className="justify-start" asChild>
                        <Link href="/my-bookings">
                          <Calendar className="w-4 h-4 mr-2" />
                          My Bookings
                        </Link>
                      </Button>
                    )}

                    <Button variant="ghost" size="sm" className="justify-start" asChild>
                      <Link href="/profile?tab=security">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleSignOut} className="justify-start">
                      <LogOut className="w-4 h-4 mr-2" />
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" className="justify-start">
                      <Heart className="w-4 h-4 mr-2" />
                      Wishlist
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleAuthClick("login")
                        setIsMenuOpen(false)
                      }}
                      className="justify-start"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Login
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        handleAuthClick("signup")
                        setIsMenuOpen(false)
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auth Modals */}
      <UserTypeModal
        isOpen={isUserTypeModalOpen}
        onClose={closeAllModals}
        onSelectType={handleUserTypeSelect}
        mode={authMode}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeAllModals}
        onSwitchToSignup={() => {
          setIsLoginModalOpen(false)
          setIsSignupModalOpen(true)
        }}
        userType={selectedUserType || undefined}
        onBackToTypeSelection={handleBackToTypeSelection}
      />

      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={closeAllModals}
        onSwitchToLogin={() => {
          setIsSignupModalOpen(false)
          setIsLoginModalOpen(true)
        }}
        userType={selectedUserType || undefined}
        onBackToTypeSelection={handleBackToTypeSelection}
      />
    </nav>
  )
}
