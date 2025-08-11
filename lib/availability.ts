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

    // Use the database function to get availability
    const { data: availabilityData, error } = await supabaseAdmin
      .rpc('get_service_availability', {
        p_service_ids: serviceIds,
        p_date: date,
        p_start_time: startTime,
        p_end_time: endTime,
        p_slot_duration: slotDuration
      })

    if (error) {
      console.error("Error fetching availability:", error)
      throw new Error("Failed to fetch availability data")
    }

    // Group results by service
    const serviceMap = new Map<string, ServiceAvailability>()

    for (const row of availabilityData || []) {
      const serviceId = row.service_id
      
      if (!serviceMap.has(serviceId)) {
        serviceMap.set(serviceId, {
          serviceId,
          serviceName: row.service_name,
          timeSlots: []
        })
      }

      const service = serviceMap.get(serviceId)!
      service.timeSlots.push({
        time: row.time_slot,
        maxCapacity: row.max_capacity,
        currentBookings: row.current_bookings,
        availableSlots: row.available_slots,
        isAvailable: row.is_available
      })
    }

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
 * Check if specific services can be booked at a given date/time
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

    for (let i = 0; i < serviceIds.length; i++) {
      const serviceId = serviceIds[i]
      const quantity = quantities[i] || 1

      const { data: canBook, error } = await supabaseAdmin
        .rpc('can_book_service', {
          p_service_id: serviceId,
          p_date: date,
          p_time: time,
          p_quantity: quantity
        })

      if (error) {
        console.error(`Error checking availability for service ${serviceId}:`, error)
        throw new Error("Failed to check booking availability")
      }

      if (!canBook) {
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
  slotDuration?: number
): Promise<{ success: boolean; message: string }> {
  console.log("=== UPDATING SERVICE CAPACITY ===")

  try {
    // Update the service record
    const updateData: any = {
      max_bookings_per_slot: maxBookingsPerSlot
    }

    if (startTime) updateData.default_start_time = startTime
    if (endTime) updateData.default_end_time = endTime
    if (slotDuration) updateData.slot_duration = slotDuration

    const { error: serviceError } = await supabaseAdmin
      .from('services')
      .update(updateData)
      .eq('id', serviceId)

    if (serviceError) {
      console.error("Error updating service:", serviceError)
      return { success: false, message: "Failed to update service capacity" }
    }

    // Update or create time slot configuration
    if (startTime && endTime && slotDuration) {
      const { error: slotError } = await supabaseAdmin
        .from('service_time_slots')
        .upsert({
          service_id: serviceId,
          start_time: startTime,
          end_time: endTime,
          slot_duration: slotDuration,
          is_active: true
        })

      if (slotError) {
        console.error("Error updating time slots:", slotError)
        return { success: false, message: "Failed to update time slot configuration" }
      }
    }

    // Clear availability cache for this service
    await clearAvailabilityCache(serviceId)

    return { success: true, message: "Service capacity updated successfully" }

  } catch (error) {
    console.error("Exception in updateServiceCapacity:", error)
    return { success: false, message: "An unexpected error occurred" }
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

  try {
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
      return { success: false, message: "Failed to set capacity override" }
    }

    // Clear availability cache for this service and date
    await clearAvailabilityCache(serviceId, date)

    return { success: true, message: "Capacity override set successfully" }

  } catch (error) {
    console.error("Exception in setCapacityOverride:", error)
    return { success: false, message: "An unexpected error occurred" }
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
 * Clear availability cache for a service
 */
async function clearAvailabilityCache(serviceId: string, date?: string): Promise<void> {
  try {
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
    console.error("Error clearing availability cache:", error)
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

