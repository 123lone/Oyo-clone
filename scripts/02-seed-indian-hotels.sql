-- Insert real Indian hotel data
INSERT INTO hotels (name, description, city, state, address, latitude, longitude, star_rating, price_per_night, images, amenities, room_types, total_rooms, available_rooms) VALUES

-- Mumbai Hotels
('The Taj Mahal Palace', 'Iconic luxury hotel overlooking the Gateway of India with world-class amenities and heritage charm.', 'Mumbai', 'Maharashtra', 'Apollo Bunder, Colaba, Mumbai, Maharashtra 400001', 18.9220, 72.8332, 5, 25000.00, 
ARRAY['/placeholder.svg?height=300&width=400', '/placeholder.svg?height=300&width=400'], 
ARRAY['WiFi', 'Pool', 'AC', 'Gym', 'Restaurant', 'Spa', 'Parking', 'Room Service'], 
ARRAY['Deluxe', 'Suite', 'Presidential Suite'], 285, 45),

('Hotel Marine Plaza', 'Contemporary business hotel in South Mumbai with stunning sea views and modern facilities.', 'Mumbai', 'Maharashtra', '29, Marine Drive, Mumbai, Maharashtra 400020', 18.9467, 72.8236, 4, 8500.00,
ARRAY['/placeholder.svg?height=300&width=400', '/placeholder.svg?height=300&width=400'],
ARRAY['WiFi', 'AC', 'Gym', 'Restaurant', 'Parking', 'Business Center'],
ARRAY['Standard', 'Deluxe', 'Suite'], 120, 28),

-- Delhi Hotels
('The Imperial New Delhi', 'Art Deco masterpiece in the heart of New Delhi, blending colonial elegance with modern luxury.', 'New Delhi', 'Delhi', 'Janpath, Connaught Place, New Delhi, Delhi 110001', 28.6139, 77.2090, 5, 18000.00,
ARRAY['/placeholder.svg?height=300&width=400', '/placeholder.svg?height=300&width=400'],
ARRAY['WiFi', 'Pool', 'AC', 'Gym', 'Restaurant', 'Spa', 'Parking', 'Business Center'],
ARRAY['Deluxe', 'Suite', 'Imperial Suite'], 235, 52),

('Hotel Shanti Palace', 'Budget-friendly hotel near Karol Bagh with comfortable rooms and essential amenities.', 'New Delhi', 'Delhi', '15/35, W.E.A., Karol Bagh, New Delhi, Delhi 110005', 28.6507, 77.1909, 3, 3200.00,
ARRAY['/placeholder.svg?height=300&width=400', '/placeholder.svg?height=300&width=400'],
ARRAY['WiFi', 'AC', 'Restaurant', 'Parking'],
ARRAY['Standard', 'Deluxe'], 45, 18),

-- Bangalore Hotels
('The Leela Palace Bengaluru', 'Opulent palace hotel offering royal treatment with exquisite architecture and premium services.', 'Bangalore', 'Karnataka', '23, Kodihalli, Old Airport Road, Bengaluru, Karnataka 560008', 12.9716, 77.5946, 5, 22000.00,
ARRAY['/placeholder.svg?height=300&width=400', '/placeholder.svg?height=300&width=400'],
ARRAY['WiFi', 'Pool', 'AC', 'Gym', 'Restaurant', 'Spa', 'Parking', 'Business Center'],
ARRAY['Deluxe', 'Suite', 'Royal Suite'], 357, 67),

('Treebo Trend Bliss', 'Modern budget hotel in Electronic City with contemporary amenities and professional service.', 'Bangalore', 'Karnataka', 'Electronic City Phase 1, Bengaluru, Karnataka 560100', 12.8456, 77.6603, 3, 2800.00,
ARRAY['/placeholder.svg?height=300&width=400', '/placeholder.svg?height=300&width=400'],
ARRAY['WiFi', 'AC', 'Restaurant', 'Parking'],
ARRAY['Standard', 'Deluxe'], 65, 23),

-- Goa Hotels
('Taj Exotica Resort & Spa', 'Beachfront luxury resort in South Goa with pristine beaches and world-class facilities.', 'Benaulim', 'Goa', 'Calvaddo, Benaulim, South Goa, Goa 403716', 15.2993, 73.9876, 5, 15000.00,
ARRAY['/placeholder.svg?height=300&width=400', '/placeholder.svg?height=300&width=400'],
ARRAY['WiFi', 'Pool', 'AC', 'Gym', 'Restaurant', 'Spa', 'Parking', 'Beach Access'],
ARRAY['Deluxe', 'Suite', 'Villa'], 140, 34),

('OYO 123 Beach Paradise', 'Comfortable beachside accommodation in North Goa with easy access to popular beaches.', 'Calangute', 'Goa', 'Calangute Beach Road, Calangute, North Goa, Goa 403516', 15.5438, 73.7553, 3, 4500.00,
ARRAY['/placeholder.svg?height=300&width=400', '/placeholder.svg?height=300&width=400'],
ARRAY['WiFi', 'AC', 'Restaurant', 'Beach Access'],
ARRAY['Standard', 'Deluxe'], 28, 12),

-- Jaipur Hotels
('Rambagh Palace', 'Former royal residence turned luxury hotel, offering regal experience with palatial grandeur.', 'Jaipur', 'Rajasthan', 'Bhawani Singh Road, Rambagh, Jaipur, Rajasthan 302005', 26.9124, 75.7873, 5, 35000.00,
ARRAY['/placeholder.svg?height=300&width=400', '/placeholder.svg?height=300&width=400'],
ARRAY['WiFi', 'Pool', 'AC', 'Gym', 'Restaurant', 'Spa', 'Parking', 'Heritage'],
ARRAY['Deluxe', 'Suite', 'Royal Suite'], 79, 15),

('Hotel Pearl Palace', 'Heritage hotel in the Pink City offering traditional Rajasthani hospitality with modern comforts.', 'Jaipur', 'Rajasthan', 'Hari Kishan Somani Marg, Hathroi Fort, Jaipur, Rajasthan 302001', 26.9260, 75.8235, 4, 6500.00,
ARRAY['/placeholder.svg?height=300&width=400', '/placeholder.svg?height=300&width=400'],
ARRAY['WiFi', 'AC', 'Restaurant', 'Parking', 'Heritage'],
ARRAY['Standard', 'Deluxe', 'Suite'], 52, 19),

-- Chennai Hotels
('ITC Grand Chola', 'Magnificent luxury hotel inspired by Chola architecture with exceptional dining and facilities.', 'Chennai', 'Tamil Nadu', '63, Mount Road, Guindy, Chennai, Tamil Nadu 600032', 13.0067, 80.2206, 5, 16000.00,
ARRAY['/placeholder.svg?height=300&width=400', '/placeholder.svg?height=300&width=400'],
ARRAY['WiFi', 'Pool', 'AC', 'Gym', 'Restaurant', 'Spa', 'Parking', 'Business Center'],
ARRAY['Deluxe', 'Suite', 'Presidential Suite'], 600, 89),

('FabHotel Prime Marina', 'Contemporary hotel near Marina Beach with modern amenities and convenient location.', 'Chennai', 'Tamil Nadu', 'Triplicane High Road, Triplicane, Chennai, Tamil Nadu 600005', 13.0569, 80.2707, 3, 3800.00,
ARRAY['/placeholder.svg?height=300&width=400', '/placeholder.svg?height=300&width=400'],
ARRAY['WiFi', 'AC', 'Restaurant', 'Parking'],
ARRAY['Standard', 'Deluxe'], 38, 16),

-- Kolkata Hotels
('The Oberoi Grand', 'Colonial-era grand hotel in the heart of Kolkata with timeless elegance and luxury.', 'Kolkata', 'West Bengal', '15, Jawaharlal Nehru Road, Kolkata, West Bengal 700013', 22.5726, 88.3639, 5, 14000.00,
ARRAY['/placeholder.svg?height=300&width=400', '/placeholder.svg?height=300&width=400'],
ARRAY['WiFi', 'Pool', 'AC', 'Gym', 'Restaurant', 'Spa', 'Parking', 'Heritage'],
ARRAY['Deluxe', 'Suite', 'Presidential Suite'], 209, 41),

-- Hyderabad Hotels
('Taj Falaknuma Palace', 'Restored Nizam palace offering royal luxury with panoramic city views and heritage charm.', 'Hyderabad', 'Telangana', 'Engine Bowli, Falaknuma, Hyderabad, Telangana 500053', 17.3251, 78.4967, 5, 45000.00,
ARRAY['/placeholder.svg?height=300&width=400', '/placeholder.svg?height=300&width=400'],
ARRAY['WiFi', 'Pool', 'AC', 'Gym', 'Restaurant', 'Spa', 'Parking', 'Heritage'],
ARRAY['Deluxe', 'Suite', 'Royal Suite'], 60, 12),

-- Pune Hotels
('JW Marriott Hotel Pune', 'Contemporary luxury hotel in Senapati Bapat Road with premium amenities and services.', 'Pune', 'Maharashtra', 'Senapati Bapat Road, Pune, Maharashtra 411053', 18.5679, 73.9143, 5, 12000.00,
ARRAY['/placeholder.svg?height=300&width=400', '/placeholder.svg?height=300&width=400'],
ARRAY['WiFi', 'Pool', 'AC', 'Gym', 'Restaurant', 'Spa', 'Parking', 'Business Center'],
ARRAY['Deluxe', 'Suite', 'Executive Suite'], 310, 58);
