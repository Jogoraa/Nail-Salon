-- Enhanced Capacity Management Schema
-- This script adds new tables and columns to support advanced capacity management

-- Add new columns to existing services table for enhanced scheduling
ALTER TABLE services ADD COLUMN IF NOT EXISTS default_start_time TIME DEFAULT '09:00';
ALTER TABLE services ADD COLUMN IF NOT EXISTS default_end_time TIME DEFAULT '18:00';
ALTER TABLE services ADD COLUMN IF NOT EXISTS slot_duration INTEGER DEFAULT 30; -- minutes per slot
ALTER TABLE services ADD COLUMN IF NOT EXISTS buffer_time INTEGER DEFAULT 0; -- minutes between appointments
ALTER TABLE services ADD COLUMN IF NOT EXISTS max_bookings_per_slot INTEGER DEFAULT 1; -- ensure this exists

-- Service operating hours and special schedules
CREATE TABLE IF NOT EXISTS service_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  max_bookings_per_slot INTEGER NOT NULL,
  is_available BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(service_id, date)
);

-- Time slot templates for services
CREATE TABLE IF NOT EXISTS service_time_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration INTEGER NOT NULL, -- minutes
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Capacity override for specific dates/times
CREATE TABLE IF NOT EXISTS capacity_overrides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  override_date DATE NOT NULL,
  override_time TIME NOT NULL,
  max_bookings INTEGER NOT NULL,
  reason TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(service_id, override_date, override_time)
);

-- Waitlist management for fully booked slots
CREATE TABLE IF NOT EXISTS waitlist_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  preferred_date DATE NOT NULL,
  preferred_time TIME NOT NULL,
  alternative_dates DATE[] DEFAULT '{}',
  alternative_times TIME[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'notified', 'converted', 'expired', 'cancelled')),
  priority INTEGER DEFAULT 1, -- higher number = higher priority
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Availability cache for performance optimization
CREATE TABLE IF NOT EXISTS availability_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  cache_date DATE NOT NULL,
  cache_time TIME NOT NULL,
  available_slots INTEGER NOT NULL,
  max_slots INTEGER NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour'),
  UNIQUE(service_id, cache_date, cache_time)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_service_schedules_service_date ON service_schedules(service_id, date);
CREATE INDEX IF NOT EXISTS idx_service_time_slots_service ON service_time_slots(service_id);
CREATE INDEX IF NOT EXISTS idx_capacity_overrides_service_date_time ON capacity_overrides(service_id, override_date, override_time);
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_service_date ON waitlist_entries(service_id, preferred_date);
CREATE INDEX IF NOT EXISTS idx_availability_cache_service_date_time ON availability_cache(service_id, cache_date, cache_time);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(appointment_date, appointment_time);
CREATE INDEX IF NOT EXISTS idx_appointment_services_service_id ON appointment_services(service_id);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
CREATE TRIGGER update_service_schedules_updated_at BEFORE UPDATE ON service_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_time_slots_updated_at BEFORE UPDATE ON service_time_slots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_capacity_overrides_updated_at BEFORE UPDATE ON capacity_overrides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_waitlist_entries_updated_at BEFORE UPDATE ON waitlist_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get available slots for a service at a specific date/time
CREATE OR REPLACE FUNCTION get_available_slots(
  p_service_id UUID,
  p_date DATE,
  p_time TIME
) RETURNS INTEGER AS $$
DECLARE
  max_slots INTEGER;
  current_bookings INTEGER;
BEGIN
  -- Get max slots (check overrides first, then schedules, then default)
  SELECT max_bookings INTO max_slots
  FROM capacity_overrides
  WHERE service_id = p_service_id 
    AND override_date = p_date 
    AND override_time = p_time 
    AND is_active = true;
  
  IF max_slots IS NULL THEN
    SELECT max_bookings_per_slot INTO max_slots
    FROM service_schedules
    WHERE service_id = p_service_id 
      AND date = p_date 
      AND is_available = true;
  END IF;
  
  IF max_slots IS NULL THEN
    SELECT max_bookings_per_slot INTO max_slots
    FROM services
    WHERE id = p_service_id 
      AND is_active = true;
  END IF;
  
  -- If service not found or inactive, return 0
  IF max_slots IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Count current bookings
  SELECT COUNT(*) INTO current_bookings
  FROM appointments a
  JOIN appointment_services aps ON a.id = aps.appointment_id
  WHERE aps.service_id = p_service_id
    AND a.appointment_date = p_date
    AND a.appointment_time = p_time
    AND a.status NOT IN ('cancelled');
  
  RETURN GREATEST(0, max_slots - current_bookings);
END;
$$ LANGUAGE plpgsql;

-- Function to check if a booking is possible
CREATE OR REPLACE FUNCTION can_book_service(
  p_service_id UUID,
  p_date DATE,
  p_time TIME,
  p_quantity INTEGER DEFAULT 1
) RETURNS BOOLEAN AS $$
DECLARE
  available_slots INTEGER;
BEGIN
  SELECT get_available_slots(p_service_id, p_date, p_time) INTO available_slots;
  RETURN available_slots >= p_quantity;
END;
$$ LANGUAGE plpgsql;

-- Function to get availability for multiple services and times
CREATE OR REPLACE FUNCTION get_service_availability(
  p_service_ids UUID[],
  p_date DATE,
  p_start_time TIME DEFAULT '09:00',
  p_end_time TIME DEFAULT '18:00',
  p_slot_duration INTEGER DEFAULT 30
) RETURNS TABLE (
  service_id UUID,
  service_name TEXT,
  time_slot TIME,
  max_capacity INTEGER,
  current_bookings INTEGER,
  available_slots INTEGER,
  is_available BOOLEAN
) AS $$
DECLARE
  current_time TIME;
  service_record RECORD;
BEGIN
  -- Loop through each service
  FOR service_record IN 
    SELECT id, name FROM services WHERE id = ANY(p_service_ids) AND is_active = true
  LOOP
    -- Generate time slots for this service
    current_time := p_start_time;
    WHILE current_time <= p_end_time LOOP
      SELECT 
        service_record.id,
        service_record.name,
        current_time,
        COALESCE(co.max_bookings, ss.max_bookings_per_slot, s.max_bookings_per_slot, 1),
        COUNT(a.id),
        get_available_slots(service_record.id, p_date, current_time),
        get_available_slots(service_record.id, p_date, current_time) > 0
      INTO 
        service_id, service_name, time_slot, max_capacity, current_bookings, available_slots, is_available
      FROM services s
      LEFT JOIN service_schedules ss ON s.id = ss.service_id AND ss.date = p_date
      LEFT JOIN capacity_overrides co ON s.id = co.service_id AND co.override_date = p_date AND co.override_time = current_time
      LEFT JOIN appointments a ON a.appointment_date = p_date AND a.appointment_time = current_time AND a.status NOT IN ('cancelled')
      LEFT JOIN appointment_services aps ON a.id = aps.appointment_id AND aps.service_id = s.id
      WHERE s.id = service_record.id
      GROUP BY s.id, s.name, ss.max_bookings_per_slot, co.max_bookings;
      
      RETURN NEXT;
      
      -- Move to next time slot
      current_time := current_time + (p_slot_duration || ' minutes')::INTERVAL;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Insert default time slots for existing services
INSERT INTO service_time_slots (service_id, start_time, end_time, slot_duration)
SELECT 
  id,
  COALESCE(default_start_time, '09:00'::TIME),
  COALESCE(default_end_time, '18:00'::TIME),
  COALESCE(slot_duration, 30)
FROM services 
WHERE is_active = true
ON CONFLICT DO NOTHING;

-- Update existing services with default capacity if not set
UPDATE services 
SET max_bookings_per_slot = 1 
WHERE max_bookings_per_slot IS NULL;

-- Create view for easy availability checking
CREATE OR REPLACE VIEW service_availability_summary AS
SELECT 
  s.id as service_id,
  s.name as service_name,
  s.max_bookings_per_slot as default_capacity,
  s.default_start_time,
  s.default_end_time,
  s.slot_duration,
  COUNT(DISTINCT a.id) as total_appointments,
  COUNT(DISTINCT CASE WHEN a.appointment_date >= CURRENT_DATE THEN a.id END) as future_appointments
FROM services s
LEFT JOIN appointment_services aps ON s.id = aps.service_id
LEFT JOIN appointments a ON aps.appointment_id = a.id AND a.status NOT IN ('cancelled')
WHERE s.is_active = true
GROUP BY s.id, s.name, s.max_bookings_per_slot, s.default_start_time, s.default_end_time, s.slot_duration;

COMMENT ON TABLE service_schedules IS 'Date-specific capacity overrides for services';
COMMENT ON TABLE service_time_slots IS 'Operating hours and time slot configuration for services';
COMMENT ON TABLE capacity_overrides IS 'Specific date/time capacity overrides (holidays, special events)';
COMMENT ON TABLE waitlist_entries IS 'Customer waitlist for fully booked time slots';
COMMENT ON TABLE availability_cache IS 'Performance cache for availability calculations';
COMMENT ON FUNCTION get_available_slots IS 'Calculate available booking slots for a service at specific date/time';
COMMENT ON FUNCTION can_book_service IS 'Check if a booking is possible for given parameters';
COMMENT ON FUNCTION get_service_availability IS 'Get comprehensive availability data for multiple services';

