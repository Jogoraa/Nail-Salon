-- Add capacity_overrides table for managing special capacity settings
-- This script adds the necessary table for capacity management without requiring the full enhanced schema

-- Create capacity_overrides table
CREATE TABLE IF NOT EXISTS capacity_overrides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    override_date DATE NOT NULL,
    override_time TIME NOT NULL,
    max_bookings INTEGER NOT NULL CHECK (max_bookings > 0),
    reason TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique overrides per service, date, and time
    UNIQUE(service_id, override_date, override_time)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_capacity_overrides_service_date ON capacity_overrides(service_id, override_date);
CREATE INDEX IF NOT EXISTS idx_capacity_overrides_date_time ON capacity_overrides(override_date, override_time);
CREATE INDEX IF NOT EXISTS idx_capacity_overrides_active ON capacity_overrides(is_active);

-- Add comments for documentation
COMMENT ON TABLE capacity_overrides IS 'Specific date/time capacity overrides for holidays, special events, or peak times';
COMMENT ON COLUMN capacity_overrides.service_id IS 'Reference to the service this override applies to';
COMMENT ON COLUMN capacity_overrides.override_date IS 'Date when this override is active';
COMMENT ON COLUMN capacity_overrides.override_time IS 'Time slot when this override is active';
COMMENT ON COLUMN capacity_overrides.max_bookings IS 'Maximum number of bookings allowed during this time slot';
COMMENT ON COLUMN capacity_overrides.reason IS 'Reason for the override (e.g., holiday, special event)';
COMMENT ON COLUMN capacity_overrides.is_active IS 'Whether this override is currently active';

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_capacity_overrides_updated_at ON capacity_overrides;
CREATE TRIGGER update_capacity_overrides_updated_at 
    BEFORE UPDATE ON capacity_overrides 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample overrides for testing (optional)
-- INSERT INTO capacity_overrides (service_id, override_date, override_time, max_bookings, reason) VALUES
--     ('your-service-id-here', '2024-12-25', '09:00', 0, 'Christmas Day - Closed'),
--     ('your-service-id-here', '2024-12-31', '18:00', 3, 'New Year''s Eve - Limited Capacity');

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON capacity_overrides TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
