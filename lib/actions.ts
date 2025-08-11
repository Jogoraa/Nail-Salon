"use server"

import { supabaseAdmin } from "./supabase-server"
import { revalidatePath } from "next/cache"
import { sendBookingConfirmation, sendAdminNotification } from "./email"
import type { Appointment, ContactMessage ,Customer, Service} from "./supabase" // Import types
import { createCalcomBooking } from "./createCalcomBooking";
// Add these new imports at the top of the file
import { createClient } from "./supabase-auth-helpers"
import { redirect } from "next/navigation"
import { Console } from "console"
const CALCOM_API_URL = "https://api.cal.com/v1";
const CALCOM_API_KEY = "cal_live_385c7e606106c6d27db04b6f9aae2536"; // your key here

// Modified function to be more hydration-friendly
export async function checkAdminStatus() {
  try {
    console.log("Starting admin status check...")

    const supabase = await createClient()

    if (!supabase) {
      console.error("Failed to create Supabase client")
      redirect("/login")
    }

    console.log("Supabase client created, checking user...")

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    console.log("User check result:", { user: user ? user.email : null, error: userError?.message }) // Modified to log email and error message

    if (userError) {
      console.error("Error getting user:", userError)
      redirect("/login")
    }

    if (!user) {
      console.log("No authenticated user found, redirecting to login")
      redirect("/login")
    }

    console.log("User found, checking admin status for email:", user.email) // Added user.email

    // Check if the user's email exists in the admin_users table
    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("email")
      .eq("email", user.email)
      .single()

    console.log("Admin check result:", { adminUser: !!adminUser, error: adminError?.message }) // Modified to log error message

    if (adminError || !adminUser) {
      console.error(
        "User is not an admin or error checking admin status:",
        adminError?.message || "No admin user found",
      ) // Modified error message
      redirect("/")
    }

    console.log("Admin status confirmed for:", user.email)
    return { user, isAdmin: true }
  } catch (error) {
    console.error("Error in checkAdminStatus:", error)
    redirect("/login")
  }
}

// Add this new server action for logging out
export async function signOut() {
  try {
    const supabase = await createClient()
    if (supabase) {
      await supabase.auth.signOut()
    }
  } catch (error) {
    console.error("Error signing out:", error)
  }
  redirect("/login") // Redirect to login page after logout
}

export async function submitContactForm(formData: FormData) {
  console.log("=== CONTACT FORM SUBMISSION START ===")

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

    const firstName = formData.get("firstName")?.toString() || ""
    const lastName = formData.get("lastName")?.toString() || ""
    const email = formData.get("email")?.toString() || ""
    const phone = formData.get("phone")?.toString() || ""
    const serviceId = formData.get("serviceId")?.toString() || ""
    const message = formData.get("message")?.toString() || ""

    console.log("Parsed form data:", { firstName, lastName, email, phone, serviceId, message })

    // Basic validation
    if (!firstName || !lastName || !email) {
      console.error("Missing required fields")
      return { success: false, message: "Please fill in all required fields." }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.error("Invalid email format")
      return { success: false, message: "Please enter a valid email address." }
    }

    console.log("Attempting to insert contact message into database...")

    // Use admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from("contact_messages")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        service_id: serviceId || null,
        message: message || null,
      })
      .select()

    if (error) {
      console.error("Database error:", error)
      return { success: false, message: "Failed to submit form. Please try again." }
    }

    console.log("Contact message inserted successfully:", data)
    revalidatePath("/admin") // Revalidate admin page to show new message
    console.log("=== CONTACT FORM SUBMISSION SUCCESS ===")

    return { success: true, message: "Thank you! We'll get back to you soon." }
  } catch (error) {
    console.error("Exception in submitContactForm:", error)
    return { success: false, message: "An unexpected error occurred. Please try again." }
  }
}

export async function bookAppointment(formData: FormData) {
  console.log("=== BOOKING APPOINTMENT START ===")

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
//   THE NEWLY ADDED MULTIPLE SERVICE HANDLING
      const rawServiceIds = formData.get("serviceIds")?.toString() || "[]"
   const serviceIds = formData.getAll("serviceIds[]") as string[]

    const firstName = formData.get("firstName")?.toString() || ""
    const lastName = formData.get("lastName")?.toString() || ""
    const email = formData.get("email")?.toString() || ""
    const phone = formData.get("phone")?.toString() || ""
    
    ///const serviceId = formData.get("serviceId")?.toString() || ""
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

console.log("Getting details for multiple services...")

const { data: services, error: serviceError } = await supabaseAdmin
  .from("services")
  .select("id, name")
  .in("id", serviceIds)

if (serviceError) {
  console.error("Service lookup error:", serviceError)
  return { success: false, message: "Invalid service selection." }
}

console.log("Services found:", services)

    console.log("Checking for existing customer...")
    // First, create or get customer using admin client
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
    
//THE CONCURENT APPOINTMENT PREVENTION 
// THE CONCURRENT APPOINTMENT PREVENTION 
console.log("🔍 Checking for overbooking...")

for (const serviceId of serviceIds) {
  console.log(`\n➡️ Checking service ID: ${serviceId}`)

  // 1. Get max allowed for this service + name for better messaging
  const { data: serviceInfo, error: serviceInfoError } = await supabaseAdmin
    .from("services")
    .select("max_bookings_per_slot, name") 
    .eq("id", serviceId)
    .limit(1)

  console.log("📌 Step 1: Fetching max_bookings_per_slot and name for service...")

  if (serviceInfoError || !serviceInfo || serviceInfo.length === 0) {
    console.error(`❌ Error fetching max bookings for service ${serviceId}:`, serviceInfoError)
    return { success: false, message: "Could not validate booking availability." }
  }

  const maxAllowed = serviceInfo[0].max_bookings_per_slot ?? 1
  const serviceName = serviceInfo[0].name ?? "Unknown Service"

  console.log(`✅ Service '${serviceName}' (ID: ${serviceId}) allows max ${maxAllowed} bookings.`)

  // 2. Get all appointment_ids linked to this service
  const { data: relatedAppointments, error: appointmentLinkError } = await supabaseAdmin
    .from("appointment_services")
    .select("appointment_id")
    .eq("service_id", serviceId)

  console.log("📌 Step 2: Fetching appointment IDs linked to service...")

  if (appointmentLinkError) {
    console.error("❌ Error fetching appointment links:", appointmentLinkError)
    return { success: false, message: "Could not validate appointment availability." }
  }

  const appointmentIds = relatedAppointments.map(a => a.appointment_id)
  console.log(`🧾 Found ${appointmentIds.length} appointment(s) linked to service ${serviceId}`)
  console.log(`🆔 Appointment IDs:`, appointmentIds)

  if (appointmentIds.length === 0) {
    console.log("📭 No bookings yet for this service. Skipping availability check.")
    continue
  }

  // 3. Count matching appointments at this date & time for those IDs
  console.log(`📌 Step 3: Counting appointments on ${appointmentDate} at ${appointmentTime}...`)

  const { count: currentCount, error: countError } = await supabaseAdmin
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("appointment_date", appointmentDate)
    .eq("appointment_time", appointmentTime)
    .in("id", appointmentIds)

  if (countError) {
    console.error("❌ Error counting existing bookings:", countError)
    return { success: false, message: "Failed to check existing bookings." }
  }

  console.log(`📊 Current bookings for service '${serviceName}' on ${appointmentDate} at ${appointmentTime}: ${currentCount} (Max allowed: ${maxAllowed})`)

  if ((currentCount ?? 0) >= maxAllowed) {
    console.warn(`⚠️ Time slot FULL for '${serviceName}' at ${appointmentTime} on ${appointmentDate}.`)

  
    return {
      success: false,
      message: `Sorry, the service '${serviceName}' is already fully booked at ${appointmentTime} on ${appointmentDate}. Please choose another time or service.`,
    }
  }
}


//END THE CONCURENT APPOINTMENT PREVENTION

    // Create appointment using admin client
    const { data: appointmentData, error: appointmentError } = await supabaseAdmin
      .from("appointments")
      .insert({
        customer_id: customer.id,
      //  service_id: serviceId,
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

for (const serviceId of serviceIds) {
  const { data, error } = await supabaseAdmin
    .from("appointment_services")
    .insert({
      appointment_id: appointmentId,
      service_id: serviceId,
      // You can optionally include quantity or price_at_booking if needed
    })

  if (error) {
    console.error(`Failed to link service ${serviceId}:`, error)
    return { success: false, message: "Failed to link services to appointment." }
  }
}
console.log("Appointment object:", appointmentData[0]);

try {
  
  const calcomBooking = await createCalcomBooking(
    appointmentData[0] as Appointment,
    customer as Customer,
    services as Service[]
  );

  // Save the Cal.com booking ID in your appointments table
  await supabaseAdmin
    .from("appointments")
    .update({ calcom_booking_id: calcomBooking.booking.id })
    .eq("id", appointmentData[0].id);

  console.log("✅ Cal.com booking created:", calcomBooking);
} catch (error) {
  console.error("❌ Failed to create Cal.com booking:", error);
  // Optionally rollback or alert
}
    // Send confirmation emails

    //IF THE MULTIPLE SEVICES ARE SELECTD YOU NEED TO UNCOMMENT THIS

//     const { data: serviceDetails, error: serviceDetailsError } = await supabaseAdmin
//   .from("services")
//   .select("name")
//   .in("id", serviceIds)

// const serviceNames = serviceDetails?.map(s => s.name).join(", ") || "Multiple Services"

    // if (service) {
    //   console.log("Sending confirmation emails...")
    //   try {
    //     await sendBookingConfirmation(email, `${firstName} ${lastName}`, service.name, appointmentDate, appointmentTime)
    //     await sendAdminNotification(
    //       `${firstName} ${lastName}`,
    //       service.name,
    //       appointmentDate,
    //       appointmentTime,
    //       email,
    //       phone,
    //     )
    //     console.log("Emails sent successfully")
    //   } catch (emailError) {
    //     console.error("Email sending error:", emailError)
    //     // Don't fail the booking if email fails
    //   }
    // }

    revalidatePath("/admin") // Revalidate admin page to show new appointment
    console.log("=== BOOKING APPOINTMENT SUCCESS ===")

    return {
      success: true,
      message: "Appointment booked successfully! We'll confirm your booking soon.",
    }
  } catch (error) {
  console.error("Exception in bookAppointment:", error instanceof Error ? error.stack : error)
  return { success: false, message: "An unexpected error occurred." }
}
}

export async function getServices() {
  console.log("=== GETTING SERVICES ===")

  try {
    // Use admin client for consistent access
    const { data: services, error } = await supabaseAdmin
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("name")

    if (error) {
      console.error("Error fetching services:", error)
      return []
    }

    console.log(`Found ${services?.length || 0} services`)
    return services || []
  } catch (error) {
    console.error("Exception in getServices:", error)
    return []
  }
}
//CALCOM API integration


//END CALCOM API integration
export async function getAppointments() {
  console.log("=== GETTING APPOINTMENTS ===")

  try {
    const { data, error } = await supabaseAdmin
      .from("appointments")
      .select(`
        *,
        customer:customers(*),
        appointment_services(
          service:services(*)
        )
      `)
      .order("appointment_date", { ascending: false })
      .order("appointment_time", { ascending: false })

    if (error) {
      console.error("Error fetching appointments:", error)
      return []
    }

    console.log(`Found ${data?.length || 0} appointments`)
    return data || []
  } catch (error) {
    console.error("Exception in getAppointments:", error)
    return []
  }
}


export async function getContactMessages() {
  console.log("=== GETTING CONTACT MESSAGES ===")

  try {
    const { data: messages, error } = await supabaseAdmin
      .from("contact_messages")
      .select(`
        *,
        service:services(*)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching contact messages:", error)
      return []
    }

    console.log(`Found ${messages?.length || 0} messages`)
    return messages || []
  } catch (error) {
    console.error("Exception in getContactMessages:", error)
    return []
  }
}

// --- NEW CRUD OPERATIONS ---

export async function updateAppointmentStatus(id: string, status: Appointment["status"]) {
  console.log(`Updating appointment ${id} status to ${status}`)
  try {
    const { error } = await supabaseAdmin.from("appointments").update({ status: status }).eq("id", id)

    if (error) {
      console.error("Error updating appointment status:", error)
      return { success: false, message: "Failed to update appointment status." }
    }

    revalidatePath("/admin")
    return { success: true, message: "Appointment status updated." }
  } catch (error) {
    console.error("Exception in updateAppointmentStatus:", error)
    return { success: false, message: "An unexpected error occurred." }
  }
}

export async function deleteAppointment(id: string) {
  console.log(`Deleting appointment ${id}`)
  try {
    const { error } = await supabaseAdmin.from("appointments").delete().eq("id", id)

    if (error) {
      console.error("Error deleting appointment:", error)
      return { success: false, message: "Failed to delete appointment." }
    }

    revalidatePath("/admin")
    return { success: true, message: "Appointment deleted." }
  } catch (error) {
    console.error("Exception in deleteAppointment:", error)
    return { success: false, message: "An unexpected error occurred." }
  }
}

export async function updateContactMessageStatus(id: string, status: ContactMessage["status"]) {
  console.log(`Updating message ${id} status to ${status}`)
  try {
    const { error } = await supabaseAdmin.from("contact_messages").update({ status: status }).eq("id", id)

    if (error) {
      console.error("Error updating contact message status:", error)
      return { success: false, message: "Failed to update message status." }
    }

    revalidatePath("/admin")
    return { success: true, message: "Message status updated." }
  } catch (error) {
    console.error("Exception in updateContactMessageStatus:", error)
    return { success: false, message: "An unexpected error occurred." }
  }
}

export async function deleteContactMessage(id: string) {
  console.log(`Deleting contact message ${id}`)
  try {
    const { error } = await supabaseAdmin.from("contact_messages").delete().eq("id", id)

    if (error) {
      console.error("Error deleting contact message:", error)
      return { success: false, message: "Failed to delete message." }
    }

    revalidatePath("/admin")
    return { success: true, message: "Message deleted." }
  } catch (error) {
    console.error("Exception in deleteContactMessage:", error)
    return { success: false, message: "An unexpected error occurred." }
  }
}
