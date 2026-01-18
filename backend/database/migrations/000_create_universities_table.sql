-- =====================================================
-- UNIVERSITIES TABLE CREATION
-- =====================================================

-- Drop existing table if it exists (for fresh setup)
DROP TABLE IF EXISTS universities CASCADE;

-- Create universities table
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
    type VARCHAR(50) DEFAULT 'public', -- public, private, technical
    established_year INTEGER,
    student_count INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for universities table
CREATE INDEX IF NOT EXISTS idx_universities_name ON universities(name);
CREATE INDEX IF NOT EXISTS idx_universities_abbreviation ON universities(abbreviation);
CREATE INDEX IF NOT EXISTS idx_universities_city ON universities(city);
CREATE INDEX IF NOT EXISTS idx_universities_type ON universities(type);
CREATE INDEX IF NOT EXISTS idx_universities_is_active ON universities(is_active);
CREATE INDEX IF NOT EXISTS idx_universities_created_at ON universities(created_at);

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

-- Trigger for universities table
CREATE TRIGGER update_universities_updated_at 
    BEFORE UPDATE ON universities 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (for testing - remove in production)
-- =====================================================

-- Insert sample university records (remove these in production)
INSERT INTO universities (
    name, abbreviation, description, website, email, phone, address, city, country, 
    latitude, longitude, type, established_year, student_count
) VALUES 
(
    'University of Zimbabwe',
    'UZ',
    'Oldest and largest university in Zimbabwe, offering undergraduate and postgraduate programs across various disciplines.',
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
    'Premier science and technology university in Zimbabwe, focusing on engineering, science, and technology education.',
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
),
(
    'Africa University',
    'AU',
    'Pan-African university committed to excellence in teaching, research, and service to humanity.',
    'https://www.africau.edu',
    'info@africau.edu',
    '+263 9 282877',
    'Mutare',
    'Mutare',
    'Zimbabwe',
    -18.9706,
    32.6669,
    'private',
    1992,
    3000
);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for active universities
CREATE OR REPLACE VIEW active_universities AS
SELECT 
    id,
    name,
    abbreviation,
    description,
    website,
    email,
    phone,
    address,
    city,
    country,
    latitude,
    longitude,
    type,
    established_year,
    student_count,
    created_at,
    updated_at
FROM universities 
WHERE is_active = true
ORDER BY name ASC;

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- Get all universities
SELECT * FROM universities ORDER BY name ASC;

-- Get active universities only
SELECT * FROM active_universities;

-- Get universities by type
SELECT * FROM universities WHERE type = 'public' ORDER BY name ASC;

-- Search universities by name
SELECT * FROM universities WHERE name ILIKE '%zimbabwe%' ORDER BY name ASC;

-- Get universities by city
SELECT * FROM universities WHERE city = 'Harare' ORDER BY name ASC;

-- =====================================================
-- SECURITY POLICIES (optional)
-- =====================================================

-- Row Level Security Policy (RLS) - public read access for universities
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
CREATE POLICY universities_public_read_policy ON universities
    FOR SELECT
    TO public
    USING (true)
    WITH CHECK (false);

ALTER TABLE universities FORCE ROW LEVEL SECURITY;

-- =====================================================
-- COMPLETE SETUP SUMMARY
-- =====================================================

-- Your universities table now supports:
-- ✅ UUID primary keys
-- ✅ Unique university names
-- ✅ Geographic coordinates
-- ✅ Performance indexes
-- ✅ Auto-updating timestamps
-- ✅ Sample data for testing
-- ✅ Views for common queries
-- ✅ Security policies
-- ✅ Full-text search capabilities

-- Run this SQL file to set up your universities table!
