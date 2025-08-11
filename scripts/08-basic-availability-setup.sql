-- Basic Availability Setup for Existing Database Schema
-- This script adds the minimum required columns and structure for the availability system to work

-- Add capacity management columns to services table if they don't exist
ALTER TABLE services ADD COLUMN IF NOT EXISTS max_bookings_per_slot INTEGER DEFAULT 1;
ALTER TABLE services ADD COLUMN IF NOT EXISTS default_start_time TIME DEFAULT '09:00';
ALTER TABLE services ADD COLUMN IF NOT EXISTS default_end_time TIME DEFAULT '18:00';
ALTER TABLE services ADD COLUMN IF NOT EXISTS slot_duration INTEGER DEFAULT 30;

-- Update existing services to have default capacity if not set
UPDATE services SET max_bookings_per_slot = 1 WHERE max_bookings_per_slot IS NULL;

-- Create a simple function to check if a service can be booked at a specific time
CREATE OR REPLACE FUNCTION can_book_service_simple(
  p_service_id UUID,
  p_date DATE,
  p_time TIME
) RETURNS BOOLEAN AS $$
DECLARE
  max_slots INTEGER;
  current_bookings INTEGER;
BEGIN
  -- Get max slots for the service
  SELECT max_bookings_per_slot INTO max_slots
  FROM services
  WHERE id = p_service_id AND is_active = true;
  
  -- If service not found or inactive, return false
  IF max_slots IS NULL THEN
    RETURN false;
  END IF;
  
  -- Count current bookings for this service at this time
  SELECT COUNT(*) INTO current_bookings
  FROM appointments a
  JOIN appointment_services aps ON a.id = aps.appointment_id
  WHERE aps.service_id = p_service_id
    AND a.appointment_date = p_date
    AND a.appointment_time = p_time
    AND a.status NOT IN ('cancelled');
  
  -- Return true if there's still capacity
  RETURN current_bookings < max_slots;
END;
$$ LANGUAGE plpgsql;

-- Create a simple function to get available time slots for a service
CREATE OR REPLACE FUNCTION get_available_times_simple(
  p_service_id UUID,
  p_date DATE,
  p_start_time TIME DEFAULT '09:00',
  p_end_time TIME DEFAULT '18:00',
  p_slot_duration INTEGER DEFAULT 30
) RETURNS TABLE (
  time_slot TIME,
  is_available BOOLEAN,
  available_slots INTEGER
) AS $$
DECLARE
  current_time TIME;
  max_slots INTEGER;
  current_bookings INTEGER;
BEGIN
  -- Get max slots for the service
  SELECT max_bookings_per_slot INTO max_slots
  FROM services
  WHERE id = p_service_id AND is_active = true;
  
  -- If service not found or inactive, return empty
  IF max_slots IS NULL THEN
    RETURN;
  END IF;
  
  -- Generate time slots
  current_time := p_start_time;
  WHILE current_time <= p_end_time LOOP
    -- Count current bookings for this time slot
    SELECT COUNT(*) INTO current_bookings
    FROM appointments a
    JOIN appointment_services aps ON a.id = aps.appointment_id
    WHERE aps.service_id = p_service_id
      AND a.appointment_date = p_date
      AND a.appointment_time = current_time
      AND a.status NOT IN ('cancelled');
    
    -- Return time slot info
    time_slot := current_time;
    is_available := current_bookings < max_slots;
    available_slots := GREATEST(0, max_slots - current_bookings);
    
    RETURN NEXT;
    
    -- Move to next time slot
    current_time := current_time + (p_slot_duration || ' minutes')::INTERVAL;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON FUNCTION can_book_service_simple IS 'Simple function to check if a service can be booked at a specific time';
COMMENT ON FUNCTION get_available_times_simple IS 'Simple function to get available time slots for a service on a specific date';
