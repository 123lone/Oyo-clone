"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Navbar } from "@/components/navbar"
import { ArrowLeft, Upload, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const AMENITIES_OPTIONS = [
  "WiFi",
  "Pool",
  "AC",
  "Gym",
  "Restaurant",
  "Spa",
  "Parking",
  "Room Service",
  "Business Center",
  "Pet-friendly",
  "Beach Access",
  "Heritage",
]

const ROOM_TYPES = ["Standard", "Deluxe", "Suite", "Presidential Suite", "Villa"]

export default function AddHotel() {
  const { user, userType } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    city: "",
    state: "",
    address: "",
    latitude: "",
    longitude: "",
    star_rating: 3,
    price_per_night: "",
    total_rooms: "",
    available_rooms: "",
    amenities: [] as string[],
    room_types: [] as string[],
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      amenities: checked ? [...prev.amenities, amenity] : prev.amenities.filter((a) => a !== amenity),
    }))
  }

  const handleRoomTypeChange = (roomType: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      room_types: checked ? [...prev.room_types, roomType] : prev.room_types.filter((rt) => rt !== roomType),
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files)
      setImages((prev) => [...prev, ...newImages].slice(0, 5)) // Max 5 images
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadImages = async () => {
  const imageUrls: string[] = [];
  const skippedFiles: string[] = [];

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  const allowedExts = ["jpg", "jpeg", "png", "webp"];
  const MAX_SIZE_MB = 5;
  const MAX_SIZE = MAX_SIZE_MB * 1024 * 1024;

  for (const image of images) {
    try {
      const fileExt = image.name.split(".").pop()?.toLowerCase();
      const isValidType = allowedTypes.includes(image.type);
      const isValidExt = fileExt && allowedExts.includes(fileExt);
      const isTooLarge = image.size > MAX_SIZE;

      if (!isValidType && !isValidExt) {
        console.warn(`❌ Skipping ${image.name}: Unsupported file type or extension.`);
        skippedFiles.push(`${image.name} (invalid type)`);
        continue;
      }

      if (image.size === 0) {
        console.warn(`❌ Skipping ${image.name}: File is empty.`);
        skippedFiles.push(`${image.name} (empty file)`);
        continue;
      }

      if (isTooLarge) {
        console.warn(`❌ Skipping ${image.name}: File exceeds ${MAX_SIZE_MB}MB limit.`);
        skippedFiles.push(`${image.name} (too large)`);
        continue;
      }

      const fileName = `${user?.id}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `hotel-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("hotel-images")
        .upload(filePath, image);

      if (uploadError) {
        console.error(`🚫 Error uploading ${image.name}:`, uploadError.message);
        skippedFiles.push(`${image.name} (upload error)`);
        continue;
      }

      const { data } = supabase.storage.from("hotel-images").getPublicUrl(filePath);
      imageUrls.push(data.publicUrl);
    } catch (error: any) {
      console.error(`🚫 Unexpected error uploading ${image.name}:`, error.message || error);
      skippedFiles.push(`${image.name} (unexpected error)`);
    }
  }

  if (skippedFiles.length > 0) {
    alert(`Some files were not uploaded:\n- ${skippedFiles.join("\n- ")}`);
  }

  return imageUrls;
};


  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user || userType !== "hotel_owner") {
    alert("Access denied: You must be a hotel owner.");
    return;
  }

  console.log("Starting hotel creation...");
  console.log("User:", user);
  console.log("Form data:", formData);
  
  // Validate numeric fields
  if (
    !formData.price_per_night ||
    !formData.total_rooms ||
    !formData.available_rooms ||
    Number.isNaN(Number.parseFloat(formData.price_per_night)) ||
    Number.isNaN(Number.parseInt(formData.total_rooms)) ||
    Number.isNaN(Number.parseInt(formData.available_rooms))
  ) {
    alert("Please provide valid numbers for price and rooms.");
    return;
  }

  // Validate latitude (optional)
  if (formData.latitude && (Number.parseFloat(formData.latitude) < -90 || Number.parseFloat(formData.latitude) > 90)) {
    alert("Latitude must be between -90 and 90.");
    return;
  }

  setLoading(true);

  try {
    // Test Supabase connectivity
    const { data: testData, error: testError } = await supabase.from("hotels").select("id").limit(1);
    console.log("Test query:", { testData, testError });
    if (testError) {
      throw new Error(`Supabase connectivity test failed: ${testError.message}`);
    }

    // Upload images
    console.log("Uploading images...");
    const imageUrls = await uploadImages();
    console.log("Uploaded image URLs:", imageUrls);

    if (images.length > 0 && imageUrls.length === 0) {
      console.warn("No images were uploaded successfully.");
      alert("Warning: No images were uploaded. Proceeding without images.");
    }

    // Prepare hotel data
    const hotelData = {
      ...formData,
      hotel_owner_id: user.id,
      price_per_night: Number.parseFloat(formData.price_per_night),
      total_rooms: Number.parseInt(formData.total_rooms),
      available_rooms: Number.parseInt(formData.available_rooms),
      latitude: formData.latitude ? Number.parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? Number.parseFloat(formData.longitude) : null,
      images: imageUrls,
    };

    console.log("Hotel data to insert:", hotelData);

    const { data, error } = await supabase.from("hotels").insert([hotelData]).select();

    console.log("Insert result:", { data, error });

    if (error) {
      console.error("Database error:", error);
      alert(`Database error: ${JSON.stringify(error, null, 2)}`);
      return;
    }

    console.log("Hotel created successfully!");
    alert("Hotel created successfully!");
    router.push("/owner/dashboard");
  } catch (error) {
    console.error("Caught error:", error);
    alert(`Error: ${error.message}`);
  } finally {
    console.log("Finally block executed");
    setLoading(false);
  }
};

  if (!user || userType !== "hotel_owner") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-gray-600">You need to be logged in as a hotel owner to access this page.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/owner/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Hotel</h1>
              <p className="text-gray-600">Fill in the details to list your hotel property</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Hotel Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter hotel name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="star_rating">Star Rating</Label>
                  <select
                    id="star_rating"
                    value={formData.star_rating}
                    onChange={(e) => handleInputChange("star_rating", Number.parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} Star
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your hotel..."
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Enter city"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    placeholder="Enter state"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Full Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter complete address"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude (Optional)</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange("latitude", e.target.value)}
                    placeholder="e.g., 28.6139"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude (Optional)</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange("longitude", e.target.value)}
                    placeholder="e.g., 77.2090"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Rooms */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Rooms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price_per_night">Price per Night (₹)</Label>
                  <Input
                    id="price_per_night"
                    type="number"
                    value={formData.price_per_night}
                    onChange={(e) => handleInputChange("price_per_night", e.target.value)}
                    placeholder="e.g., 5000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="total_rooms">Total Rooms</Label>
                  <Input
                    id="total_rooms"
                    type="number"
                    value={formData.total_rooms}
                    onChange={(e) => handleInputChange("total_rooms", e.target.value)}
                    placeholder="e.g., 50"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="available_rooms">Available Rooms</Label>
                  <Input
                    id="available_rooms"
                    type="number"
                    value={formData.available_rooms}
                    onChange={(e) => handleInputChange("available_rooms", e.target.value)}
                    placeholder="e.g., 45"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Room Types */}
          <Card>
            <CardHeader>
              <CardTitle>Room Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {ROOM_TYPES.map((roomType) => (
                  <div key={roomType} className="flex items-center space-x-2">
                    <Checkbox
                      id={`room-${roomType}`}
                      checked={formData.room_types.includes(roomType)}
                      onCheckedChange={(checked) => handleRoomTypeChange(roomType, checked as boolean)}
                    />
                    <Label htmlFor={`room-${roomType}`} className="text-sm cursor-pointer">
                      {roomType}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {AMENITIES_OPTIONS.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={`amenity-${amenity}`}
                      checked={formData.amenities.includes(amenity)}
                      onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                    />
                    <Label htmlFor={`amenity-${amenity}`} className="text-sm cursor-pointer">
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Hotel Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="images">Upload Images (Max 5)</Label>
                <div className="mt-2">
                  <input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("images")?.click()}
                    disabled={images.length >= 5}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Images
                  </Button>
                </div>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image) || "/placeholder.svg"}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/owner/dashboard">Cancel</Link>
            </Button>
            <Button type="submit" className="bg-red-500 hover:bg-red-600 text-white" disabled={loading}>
              {loading ? "Creating Hotel..." : "Create Hotel"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

