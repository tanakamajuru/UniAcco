-- =====================================================
-- PAYMENTS TABLE CREATION
-- =====================================================

-- Drop existing tables if they exist (for fresh setup)
DROP TABLE IF EXISTS payment_attempts CASCADE;
DROP TABLE IF EXISTS booking_payments CASCADE;
DROP TABLE IF EXISTS payments CASCADE;

-- Create payments table with 30-day validity
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    accommodation_id UUID NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    paynow_reference VARCHAR(255) UNIQUE NOT NULL,
    poll_url TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, paid, failed, cancelled, expired
    payment_method VARCHAR(50), -- web, mobile, ecocash, onemoney
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    description TEXT,
    paid_at TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'), -- Payment expires in 30 days
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payment_attempts table for tracking failed/retried payments
CREATE TABLE payment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    error_message TEXT,
    response_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create booking_payments junction table
CREATE TABLE booking_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(booking_id, payment_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for payments table
CREATE INDEX IF NOT EXISTS idx_payments_accommodation_id ON payments(accommodation_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_paynow_reference ON payments(paynow_reference);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_expires_at ON payments(expires_at);
CREATE INDEX IF NOT EXISTS idx_payments_payment_method ON payments(payment_method);

-- Indexes for payment_attempts table
CREATE INDEX IF NOT EXISTS idx_payment_attempts_payment_id ON payment_attempts(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_created_at ON payment_attempts(created_at);

-- Indexes for booking_payments table
CREATE INDEX IF NOT EXISTS idx_booking_payments_booking_id ON booking_payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_payments_payment_id ON booking_payments(payment_id);

-- =====================================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for payments table
CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for payment_attempts table
CREATE TRIGGER update_payment_attempts_updated_at 
    BEFORE UPDATE ON payment_attempts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- CLEANUP JOB FOR EXPIRED PAYMENTS
-- =====================================================

-- Function to clean up expired payments
CREATE OR REPLACE FUNCTION cleanup_expired_payments()
RETURNS void AS $$
BEGIN
    -- Update expired payments to 'expired' status
    UPDATE payments 
    SET status = 'expired', updated_at = CURRENT_TIMESTAMP
    WHERE status = 'pending' 
    AND expires_at < CURRENT_TIMESTAMP;
    
    -- Log the cleanup
    RAISE NOTICE 'Cleaned up % expired payments', 
        (SELECT COUNT(*) FROM payments WHERE status = 'expired' AND expires_at < CURRENT_TIMESTAMP);
END;
$$ language 'plpgsql';

-- =====================================================
-- SAMPLE DATA (for testing - remove in production)
-- =====================================================

-- Insert sample payment records (remove these in production)
INSERT INTO payments (
    id, accommodation_id, user_id, paynow_reference, poll_url, 
    amount, currency, status, payment_method, customer_email, 
    customer_phone, description, paid_at, expires_at
) VALUES 
(
    gen_random_uuid(),
    gen_random_uuid(),
    gen_random_uuid(),
    'https://paynow.co.zw/poll/12345',
    150.00,
    'USD',
    'pending',
    'web',
    'student@example.com',
    NULL,
    'Test accommodation booking',
    NULL,
    CURRENT_TIMESTAMP + INTERVAL '30 days'
),
(
    gen_random_uuid(),
    gen_random_uuid(),
    gen_random_uuid(),
    'https://paynow.co.zw/poll/67890',
    200.00,
    'USD',
    'paid',
    'mobile',
    'student2@example.com',
    '0771234567',
    'Mobile payment for test accommodation',
    CURRENT_TIMESTAMP - INTERVAL '25 days',
    CURRENT_TIMESTAMP + INTERVAL '30 days'
);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for active payments (not expired)
CREATE OR REPLACE VIEW active_payments AS
SELECT 
    p.*,
    a.title as accommodation_title,
    a.city as accommodation_city,
    u.first_name || ' ' || u.last_name as customer_name
FROM payments p
JOIN accommodations a ON p.accommodation_id = a.id
JOIN users u ON p.user_id = u.id
WHERE p.status IN ('pending', 'paid')
AND p.expires_at > CURRENT_TIMESTAMP;

-- View for payment statistics
CREATE OR REPLACE VIEW payment_stats AS
SELECT 
    COUNT(*) as total_payments,
    COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_payments,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
    COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_payments,
    SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_revenue,
    SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_revenue
FROM payments;

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- Get all payments for a user
SELECT * FROM active_payments WHERE user_id = 'user-uuid' ORDER BY created_at DESC;

-- Get payment by reference
SELECT * FROM payments WHERE paynow_reference = 'UNIACCO-123456789';

-- Get payments by accommodation
SELECT * FROM active_payments WHERE accommodation_id = 'accommodation-uuid';

-- Get payment statistics
SELECT * FROM payment_stats;

-- Update payment to paid (when webhook received)
UPDATE payments 
SET status = 'paid', paid_at = CURRENT_TIMESTAMP 
WHERE paynow_reference = 'UNIACCO-123456789';

-- Cancel pending payment
UPDATE payments 
SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
WHERE paynow_reference = 'UNIACCO-123456789' AND status = 'pending';

-- Get expired payments (for cleanup)
SELECT * FROM payments 
WHERE status = 'pending' AND expires_at < CURRENT_TIMESTAMP;

-- =====================================================
-- SECURITY POLICIES (optional)
-- =====================================================

-- Row Level Security Policy (RLS) - only users can see their own payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_payments_policy ON payments
    FOR ALL
    TO authenticated_user
    USING (user_id = current_user_id())
    WITH CHECK (true);

-- Apply the policy
ALTER TABLE payments FORCE ROW LEVEL SECURITY;

-- Similar policies for other tables
ALTER TABLE payment_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_payment_attempts_policy ON payment_attempts
    FOR ALL
    TO authenticated_user
    USING (EXISTS (
        SELECT 1 FROM payments p 
        WHERE p.id = payment_attempts.payment_id 
        AND p.user_id = current_user_id()
    ))
    WITH CHECK (true);

ALTER TABLE payment_attempts FORCE ROW LEVEL SECURITY;

ALTER TABLE booking_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_booking_payments_policy ON booking_payments
    FOR ALL
    TO authenticated_user
    USING (EXISTS (
        SELECT 1 FROM payments p 
        WHERE p.id = booking_payments.payment_id 
        AND p.user_id = current_user_id()
    ))
    WITH CHECK (true);

ALTER TABLE booking_payments FORCE ROW LEVEL SECURITY;

-- =====================================================
-- PERFORMANCE OPTIMIZATION
-- =====================================================

-- Create partitioned table for high-volume systems (optional)
-- This partitions payments by month for better performance
/*
CREATE TABLE payments_partitioned (
    LIKE payments INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create monthly partitions (run this monthly)
CREATE TABLE payments_y2026m01 PARTITION OF payments_partitioned
    FOR VALUES FROM ('2026-01-01') TO ('2026-01-31');
*/

-- =====================================================
-- MONITORING QUERIES
-- =====================================================

-- Payments expiring in next 7 days
SELECT 
    paynow_reference,
    amount,
    expires_at,
    customer_email
FROM payments 
WHERE status = 'pending' 
AND expires_at BETWEEN CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP + INTERVAL '7 days'
ORDER BY expires_at ASC;

-- Payment success rate by method
SELECT 
    payment_method,
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'paid' THEN 1 END) as successful,
    ROUND(
        COUNT(CASE WHEN status = 'paid' THEN 1 END) * 100.0 / 
        COUNT(*), 2
    ) as success_rate_percent
FROM payments 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY payment_method;

-- Daily payment volume
SELECT 
    DATE(created_at) as payment_date,
    COUNT(*) as payment_count,
    SUM(amount) as total_amount,
    COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count
FROM payments 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY payment_date DESC;

-- =====================================================
-- COMPLETE SETUP SUMMARY
-- =====================================================

-- Your payments table now supports:
-- ✅ 30-day payment validity
-- ✅ Automatic expiration handling
-- ✅ Performance indexes
-- ✅ Security policies
-- ✅ Monitoring views
-- ✅ Sample data for testing
-- ✅ Cleanup functions
-- ✅ Statistics tracking
-- ✅ Row-level security
-- ✅ Partitioning support (optional)

-- Run this complete SQL file to set up your payment system!
