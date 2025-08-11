"use server"

import { supabaseAdmin } from "./supabase-server"
import { revalidatePath } from "next/cache"
import { sendBookingConfirmation, sendAdminNotification } from "./email"
import type { Appointment, ContactMessage, Customer, Service } from "./supabase"
import { createCalcomBooking } from "./createCalcomBooking"
import { createClient } from "./supabase-auth-helpers"
import { redirect } from "next/navigation"
import { canBookServices, getServiceAvailability } from "./availability"

/**
 * Enhanced booking function with integrated capacity checking
 */
export async function bookAppointmentWithCapacityCheck(formData: FormData) {
  console.log("=== ENHANCED BOOKING APPOINTMENT START ===")

  try {
    // Validate that formData exists
    if (!formData) {
      console.error("FormData is null or undefined")
      return { success: false, message: "Form data is missing. Please try again." }
    }

    console.log("FormData entries:")
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`)
    }

    // Extract form data
    const serviceIds = formData.getAll("serviceIds[]") as string[]
    const firstName = formData.get("firstName")?.toString() || ""
    const lastName = formData.get("lastName")?.toString() || ""
    const email = formData.get("email")?.toString() || ""
    const phone = formData.get("phone")?.toString() || ""
    const appointmentDate = formData.get("appointmentDate")?.toString() || ""
    const appointmentTime = formData.get("appointmentTime")?.toString() || ""
    const notes = formData.get("notes")?.toString() || ""

    console.log("Parsed form data:", {
      firstName,
      lastName,
      email,
      phone,
      serviceIds,
      appointmentDate,
      appointmentTime,
      notes,
    })

    // Basic validation
    if (!firstName || !lastName || !email || serviceIds.length === 0 || !appointmentDate || !appointmentTime) {
      console.error("Missing required fields")
      return { success: false, message: "Please fill in all required fields." }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.error("Invalid email format")
      return { success: false, message: "Please enter a valid email address." }
    }

    // ENHANCED: Check availability using the new capacity system
    console.log("🔍 Checking availability with enhanced capacity system...")
    
    const availabilityCheck = await canBookServices(serviceIds, appointmentDate, appointmentTime)
    
    if (!availabilityCheck.canBook) {
      console.warn("❌ Booking not available due to capacity constraints")
      const conflictServices = availabilityCheck.conflicts.join(", ")
      return {
        success: false,
        message: `Sorry, the following services are fully booked at ${appointmentTime} on ${appointmentDate}: ${conflictServices}. Please choose a different time or service.`,
        conflicts: availabilityCheck.conflicts
      }
    }

    console.log("✅ Availability confirmed, proceeding with booking...")

    // Get service details for booking
    const { data: services, error: serviceError } = await supabaseAdmin
      .from("services")
      .select("id, name, price, duration")
      .in("id", serviceIds)

    if (serviceError) {
      console.error("Service lookup error:", serviceError)
      return { success: false, message: "Invalid service selection." }
    }

    console.log("Services found:", services)

    // Create or get customer
    console.log("Checking for existing customer...")
    let { data: customer, error: customerError } = await supabaseAdmin
      .from("customers")
      .select("*")
      .eq("email", email)
      .single()

    if (customerError && customerError.code !== "PGRST116") {
      console.error("Customer lookup error:", customerError)
      return { success: false, message: "Failed to process booking." }
    }

    if (!customer) {
      console.log("Creating new customer...")
      const { data: newCustomer, error: insertError } = await supabaseAdmin
        .from("customers")
        .insert({
          first_name: firstName,
          last_name: lastName,
          email,
          phone: phone || null,
        })
        .select()
        .single()

      if (insertError) {
        console.error("Customer creation error:", insertError)
        return { success: false, message: "Failed to create customer record." }
      }

      customer = newCustomer
      console.log("New customer created:", customer)
    } else {
      console.log("Existing customer found:", customer)
    }

    // ENHANCED: Double-check availability just before creating appointment
    console.log("🔍 Final availability check before creating appointment...")
    
    const finalCheck = await canBookServices(serviceIds, appointmentDate, appointmentTime)
    
    if (!finalCheck.canBook) {
      console.warn("❌ Availability changed during booking process")
      return {
        success: false,
        message: "Sorry, this time slot was just booked by another customer. Please refresh and try a different time.",
        conflicts: finalCheck.conflicts
      }
    }

    // Create appointment
    const { data: appointmentData, error: appointmentError } = await supabaseAdmin
      .from("appointments")
      .insert({
        customer_id: customer.id,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        notes: notes || null,
      })
      .select()

    if (appointmentError) {
      console.error("Appointment creation error:", appointmentError)
      return { success: false, message: "Failed to book appointment." }
    }

    console.log("Appointment created successfully:", appointmentData)
    const appointmentId = appointmentData?.[0]?.id

    if (!appointmentId) {
      console.error("Missing appointment ID")
      return { success: false, message: "Failed to create appointment link." }
    }

    // Link services to appointment
    for (const serviceId of serviceIds) {
      const service = services?.find(s => s.id === serviceId)
      const { data, error } = await supabaseAdmin
        .from("appointment_services")
        .insert({
          appointment_id: appointmentId,
          service_id: serviceId,
          quantity: 1,
          price_at_booking: service?.price || 0
        })

      if (error) {
        console.error(`Failed to link service ${serviceId}:`, error)
        return { success: false, message: "Failed to link services to appointment." }
      }
    }

    console.log("Services linked to appointment successfully")

    // ENHANCED: Clear availability cache for the booked time slot
    console.log("🧹 Clearing availability cache...")
    try {
      await supabaseAdmin
        .from('availability_cache')
        .delete()
        .in('service_id', serviceIds)
        .eq('cache_date', appointmentDate)
        .eq('cache_time', appointmentTime)
    } catch (cacheError) {
      console.warn("Failed to clear availability cache:", cacheError)
      // Don't fail the booking for cache issues
    }

    // Cal.com integration (if configured)
    try {
      console.log("🗓️ Creating Cal.com booking...")
      const calcomBooking = await createCalcomBooking(
        appointmentData[0] as Appointment,
        customer as Customer,
        services as Service[]
      )

      // Save the Cal.com booking ID
      await supabaseAdmin
        .from("appointments")
        .update({ calcom_booking_id: calcomBooking.booking.id })
        .eq("id", appointmentData[0].id)

      console.log("✅ Cal.com booking created:", calcomBooking)
    } catch (calcomError) {
      console.error("❌ Failed to create Cal.com booking:", calcomError)
      // Don't fail the main booking for Cal.com issues
    }

    // Send confirmation emails (if configured)
    try {
      console.log("📧 Sending confirmation emails...")
      const serviceNames = services?.map(s => s.name).join(", ") || "Selected Services"
      
      await sendBookingConfirmation(
        email,
        `${firstName} ${lastName}`,
        serviceNames,
        appointmentDate,
        appointmentTime
      )
      
      await sendAdminNotification(
        `${firstName} ${lastName}`,
        serviceNames,
        appointmentDate,
        appointmentTime,
        email,
        phone
      )
      
      console.log("✅ Emails sent successfully")
    } catch (emailError) {
      console.error("❌ Email sending error:", emailError)
      // Don't fail the booking if email fails
    }

    revalidatePath("/admin") // Revalidate admin page to show new appointment
    console.log("=== ENHANCED BOOKING APPOINTMENT SUCCESS ===")

    return {
      success: true,
      message: "Appointment booked successfully! We'll confirm your booking soon.",
      appointmentId: appointmentId,
      services: services?.map(s => s.name) || []
    }

  } catch (error) {
    console.error("Exception in bookAppointmentWithCapacityCheck:", error instanceof Error ? error.stack : error)
    return { success: false, message: "An unexpected error occurred. Please try again." }
  }
}

/**
 * Get real-time availability for booking form
 */
export async function getBookingAvailability(date: string, serviceIds: string[]) {
  console.log("=== GETTING BOOKING AVAILABILITY ===")
  
  try {
    if (!date || serviceIds.length === 0) {
      return { timeSlots: [], error: "Date and service selection required" }
    }

    const availability = await getServiceAvailability({
      date,
      serviceIds,
      startTime: "09:00",
      endTime: "18:00",
      slotDuration: 30
    })

    // Transform data for booking form
    const timeSlots = []
    const allTimes = new Set<string>()

    // Collect all possible time slots
    availability.services.forEach(service => {
      service.timeSlots.forEach(slot => {
        allTimes.add(slot.time)
      })
    })

    // Check availability for each time slot
    for (const time of Array.from(allTimes).sort()) {
      const isAvailable = availability.services.every(service => {
        const slot = service.timeSlots.find(s => s.time === time)
        return slot && slot.isAvailable
      })

      const availabilityDetails = availability.services.map(service => {
        const slot = service.timeSlots.find(s => s.time === time)
        return {
          serviceId: service.serviceId,
          serviceName: service.serviceName,
          remainingSlots: slot?.availableSlots || 0,
          isAvailable: slot?.isAvailable || false
        }
      })

      timeSlots.push({
        time,
        label: formatTimeForDisplay(time),
        isAvailable,
        availabilityDetails
      })
    }

    return { timeSlots, error: null }

  } catch (error) {
    console.error("Exception in getBookingAvailability:", error)
    return { timeSlots: [], error: "Failed to fetch availability" }
  }
}

/**
 * Format time for display (e.g., "09:00" -> "9:00 AM")
 */
function formatTimeForDisplay(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

/**
 * Check if a specific time slot is available for selected services
 */
export async function checkTimeSlotAvailability(
  serviceIds: string[],
  date: string,
  time: string
): Promise<{ available: boolean; message?: string; details?: any }> {
  try {
    const result = await canBookServices(serviceIds, date, time)
    
    if (result.canBook) {
      return { available: true }
    } else {
      return {
        available: false,
        message: `The following services are fully booked: ${result.conflicts.join(", ")}`,
        details: result.conflicts
      }
    }
  } catch (error) {
    console.error("Error checking time slot availability:", error)
    return {
      available: false,
      message: "Unable to check availability at this time"
    }
  }
}

/**
 * Get suggested alternative time slots when preferred slot is unavailable
 */
export async function getSuggestedTimeSlots(
  serviceIds: string[],
  preferredDate: string,
  preferredTime: string
): Promise<string[]> {
  try {
    console.log("Getting suggested time slots for:", { serviceIds, preferredDate, preferredTime })

    // Get availability for the entire day
    const availability = await getServiceAvailability({
      date: preferredDate,
      serviceIds,
      startTime: "09:00",
      endTime: "18:00",
      slotDuration: 30
    })

    // Find available time slots
    const availableSlots: string[] = []
    const allTimes = new Set<string>()

    availability.services.forEach(service => {
      service.timeSlots.forEach(slot => {
        allTimes.add(slot.time)
      })
    })

    for (const time of Array.from(allTimes).sort()) {
      const isAvailable = availability.services.every(service => {
        const slot = service.timeSlots.find(s => s.time === time)
        return slot && slot.isAvailable
      })

      if (isAvailable && time !== preferredTime) {
        availableSlots.push(time)
      }
    }

    // Return up to 5 suggestions, prioritizing times close to preferred time
    const preferredTimeMinutes = timeToMinutes(preferredTime)
    
    return availableSlots
      .sort((a, b) => {
        const diffA = Math.abs(timeToMinutes(a) - preferredTimeMinutes)
        const diffB = Math.abs(timeToMinutes(b) - preferredTimeMinutes)
        return diffA - diffB
      })
      .slice(0, 5)

  } catch (error) {
    console.error("Error getting suggested time slots:", error)
    return []
  }
}

/**
 * Convert time string to minutes for comparison
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

