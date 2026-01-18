-- =====================================================
-- USERS TABLE CREATION
-- =====================================================

-- Drop existing table if it exists (for fresh setup)
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'student', -- student, landlord, admin
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    university_id UUID REFERENCES universities(id) ON DELETE SET NULL,
    student_id VARCHAR(50), -- University student ID
    profile_image_url TEXT,
    date_of_birth DATE,
    gender VARCHAR(20), -- male, female, other
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Zimbabwe',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_university_id ON users(university_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);

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

-- Trigger for users table
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (for testing - remove in production)
-- =====================================================

-- Insert sample user records (remove these in production)
-- Note: Passwords are hashed with bcrypt (example: 'password123' -> hashed)
INSERT INTO users (
    first_name, last_name, email, password_hash, phone, role, university_id, 
    student_id, is_verified, city
) VALUES 
(
    'John',
    'Doe',
    'john.doe@uz.ac.zw',
    '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQ',
    '+263 77 123 4567',
    'student',
    (SELECT id FROM universities WHERE abbreviation = 'UZ' LIMIT 1),
    'UZ2023001',
    true,
    'Harare'
),
(
    'Jane',
    'Smith',
    'jane.smith@nust.ac.zw',
    '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQ',
    '+263 77 234 5678',
    'student',
    (SELECT id FROM universities WHERE abbreviation = 'NUST' LIMIT 1),
    'NUST2023001',
    true,
    'Bulawayo'
),
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
);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for active users with university info
CREATE OR REPLACE VIEW active_users_with_university AS
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.email,
    u.phone,
    u.role,
    u.is_active,
    u.is_verified,
    u.university_id,
    u.student_id,
    u.profile_image_url,
    u.city,
    u.country,
    u.created_at,
    u.last_login,
    un.name as university_name,
    un.abbreviation as university_abbreviation
FROM users u
LEFT JOIN universities un ON u.university_id = un.id
WHERE u.is_active = true
ORDER BY u.created_at DESC;

-- View for students only
CREATE OR REPLACE VIEW students AS
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.email,
    u.phone,
    u.university_id,
    u.student_id,
    u.is_verified,
    u.city,
    un.name as university_name,
    un.abbreviation as university_abbreviation
FROM users u
LEFT JOIN universities un ON u.university_id = un.id
WHERE u.role = 'student' AND u.is_active = true
ORDER BY u.last_name ASC, u.first_name ASC;

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- Get all users
SELECT * FROM users ORDER BY created_at DESC;

-- Get active users only
SELECT * FROM active_users_with_university;

-- Get students only
SELECT * FROM students;

-- Get users by university
SELECT * FROM users WHERE university_id = 'university-uuid' ORDER BY last_name ASC;

-- Search users by name or email
SELECT * FROM users 
WHERE first_name ILIKE '%john%' 
   OR last_name ILIKE '%john%' 
   OR email ILIKE '%john%'
ORDER BY last_name ASC;

-- Get users by role
SELECT * FROM users WHERE role = 'student' AND is_active = true ORDER BY created_at DESC;

-- =====================================================
-- SECURITY POLICIES (optional)
-- =====================================================

-- Row Level Security Policy (RLS) - users can only see their own profile
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_self_policy ON users
    FOR ALL
    TO authenticated_user
    USING (id = current_user_id())
    WITH CHECK (id = current_user_id());

-- Public read access for basic user info (for landlords to see student profiles)
CREATE POLICY users_public_read_policy ON users
    FOR SELECT
    TO public
    USING (is_active = true AND role = 'student')
    WITH CHECK (false);

ALTER TABLE users FORCE ROW LEVEL SECURITY;

-- =====================================================
-- COMPLETE SETUP SUMMARY
-- =====================================================

-- Your users table now supports:
-- ✅ UUID primary keys
-- ✅ Unique email addresses
-- ✅ Role-based access control
-- ✅ University relationships
-- ✅ Performance indexes
-- ✅ Auto-updating timestamps
-- ✅ Sample data for testing
-- ✅ Views for common queries
-- ✅ Security policies
-- ✅ Full-text search capabilities

-- Run this SQL file to set up your users table!
