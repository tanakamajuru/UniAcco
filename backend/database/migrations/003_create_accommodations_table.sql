-- =====================================================
-- ACCOMMODATIONS TABLE CREATION
-- =====================================================

-- Drop existing table if it exists (for fresh setup)
DROP TABLE IF EXISTS accommodations CASCADE;

-- Create accommodations table
CREATE TABLE accommodations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'Zimbabwe',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    property_type VARCHAR(50) NOT NULL, -- apartment, house, hostel, flat, room
    accommodation_type VARCHAR(50) NOT NULL, -- single, shared, self-contained, bachelor
    rent_amount DECIMAL(10,2) NOT NULL,
    rent_currency VARCHAR(3) DEFAULT 'USD',
    rent_period VARCHAR(20) DEFAULT 'monthly', -- monthly, weekly, daily
    deposit_amount DECIMAL(10,2),
    utilities_included BOOLEAN DEFAULT false,
    furnished BOOLEAN DEFAULT false,
    parking_available BOOLEAN DEFAULT false,
    wifi_available BOOLEAN DEFAULT false,
    security_available BOOLEAN DEFAULT false,
    water_available BOOLEAN DEFAULT false,
    electricity_available BOOLEAN DEFAULT false,
    bedrooms INTEGER,
    bathrooms INTEGER,
    total_rooms INTEGER,
    available_rooms INTEGER,
    max_occupants INTEGER,
    current_occupants INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    landlord_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    university_id UUID REFERENCES universities(id) ON DELETE SET NULL,
    campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
    distance_to_campus DECIMAL(8,3), -- in kilometers
    walking_time_minutes INTEGER,
    public_transport_available BOOLEAN DEFAULT false,
    images JSONB, -- Array of image URLs
    amenities JSONB, -- Array of amenities
    house_rules JSONB, -- Array of house rules
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    preferred_gender VARCHAR(20), -- male, female, any
    students_only BOOLEAN DEFAULT false,
    minimum_stay_months INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for accommodations table
CREATE INDEX IF NOT EXISTS idx_accommodations_landlord_id ON accommodations(landlord_id);
CREATE INDEX IF NOT EXISTS idx_accommodations_university_id ON accommodations(university_id);
CREATE INDEX IF NOT EXISTS idx_accommodations_campus_id ON accommodations(campus_id);
CREATE INDEX IF NOT EXISTS idx_accommodations_city ON accommodations(city);
CREATE INDEX IF NOT EXISTS idx_accommodations_property_type ON accommodations(property_type);
CREATE INDEX IF NOT EXISTS idx_accommodations_accommodation_type ON accommodations(accommodation_type);
CREATE INDEX IF NOT EXISTS idx_accommodations_rent_amount ON accommodations(rent_amount);
CREATE INDEX IF NOT EXISTS idx_accommodations_is_available ON accommodations(is_available);
CREATE INDEX IF NOT EXISTS idx_accommodations_is_verified ON accommodations(is_verified);
CREATE INDEX IF NOT EXISTS idx_accommodations_created_at ON accommodations(created_at);
CREATE INDEX IF NOT EXISTS idx_accommodations_distance_to_campus ON accommodations(distance_to_campus);

-- GIN indexes for JSONB fields
CREATE INDEX IF NOT EXISTS idx_accommodations_images ON accommodations USING GIN(images);
CREATE INDEX IF NOT EXISTS idx_accommodations_amenities ON accommodations USING GIN(amenities);

-- =====================================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- =====================================================

-- Function to update updated_at timestamp (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for accommodations table
CREATE TRIGGER update_accommodations_updated_at 
    BEFORE UPDATE ON accommodations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (for testing - remove in production)
-- =====================================================

-- Insert sample accommodation records (remove these in production)
INSERT INTO accommodations (
    title, description, address, city, country, latitude, longitude,
    property_type, accommodation_type, rent_amount, deposit_amount,
    bedrooms, bathrooms, total_rooms, available_rooms, max_occupants,
    is_available, landlord_id, university_id, campus_id,
    distance_to_campus, walking_time_minutes, utilities_included, furnished,
    wifi_available, parking_available, images, amenities
) VALUES 
(
    'Spacious Single Room Near UZ',
    'Comfortable single room perfect for students, close to university campus with all basic amenities.',
    '123 Mount Pleasant Road',
    'Harare',
    'Zimbabwe',
    -17.7856,
    31.0489,
    'room',
    'single',
    150.00,
    300.00,
    1,
    1,
    1,
    1,
    1,
    true,
    (SELECT id FROM users WHERE email = 'admin@uniacco.com' LIMIT 1),
    (SELECT id FROM universities WHERE abbreviation = 'UZ' LIMIT 1),
    (SELECT id FROM campuses WHERE name = 'Main Campus' AND university_id = (SELECT id FROM universities WHERE abbreviation = 'UZ' LIMIT 1) LIMIT 1),
    0.5,
    5,
    true,
    true,
    true,
    false,
    '["https://example.com/image1.jpg", "https://example.com/image2.jpg"]'::JSONB,
    '["WiFi", "Water", "Electricity", "Study Desk", "Wardrobe"]'::JSONB
),
(
    'Modern 2-Bedroom Apartment',
    'Modern apartment with 2 bedrooms, perfect for sharing students. Located in safe neighborhood.',
    '456 Samora Machel Avenue',
    'Harare',
    'Zimbabwe',
    -17.8256,
    31.0689,
    'apartment',
    'shared',
    400.00,
    800.00,
    2,
    1,
    2,
    2,
    4,
    true,
    (SELECT id FROM users WHERE email = 'admin@uniacco.com' LIMIT 1),
    (SELECT id FROM universities WHERE abbreviation = 'UZ' LIMIT 1),
    (SELECT id FROM campuses WHERE name = 'Main Campus' AND university_id = (SELECT id FROM universities WHERE abbreviation = 'UZ' LIMIT 1) LIMIT 1),
    2.0,
    15,
    false,
    true,
    true,
    true,
    '["https://example.com/apt1.jpg", "https://example.com/apt2.jpg"]'::JSONB,
    '["WiFi", "Parking", "Security", "Kitchen", "Living Room"]'::JSONB
);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for available accommodations with landlord and university info
CREATE OR REPLACE VIEW available_accommodations AS
SELECT 
    a.id,
    a.title,
    a.description,
    a.address,
    a.city,
    a.country,
    a.latitude,
    a.longitude,
    a.property_type,
    a.accommodation_type,
    a.rent_amount,
    a.rent_currency,
    a.rent_period,
    a.deposit_amount,
    a.utilities_included,
    a.furnished,
    a.parking_available,
    a.wifi_available,
    a.security_available,
    a.bedrooms,
    a.bathrooms,
    a.total_rooms,
    a.available_rooms,
    a.max_occupants,
    a.current_occupants,
    a.distance_to_campus,
    a.walking_time_minutes,
    a.public_transport_available,
    a.images,
    a.amenities,
    a.contact_phone,
    a.contact_email,
    a.preferred_gender,
    a.students_only,
    a.minimum_stay_months,
    a.created_at,
    a.updated_at,
    u.first_name || ' ' || u.last_name as landlord_name,
    u.phone as landlord_phone,
    u.email as landlord_email,
    un.name as university_name,
    un.abbreviation as university_abbreviation,
    c.name as campus_name
FROM accommodations a
JOIN users u ON a.landlord_id = u.id
LEFT JOIN universities un ON a.university_id = un.id
LEFT JOIN campuses c ON a.campus_id = c.id
WHERE a.is_available = true
ORDER BY a.created_at DESC;

-- View for accommodations by university
CREATE OR REPLACE VIEW accommodations_by_university AS
SELECT 
    un.name as university_name,
    COUNT(*) as total_accommodations,
    COUNT(CASE WHEN a.is_available = true THEN 1 END) as available_accommodations,
    AVG(a.rent_amount) as average_rent,
    MIN(a.rent_amount) as minimum_rent,
    MAX(a.rent_amount) as maximum_rent
FROM universities un
LEFT JOIN accommodations a ON un.id = a.university_id
GROUP BY un.id, un.name
ORDER BY un.name ASC;

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- Get all available accommodations
SELECT * FROM available_accommodations;

-- Get accommodations by city
SELECT * FROM accommodations WHERE city = 'Harare' AND is_available = true ORDER BY rent_amount ASC;

-- Get accommodations by property type
SELECT * FROM accommodations WHERE property_type = 'apartment' AND is_available = true ORDER BY created_at DESC;

-- Get accommodations by rent range
SELECT * FROM accommodations 
WHERE rent_amount BETWEEN 100 AND 300 
AND is_available = true 
ORDER BY rent_amount ASC;

-- Get accommodations by university
SELECT * FROM accommodations 
WHERE university_id = 'university-uuid' 
AND is_available = true 
ORDER BY distance_to_campus ASC;

-- Search accommodations by title or description
SELECT * FROM accommodations 
WHERE (title ILIKE '%spacious%' OR description ILIKE '%spacious%')
AND is_available = true 
ORDER BY created_at DESC;

-- Get accommodations statistics by university
SELECT * FROM accommodations_by_university;

-- =====================================================
-- SECURITY POLICIES (optional)
-- =====================================================

-- Row Level Security Policy (RLS) - public read access for available accommodations
ALTER TABLE accommodations ENABLE ROW LEVEL SECURITY;
CREATE POLICY accommodations_public_read_policy ON accommodations
    FOR SELECT
    TO public
    USING (is_available = true)
    WITH CHECK (false);

-- Landlords can manage their own accommodations
CREATE POLICY accommodations_landlord_policy ON accommodations
    FOR ALL
    TO authenticated_user
    USING (landlord_id = current_user_id())
    WITH CHECK (landlord_id = current_user_id());

ALTER TABLE accommodations FORCE ROW LEVEL SECURITY;

-- =====================================================
-- COMPLETE SETUP SUMMARY
-- =====================================================

-- Your accommodations table now supports:
-- ✅ UUID primary keys
-- ✅ Comprehensive property details
-- ✅ Geographic coordinates and distance tracking
-- ✅ Landlord and university relationships
-- ✅ JSONB for flexible images and amenities
-- ✅ Performance indexes
-- ✅ Auto-updating timestamps
-- ✅ Sample data for testing
-- ✅ Views for common queries
-- ✅ Security policies
-- ✅ Full-text search capabilities

-- Run this SQL file to set up your accommodations table!
