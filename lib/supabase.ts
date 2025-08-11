// Types for our database
export interface Service {
  id: string
  name: string
  description: string | null
  price: number
  duration: number
  image_url: string | null
  is_active: boolean
  created_at: string
  calcom_event_type_id: string | null // New field for Cal.com integration
  // Capacity management fields
  max_bookings_per_slot?: number
  default_start_time?: string
  default_end_time?: string
  slot_duration?: number
  buffer_time?: number
}

export interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  created_at: string
}

export interface Appointment {
  id: string
  customer_id: string
  service_id: string
  appointment_date: string
  appointment_time: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  notes: string | null
  created_at: string
  customer?: Customer
  service?: Service
 appointment_services:AppointmentService[]

}
export interface AppointmentService {
  service_id: string
  appointment_id: string
  service: Service
}
export interface ContactMessage {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  service_id: string | null
  message: string | null
  status: "new" | "read" | "replied"
  created_at: string
  service?: Service
}
