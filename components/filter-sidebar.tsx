"use client"
import { Star, Wifi, Car, Dumbbell, Utensils, Waves, Dog } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

export interface FilterState {
  priceRange: [number, number]
  starRating: number[]
  roomTypes: string[]
  amenities: string[]
}

interface FilterSidebarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

const amenityIcons = {
  WiFi: Wifi,
  Pool: Waves,
  AC: Star,
  Gym: Dumbbell,
  Parking: Car,
  Restaurant: Utensils,
  "Pet-friendly": Dog,
}

export function FilterSidebar({ filters, onFiltersChange }: FilterSidebarProps) {
  const handlePriceChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      priceRange: [value[0], value[1]],
    })
  }

  const handleStarRatingChange = (rating: number, checked: boolean) => {
    const newRatings = checked ? [...filters.starRating, rating] : filters.starRating.filter((r) => r !== rating)

    onFiltersChange({
      ...filters,
      starRating: newRatings,
    })
  }

  const handleRoomTypeChange = (roomType: string, checked: boolean) => {
    const newRoomTypes = checked ? [...filters.roomTypes, roomType] : filters.roomTypes.filter((rt) => rt !== roomType)

    onFiltersChange({
      ...filters,
      roomTypes: newRoomTypes,
    })
  }

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    const newAmenities = checked ? [...filters.amenities, amenity] : filters.amenities.filter((a) => a !== amenity)

    onFiltersChange({
      ...filters,
      amenities: newAmenities,
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      priceRange: [0, 100000],
      starRating: [],
      roomTypes: [],
      amenities: [],
    })
  }

  return (
    <div className="w-full lg:w-80 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Filters</CardTitle>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Price Range */}
          <div>
            <h3 className="font-semibold mb-3">Price Range (per night)</h3>
            <Slider
              value={filters.priceRange}
              onValueChange={handlePriceChange}
              max={100000}
              min={0}
              step={500}
              className="mb-2"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>₹{filters.priceRange[0].toLocaleString()}</span>
              <span>₹{filters.priceRange[1].toLocaleString()}</span>
            </div>
          </div>

          {/* Star Rating */}
          <div>
            <h3 className="font-semibold mb-3">Star Rating</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <Checkbox
                    id={`rating-${rating}`}
                    checked={filters.starRating.includes(rating)}
                    onCheckedChange={(checked) => handleStarRatingChange(rating, checked as boolean)}
                  />
                  <label htmlFor={`rating-${rating}`} className="flex items-center cursor-pointer">
                    <div className="flex">
                      {[...Array(rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="ml-2 text-sm">
                      {rating} Star{rating > 1 ? "s" : ""}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Room Types */}
          <div>
            <h3 className="font-semibold mb-3">Room Type</h3>
            <div className="space-y-2">
              {["Standard", "Deluxe", "Suite", "Presidential Suite"].map((roomType) => (
                <div key={roomType} className="flex items-center space-x-2">
                  <Checkbox
                    id={`room-${roomType}`}
                    checked={filters.roomTypes.includes(roomType)}
                    onCheckedChange={(checked) => handleRoomTypeChange(roomType, checked as boolean)}
                  />
                  <label htmlFor={`room-${roomType}`} className="text-sm cursor-pointer">
                    {roomType}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h3 className="font-semibold mb-3">Amenities</h3>
            <div className="space-y-2">
              {Object.entries(amenityIcons).map(([amenity, Icon]) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`amenity-${amenity}`}
                    checked={filters.amenities.includes(amenity)}
                    onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                  />
                  <label htmlFor={`amenity-${amenity}`} className="flex items-center cursor-pointer">
                    <Icon className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="text-sm">{amenity}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
