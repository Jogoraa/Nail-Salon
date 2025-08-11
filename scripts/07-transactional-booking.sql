-- Transactional booking with capacity checks and advisory locks
-- Ensures concurrent bookings cannot overbook the same service/time slot

CREATE OR REPLACE FUNCTION book_appointment_tx(
  p_customer_id UUID,
  p_service_ids UUID[],
  p_date DATE,
  p_time TIME,
  p_notes TEXT DEFAULT NULL
) RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  appointment_id UUID,
  conflicts TEXT[]
) AS $$
DECLARE
  s UUID;
  conflict_names TEXT[] := ARRAY[]::TEXT[];
  svc_name TEXT;
  app_id UUID;
  lock_key BIGINT;
BEGIN
  -- Acquire per-service/time advisory locks in a stable order to avoid deadlocks
  FOR s IN SELECT unnest(p_service_ids) ORDER BY 1 LOOP
    lock_key := hashtextextended(s::TEXT || '|' || p_date::TEXT || '|' || p_time::TEXT, 0)::BIGINT;
    PERFORM pg_advisory_xact_lock(lock_key);
  END LOOP;

  -- Re-check capacity within the same transaction after acquiring locks
  FOR s IN SELECT unnest(p_service_ids) LOOP
    IF NOT can_book_service(s, p_date, p_time, 1) THEN
      SELECT name INTO svc_name FROM services WHERE id = s;
      conflict_names := conflict_names || COALESCE(svc_name, s::TEXT);
    END IF;
  END LOOP;

  IF array_length(conflict_names, 1) IS NOT NULL THEN
    success := false;
    message := 'Capacity exceeded for selected time';
    appointment_id := NULL;
    conflicts := conflict_names;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Create appointment
  INSERT INTO appointments (customer_id, appointment_date, appointment_time, notes)
  VALUES (p_customer_id, p_date, p_time, p_notes)
  RETURNING id INTO app_id;

  -- Link services to the appointment
  INSERT INTO appointment_services (appointment_id, service_id, quantity, price_at_booking)
  SELECT app_id, s, 1,
         COALESCE((SELECT price FROM services WHERE id = s), 0)
  FROM unnest(p_service_ids) s;

  success := true;
  message := 'Booked successfully';
  appointment_id := app_id;
  conflicts := ARRAY[]::TEXT[];
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;


