"use server"

import { supabaseAdmin } from "./supabase-server"
import type { Service } from "./supabase"

// Types for availability system
export interface TimeSlotAvailability {
  time: string
  maxCapacity: number
  currentBookings: number
  availableSlots: number
  isAvailable: boolean
}

export interface ServiceAvailability {
  serviceId: string
  serviceName: string
  timeSlots: TimeSlotAvailability[]
}

export interface AvailabilityRequest {
  date: string // YYYY-MM-DD format
  serviceIds: string[]
  startTime?: string // HH:MM format, default 09:00
  endTime?: string // HH:MM format, default 18:00
  slotDuration?: number // minutes, default 30
}

export interface AvailabilityResponse {
  date: string
  services: ServiceAvailability[]
  lastUpdated: string
}

/**
 * Get availability for multiple services on a specific date
 * This version works with the existing database schema
 */
export async function getServiceAvailability(request: AvailabilityRequest): Promise<AvailabilityResponse> {
  console.log("=== GETTING SERVICE AVAILABILITY ===")
  console.log("Request:", request)

  try {
    const {
      date,
      serviceIds,
      startTime = "09:00",
      endTime = "18:00",
      slotDuration = 30
    } = request

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error("Invalid date format. Use YYYY-MM-DD")
    }

    // Validate service IDs
    if (!serviceIds || serviceIds.length === 0) {
      throw new Error("At least one service ID is required")
    }

    // Get service details first
    const { data: services, error: servicesError } = await supabaseAdmin
      .from('services')
      .select('id, name')
      .in('id', serviceIds)
      .eq('is_active', true)

    if (servicesError) {
      console.error("Error fetching services:", servicesError)
      throw new Error("Failed to fetch service information")
    }

    if (!services || services.length === 0) {
      throw new Error("No active services found")
    }

    // Generate time slots
    const timeSlots = generateTimeSlots(startTime, endTime, slotDuration)
    
    // Get existing bookings for the date
    const { data: existingBookings, error: bookingsError } = await supabaseAdmin
      .from('appointments')
      .select(`
        appointment_time,
        status,
        appointment_services!inner(service_id)
      `)
      .eq('appointment_date', date)
      .neq('status', 'cancelled')

    if (bookingsError) {
      console.error("Error fetching existing bookings:", bookingsError)
      throw new Error("Failed to fetch existing bookings")
    }

    // Count bookings per service per time slot
    const bookingCounts = new Map<string, Map<string, number>>()
    
    // Initialize counts
    serviceIds.forEach(serviceId => {
      bookingCounts.set(serviceId, new Map())
      timeSlots.forEach(time => {
        bookingCounts.get(serviceId)!.set(time, 0)
      })
    })

    // Count actual bookings
    existingBookings?.forEach(booking => {
      const time = booking.appointment_time
      booking.appointment_services?.forEach((appointmentService: any) => {
        const serviceId = appointmentService.service_id
        if (serviceIds.includes(serviceId)) {
          const currentCount = bookingCounts.get(serviceId)?.get(time) || 0
          bookingCounts.get(serviceId)?.set(time, currentCount + 1)
        }
      })
    })

    // Build availability response
    const serviceMap = new Map<string, ServiceAvailability>()

    services.forEach(service => {
      const timeSlotsData: TimeSlotAvailability[] = timeSlots.map(time => {
        const currentBookings = bookingCounts.get(service.id)?.get(time) || 0
        const maxCapacity = 1 // Default capacity per service per slot
        const availableSlots = Math.max(0, maxCapacity - currentBookings)
        const isAvailable = availableSlots > 0

        return {
          time,
          maxCapacity,
          currentBookings,
          availableSlots,
          isAvailable
        }
      })

      serviceMap.set(service.id, {
        serviceId: service.id,
        serviceName: service.name,
        timeSlots: timeSlotsData
      })
    })

    const response: AvailabilityResponse = {
      date,
      services: Array.from(serviceMap.values()),
      lastUpdated: new Date().toISOString()
    }

    console.log(`Found availability for ${response.services.length} services`)
    return response

  } catch (error) {
    console.error("Exception in getServiceAvailability:", error)
    throw error
  }
}

/**
 * Generate time slots between start and end time
 */
function generateTimeSlots(startTime: string, endTime: string, slotDuration: number): string[] {
  const slots: string[] = []
  const start = parseTime(startTime)
  const end = parseTime(endTime)
  
  let current = start
  while (current <= end) {
    slots.push(formatTime(current))
    current += slotDuration
  }
  
  return slots
}

/**
 * Parse time string (HH:MM) to minutes
 */
function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Format minutes to time string (HH:MM)
 */
function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

/**
 * Check if specific services can be booked at a given date/time
 * This version works with the existing database schema
 */
export async function canBookServices(
  serviceIds: string[],
  date: string,
  time: string,
  quantities: number[] = []
): Promise<{ canBook: boolean; conflicts: string[] }> {
  console.log("=== CHECKING BOOKING AVAILABILITY ===")
  console.log("Services:", serviceIds, "Date:", date, "Time:", time)

  try {
    const conflicts: string[] = []

    // Get existing bookings for the specific date and time
    const { data: existingBookings, error: bookingsError } = await supabaseAdmin
      .from('appointments')
      .select(`
        appointment_services!inner(service_id)
      `)
      .eq('appointment_date', date)
      .eq('appointment_time', time)
      .neq('status', 'cancelled')

    if (bookingsError) {
      console.error("Error checking existing bookings:", bookingsError)
      throw new Error("Failed to check booking availability")
    }

    // Count existing bookings per service
    const serviceBookingCounts = new Map<string, number>()
    serviceIds.forEach(id => serviceBookingCounts.set(id, 0))

    existingBookings?.forEach(booking => {
      booking.appointment_services?.forEach((appointmentService: any) => {
        const serviceId = appointmentService.service_id
        if (serviceIds.includes(serviceId)) {
          const currentCount = serviceBookingCounts.get(serviceId) || 0
          serviceBookingCounts.set(serviceId, currentCount + 1)
        }
      })
    })

    // Check if each service can be booked
    for (let i = 0; i < serviceIds.length; i++) {
      const serviceId = serviceIds[i]
      const quantity = quantities[i] || 1
      const currentBookings = serviceBookingCounts.get(serviceId) || 0
      const maxCapacity = 1 // Default capacity per service per slot

      if (currentBookings + quantity > maxCapacity) {
        // Get service name for better error message
        const { data: service } = await supabaseAdmin
          .from('services')
          .select('name')
          .eq('id', serviceId)
          .single()

        conflicts.push(service?.name || `Service ${serviceId}`)
      }
    }

    return {
      canBook: conflicts.length === 0,
      conflicts
    }

  } catch (error) {
    console.error("Exception in canBookServices:", error)
    throw error
  }
}

/**
 * Get available time slots for a specific date and services
 */
export async function getAvailableTimeSlots(
  serviceIds: string[],
  date: string
): Promise<string[]> {
  console.log("=== GETTING AVAILABLE TIME SLOTS ===")

  try {
    const availability = await getServiceAvailability({
      date,
      serviceIds
    })

    // Find time slots where ALL selected services are available
    const allTimeSlots = new Set<string>()
    
    // Collect all possible time slots
    availability.services.forEach(service => {
      service.timeSlots.forEach(slot => {
        allTimeSlots.add(slot.time)
      })
    })

    // Filter to only slots where all services are available
    const availableSlots = Array.from(allTimeSlots).filter(timeSlot => {
      return availability.services.every(service => {
        const slot = service.timeSlots.find(s => s.time === timeSlot)
        return slot && slot.isAvailable
      })
    })

    console.log(`Found ${availableSlots.length} available time slots`)
    return availableSlots.sort()

  } catch (error) {
    console.error("Exception in getAvailableTimeSlots:", error)
    return []
  }
}

/**
 * Update service capacity settings
 */
export async function updateServiceCapacity(
  serviceId: string,
  maxBookingsPerSlot: number,
  startTime?: string,
  endTime?: string,
  slotDuration?: number,
  bufferTime?: number
): Promise<{ success: boolean; message: string }> {
  console.log("=== UPDATING SERVICE CAPACITY ===")
  console.log("Service ID:", serviceId)
  console.log("Max Bookings:", maxBookingsPerSlot)
  console.log("Start Time:", startTime)
  console.log("End Time:", endTime)
  console.log("Slot Duration:", slotDuration)
  console.log("Buffer Time:", bufferTime)

  try {
    // Update the service record with all capacity fields
    const updateData: any = {
      max_bookings_per_slot: maxBookingsPerSlot
    }

    if (startTime) updateData.default_start_time = startTime
    if (endTime) updateData.default_end_time = endTime
    if (slotDuration) updateData.slot_duration = slotDuration
    if (bufferTime !== undefined) updateData.buffer_time = bufferTime

    console.log("Updating service with data:", updateData)

    const { error: serviceError } = await supabaseAdmin
      .from('services')
      .update(updateData)
      .eq('id', serviceId)

    if (serviceError) {
      console.error("Error updating service:", serviceError)
      return { success: false, message: "Failed to update service capacity: " + serviceError.message }
    }

    // Clear availability cache for this service (if it exists)
    try {
      await clearAvailabilityCache(serviceId)
    } catch (cacheError) {
      console.warn("Could not clear availability cache:", cacheError)
      // This is not critical, so we continue
    }

    return { success: true, message: "Service capacity updated successfully" }

  } catch (error) {
    console.error("Exception in updateServiceCapacity:", error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "An unexpected error occurred" 
    }
  }
}

/**
 * Set capacity override for specific date/time
 */
export async function setCapacityOverride(
  serviceId: string,
  date: string,
  time: string,
  maxBookings: number,
  reason?: string
): Promise<{ success: boolean; message: string }> {
  console.log("=== SETTING CAPACITY OVERRIDE ===")
  console.log("Service ID:", serviceId)
  console.log("Date:", date)
  console.log("Time:", time)
  console.log("Max Bookings:", maxBookings)
  console.log("Reason:", reason)

  try {
    // First, check if the capacity_overrides table exists
    const { data: tableExists, error: tableCheckError } = await supabaseAdmin
      .from('capacity_overrides')
      .select('id')
      .limit(1)

    if (tableCheckError) {
      console.error("Table check error:", tableCheckError)
      // If the table doesn't exist, we'll create a fallback solution
      // For now, we'll store the override in the services table as a JSON field
      // or create a simple override record
      
      // Try to update the service with override information
      const { error: updateError } = await supabaseAdmin
        .from('services')
        .update({
          // Store override info in notes or create a custom field
          notes: `OVERRIDE: ${date} ${time} - Max: ${maxBookings}${reason ? ` - Reason: ${reason}` : ''}`
        })
        .eq('id', serviceId)

      if (updateError) {
        console.error("Error updating service with override:", updateError)
        return { 
          success: false, 
          message: "Capacity overrides table not available. Please run the database setup script first." 
        }
      }

      return { 
        success: true, 
        message: "Capacity override stored temporarily. Please run the database setup script to enable full override functionality." 
      }
    }

    // If table exists, proceed with normal override creation
    const { error } = await supabaseAdmin
      .from('capacity_overrides')
      .upsert({
        service_id: serviceId,
        override_date: date,
        override_time: time,
        max_bookings: maxBookings,
        reason: reason || null,
        is_active: true
      })

    if (error) {
      console.error("Error setting capacity override:", error)
      return { success: false, message: "Failed to set capacity override: " + error.message }
    }

    // Clear availability cache for this service and date (if it exists)
    try {
      await clearAvailabilityCache(serviceId, date)
    } catch (cacheError) {
      console.warn("Could not clear availability cache:", cacheError)
      // This is not critical, so we continue
    }

    return { success: true, message: "Capacity override set successfully" }

  } catch (error) {
    console.error("Exception in setCapacityOverride:", error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "An unexpected error occurred" 
    }
  }
}

/**
 * Add customer to waitlist for fully booked slot
 */
export async function addToWaitlist(
  customerId: string,
  serviceId: string,
  preferredDate: string,
  preferredTime: string,
  alternativeDates?: string[],
  alternativeTimes?: string[]
): Promise<{ success: boolean; message: string }> {
  console.log("=== ADDING TO WAITLIST ===")

  try {
    const { error } = await supabaseAdmin
      .from('waitlist_entries')
      .insert({
        customer_id: customerId,
        service_id: serviceId,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        alternative_dates: alternativeDates || [],
        alternative_times: alternativeTimes || [],
        status: 'active'
      })

    if (error) {
      console.error("Error adding to waitlist:", error)
      return { success: false, message: "Failed to add to waitlist" }
    }

    return { success: true, message: "Added to waitlist successfully" }

  } catch (error) {
    console.error("Exception in addToWaitlist:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

/**
 * Get capacity overrides for a service
 */
export async function getCapacityOverrides(serviceId?: string): Promise<{
  success: boolean
  overrides?: any[]
  message?: string
}> {
  console.log("=== GETTING CAPACITY OVERRIDES ===")
  console.log("Service ID:", serviceId)

  try {
    // Check if the capacity_overrides table exists
    const { data: tableExists, error: tableCheckError } = await supabaseAdmin
      .from('capacity_overrides')
      .select('id')
      .limit(1)

    if (tableCheckError) {
      console.error("Table check error:", tableCheckError)
      return { 
        success: false, 
        message: "Capacity overrides table not available. Please run the database setup script first." 
      }
    }

    let query = supabaseAdmin
      .from('capacity_overrides')
      .select(`
        id,
        service_id,
        override_date,
        override_time,
        max_bookings,
        reason,
        is_active,
        created_at,
        updated_at,
        services!inner(name)
      `)
      .eq('is_active', true)

    if (serviceId) {
      query = query.eq('service_id', serviceId)
    }

    const { data: overrides, error } = await query

    if (error) {
      console.error("Error fetching capacity overrides:", error)
      return { success: false, message: "Failed to fetch capacity overrides" }
    }

    return { success: true, overrides: overrides || [] }

  } catch (error) {
    console.error("Exception in getCapacityOverrides:", error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "An unexpected error occurred" 
    }
  }
}

/**
 * Clear availability cache for a service
 */
async function clearAvailabilityCache(serviceId: string, date?: string): Promise<void> {
  try {
    // Check if the availability_cache table exists
    const { data: tableExists, error: tableCheckError } = await supabaseAdmin
      .from('availability_cache')
      .select('id')
      .limit(1)

    if (tableCheckError) {
      console.log("Availability cache table not available, skipping cache clear")
      return
    }

    let query = supabaseAdmin
      .from('availability_cache')
      .delete()
      .eq('service_id', serviceId)

    if (date) {
      query = query.eq('cache_date', date)
    }

    await query

    console.log(`Cleared availability cache for service ${serviceId}`)
  } catch (error) {
    console.warn("Could not clear availability cache:", error)
    // This is not critical, so we continue
  }
}

/**
 * Get service capacity configuration
 */
export async function getServiceCapacityConfig(serviceId: string) {
  try {
    const { data: service, error: serviceError } = await supabaseAdmin
      .from('services')
      .select(`
        id,
        name,
        max_bookings_per_slot,
        default_start_time,
        default_end_time,
        slot_duration,
        buffer_time
      `)
      .eq('id', serviceId)
      .single()

    if (serviceError) {
      throw new Error("Service not found")
    }

    const { data: timeSlots, error: slotsError } = await supabaseAdmin
      .from('service_time_slots')
      .select('*')
      .eq('service_id', serviceId)
      .eq('is_active', true)

    const { data: overrides, error: overridesError } = await supabaseAdmin
      .from('capacity_overrides')
      .select('*')
      .eq('service_id', serviceId)
      .eq('is_active', true)
      .gte('override_date', new Date().toISOString().split('T')[0])

    return {
      service,
      timeSlots: timeSlots || [],
      overrides: overrides || []
    }

  } catch (error) {
    console.error("Exception in getServiceCapacityConfig:", error)
    throw error
  }
}

/**
 * Get waitlist entries for a service
 */
export async function getWaitlistEntries(serviceId: string, date?: string) {
  try {
    let query = supabaseAdmin
      .from('waitlist_entries')
      .select(`
        *,
        customer:customers(*)
      `)
      .eq('service_id', serviceId)
      .eq('status', 'active')
      .order('created_at', { ascending: true })

    if (date) {
      query = query.eq('preferred_date', date)
    }

    const { data, error } = await query

    if (error) {
      throw new Error("Failed to fetch waitlist entries")
    }

    return data || []

  } catch (error) {
    console.error("Exception in getWaitlistEntries:", error)
    throw error
  }
}

