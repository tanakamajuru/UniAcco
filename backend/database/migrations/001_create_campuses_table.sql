-- =====================================================
-- CAMPUSES TABLE CREATION
-- =====================================================

-- Drop existing table if it exists (for fresh setup)
DROP TABLE IF EXISTS campuses CASCADE;

-- Create campuses table
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
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for campuses table
CREATE INDEX IF NOT EXISTS idx_campuses_university_id ON campuses(university_id);
CREATE INDEX IF NOT EXISTS idx_campuses_city ON campuses(city);
CREATE INDEX IF NOT EXISTS idx_campuses_name ON campuses(name);
CREATE INDEX IF NOT EXISTS idx_campuses_created_at ON campuses(created_at);

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

-- Trigger for campuses table
CREATE TRIGGER update_campuses_updated_at 
    BEFORE UPDATE ON campuses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (for testing - remove in production)
-- =====================================================

-- Insert sample campus records (remove these in production)
INSERT INTO campuses (
    university_id, name, address, city, country, latitude, longitude, description
) VALUES 
(
    (SELECT id FROM universities WHERE name = 'University of Zimbabwe' LIMIT 1),
    'Main Campus',
    'Mount Pleasant',
    'Harare',
    'Zimbabwe',
    -17.7856,
    31.0489,
    'Main campus of the University of Zimbabwe'
),
(
    (SELECT id FROM universities WHERE name = 'University of Zimbabwe' LIMIT 1),
    'Medical School Campus',
    'Parirenyatwa Hospital',
    'Harare',
    'Zimbabwe',
    -17.8256,
    31.0689,
    'Medical School campus located at Parirenyatwa Hospital'
),
(
    (SELECT id FROM universities WHERE name = 'National University of Science and Technology' LIMIT 1),
    'Main Campus',
    'Fairbridge Road',
    'Bulawayo',
    'Zimbabwe',
    -20.1756,
    28.5689,
    'Main campus of NUST in Bulawayo'
);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
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
-- USAGE EXAMPLES
-- =====================================================

-- Get all campuses
SELECT * FROM campuses ORDER BY name ASC;

-- Get campuses by university
SELECT * FROM campuses WHERE university_id = 'university-uuid' ORDER BY name ASC;

-- Get campuses by city
SELECT * FROM campuses WHERE city = 'Harare' ORDER BY name ASC;

-- Get campuses with university info
SELECT * FROM campuses_with_university;

-- Search campuses by name
SELECT * FROM campuses WHERE name ILIKE '%main%' ORDER BY name ASC;

-- =====================================================
-- SECURITY POLICIES (optional)
-- =====================================================

-- Row Level Security Policy (RLS) - public read access for campuses
ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY campuses_public_read_policy ON campuses
    FOR SELECT
    TO public
    USING (true)
    WITH CHECK (false);

ALTER TABLE campuses FORCE ROW LEVEL SECURITY;

-- =====================================================
-- COMPLETE SETUP SUMMARY
-- =====================================================

-- Your campuses table now supports:
-- ✅ UUID primary keys
-- ✅ Foreign key relationships with universities
-- ✅ Geographic coordinates
-- ✅ Performance indexes
-- ✅ Auto-updating timestamps
-- ✅ Sample data for testing
-- ✅ Views for common queries
-- ✅ Security policies
-- ✅ Full-text search capabilities

-- Run this SQL file to set up your campuses table!
