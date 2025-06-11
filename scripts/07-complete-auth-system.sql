-- Drop existing tables and recreate with proper structure
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS user_types CASCADE;
DROP TABLE IF EXISTS hotel_owners CASCADE;

-- Create user_types table first
CREATE TABLE user_types (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  user_type VARCHAR(50) NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hotel_owners table
CREATE TABLE hotel_owners (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  business_name VARCHAR(255),
  business_license VARCHAR(255),
  avatar_url TEXT,
  verification_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add hotel_owner_id to hotels table
ALTER TABLE hotels 
ADD COLUMN IF NOT EXISTS hotel_owner_id UUID REFERENCES hotel_owners(id) ON DELETE SET NULL;

-- Create rooms table
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  room_number VARCHAR(50) NOT NULL,
  room_type VARCHAR(100) NOT NULL,
  price_per_night DECIMAL(10, 2) NOT NULL,
  max_occupancy INTEGER NOT NULL,
  size_sqft INTEGER,
  bed_type VARCHAR(100),
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_hotel_owners_email ON hotel_owners(email);
CREATE INDEX IF NOT EXISTS idx_hotels_owner ON hotels(hotel_owner_id);
CREATE INDEX IF NOT EXISTS idx_rooms_hotel ON rooms(hotel_id);
CREATE INDEX IF NOT EXISTS idx_user_types_user_id ON user_types(user_id);

-- Enable RLS
ALTER TABLE hotel_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Hotel owners can view own profile" ON hotel_owners FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Hotel owners can update own profile" ON hotel_owners FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Hotel owners can insert own profile" ON hotel_owners FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view available rooms" ON rooms FOR SELECT USING (is_available = true);
CREATE POLICY "Hotel owners can manage their rooms" ON rooms FOR ALL USING (
  EXISTS (SELECT 1 FROM hotels WHERE hotels.id = rooms.hotel_id AND hotels.hotel_owner_id = auth.uid())
);

CREATE POLICY "Users can view own user type" ON user_types FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own user type" ON user_types FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Hotel owners can manage their hotels" ON hotels FOR ALL USING (hotel_owner_id = auth.uid());

-- Triggers for auto-creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is a hotel owner signup
  IF NEW.raw_user_meta_data->>'userType' = 'hotel_owner' THEN
    INSERT INTO public.hotel_owners (id, email, name, business_name, business_license)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', 'Hotel Owner'),
      NEW.raw_user_meta_data->>'businessName',
      NEW.raw_user_meta_data->>'businessLicense'
    );
    
    INSERT INTO public.user_types (user_id, user_type)
    VALUES (NEW.id, 'hotel_owner');
  ELSE
    INSERT INTO public.user_profiles (id, email, name)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', 'User')
    );
    
    INSERT INTO public.user_types (user_id, user_type)
    VALUES (NEW.id, 'customer');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
