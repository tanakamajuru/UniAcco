-- =====================================================
-- COMPLETE DATABASE SETUP SCRIPT
-- =====================================================
-- This script sets up the entire UniAcco database
-- Run this script in order to create all tables and sample data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Run all migration files in order
-- Note: In a real application, you would use a migration tool like Knex.js or Sequelize
-- For now, we'll include all the CREATE TABLE statements here

-- =====================================================
-- 1. UNIVERSITIES TABLE
-- =====================================================
DROP TABLE IF EXISTS universities CASCADE;

CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    abbreviation VARCHAR(50),
    description TEXT,
    website VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'Zimbabwe',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    type VARCHAR(50) DEFAULT 'public',
    established_year INTEGER,
    student_count INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. USERS TABLE
-- =====================================================
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'student',
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    university_id UUID REFERENCES universities(id) ON DELETE SET NULL,
    student_id VARCHAR(50),
    profile_image_url TEXT,
    date_of_birth DATE,
    gender VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Zimbabwe',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- =====================================================
-- 3. CAMPUSES TABLE
-- =====================================================
DROP TABLE IF EXISTS campuses CASCADE;

CREATE TABLE campuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'Zimbabwe',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. ACCOMMODATIONS TABLE
-- =====================================================
DROP TABLE IF EXISTS accommodations CASCADE;

CREATE TABLE accommodations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'Zimbabwe',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    property_type VARCHAR(50) NOT NULL,
    accommodation_type VARCHAR(50) NOT NULL,
    rent_amount DECIMAL(10,2) NOT NULL,
    rent_currency VARCHAR(3) DEFAULT 'USD',
    rent_period VARCHAR(20) DEFAULT 'monthly',
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
    distance_to_campus DECIMAL(8,3),
    walking_time_minutes INTEGER,
    public_transport_available BOOLEAN DEFAULT false,
    images JSONB,
    amenities JSONB,
    house_rules JSONB,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    preferred_gender VARCHAR(20),
    students_only BOOLEAN DEFAULT false,
    minimum_stay_months INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 5. PAYMENTS TABLE (from existing migration)
-- =====================================================
DROP TABLE IF EXISTS payment_attempts CASCADE;
DROP TABLE IF EXISTS booking_payments CASCADE;
DROP TABLE IF EXISTS payments CASCADE;

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    accommodation_id UUID NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    paynow_reference VARCHAR(255) UNIQUE NOT NULL,
    poll_url TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    description TEXT,
    paid_at TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    error_message TEXT,
    response_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE booking_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(booking_id, payment_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Universities indexes
CREATE INDEX IF NOT EXISTS idx_universities_name ON universities(name);
CREATE INDEX IF NOT EXISTS idx_universities_city ON universities(city);
CREATE INDEX IF NOT EXISTS idx_universities_is_active ON universities(is_active);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_university_id ON users(university_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Campuses indexes
CREATE INDEX IF NOT EXISTS idx_campuses_university_id ON campuses(university_id);
CREATE INDEX IF NOT EXISTS idx_campuses_city ON campuses(city);
CREATE INDEX IF NOT EXISTS idx_campuses_name ON campuses(name);

-- Accommodations indexes
CREATE INDEX IF NOT EXISTS idx_accommodations_landlord_id ON accommodations(landlord_id);
CREATE INDEX IF NOT EXISTS idx_accommodations_university_id ON accommodations(university_id);
CREATE INDEX IF NOT EXISTS idx_accommodations_campus_id ON accommodations(campus_id);
CREATE INDEX IF NOT EXISTS idx_accommodations_city ON accommodations(city);
CREATE INDEX IF NOT EXISTS idx_accommodations_is_available ON accommodations(is_available);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_accommodation_id ON payments(accommodation_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_universities_updated_at 
    BEFORE UPDATE ON universities 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campuses_updated_at 
    BEFORE UPDATE ON campuses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accommodations_updated_at 
    BEFORE UPDATE ON accommodations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert universities
INSERT INTO universities (
    name, abbreviation, description, website, email, phone, address, city, country, 
    latitude, longitude, type, established_year, student_count
) VALUES 
(
    'University of Zimbabwe',
    'UZ',
    'Oldest and largest university in Zimbabwe',
    'https://www.uz.ac.zw',
    'info@uz.ac.zw',
    '+263 4 303211',
    'Mount Pleasant',
    'Harare',
    'Zimbabwe',
    -17.7856,
    31.0489,
    'public',
    1952,
    22000
),
(
    'National University of Science and Technology',
    'NUST',
    'Premier science and technology university in Zimbabwe',
    'https://www.nust.ac.zw',
    'info@nust.ac.zw',
    '+263 9 286429',
    'Fairbridge Road',
    'Bulawayo',
    'Zimbabwe',
    -20.1756,
    28.5689,
    'public',
    1991,
    15000
);

-- Insert campuses
INSERT INTO campuses (
    university_id, name, address, city, country, latitude, longitude, description
) VALUES 
(
    (SELECT id FROM universities WHERE abbreviation = 'UZ'),
    'Main Campus',
    'Mount Pleasant',
    'Harare',
    'Zimbabwe',
    -17.7856,
    31.0489,
    'Main campus of the University of Zimbabwe'
),
(
    (SELECT id FROM universities WHERE abbreviation = 'NUST'),
    'Main Campus',
    'Fairbridge Road',
    'Bulawayo',
    'Zimbabwe',
    -20.1756,
    28.5689,
    'Main campus of NUST in Bulawayo'
);

-- Insert users (landlords and students)
INSERT INTO users (
    first_name, last_name, email, password_hash, phone, role, university_id, 
    student_id, is_verified, city
) VALUES 
(
    'Admin',
    'User',
    'admin@uniacco.com',
    '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQ',
    '+263 77 000 0000',
    'admin',
    NULL,
    NULL,
    true,
    'Harare'
),
(
    'John',
    'Doe',
    'john.doe@uz.ac.zw',
    '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQ',
    '+263 77 123 4567',
    'student',
    (SELECT id FROM universities WHERE abbreviation = 'UZ'),
    'UZ2023001',
    true,
    'Harare'
);

-- =====================================================
-- VIEWS
-- =====================================================

-- View for campuses with university information
CREATE OR REPLACE VIEW campuses_with_university AS
SELECT 
    c.id,
    c.university_id,
    c.name,
    c.address,
    c.city,
    c.country,
    c.latitude,
    c.longitude,
    c.description,
    c.created_at,
    c.updated_at,
    u.name as university_name,
    u.abbreviation as university_abbreviation
FROM campuses c
JOIN universities u ON c.university_id = u.id
ORDER BY c.name ASC;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

-- Your UniAcco database is now ready with:
-- ✅ Universities table with sample data
-- ✅ Users table with sample data
-- ✅ Campuses table with sample data
-- ✅ Accommodations table structure
-- ✅ Payments table structure
-- ✅ All necessary indexes
-- ✅ Auto-updating timestamps
-- ✅ Views for common queries

-- The campuses endpoint should now work correctly!
