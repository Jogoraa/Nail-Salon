import fetch from "node-fetch";
import type { Appointment, Customer, Service } from "./supabase"; // Your existing types

const CALCOM_API_URL = "https://api.cal.com/v1";
const CALCOM_API_KEY = "cal_live_385c7e606106c6d27db04b6f9aae2536";

// Type for Cal.com booking response
export interface CalcomBookingResponse {
  booking: {
    id: number;
    uid: string;
    eventTypeId: number;
    startTime: string;
    endTime: string;
    attendees: Array<{
      name: string;
      email: string;
    }>;
  };
  message: string;
}

/**
 * Creates a booking in Cal.com for the given appointment & customer.
 */
export async function createCalcomBooking(
  appointment: Appointment,
  customer: Customer,
  services: Service[]
): Promise<CalcomBookingResponse> {
  if (!CALCOM_API_KEY) {
    throw new Error("Cal.com API key is missing");
  }

  // Find the service linked to this appointment
  const service = services.find(s => s.id === appointment.service_id);
  if (!service) {
    throw new Error(`Service with ID ${appointment.service_id} not found`);
  }
  if (!service.calcom_event_type_id) {
    throw new Error(`Service ${service.name} does not have a linked Cal.com event type ID`);
  }

  const payload = {
    eventTypeId: Number(service.calcom_event_type_id),
    start: `${appointment.appointment_date}T${appointment.appointment_time}`,
    attendees: [
      {
        name: `${customer.first_name} ${customer.last_name}`,
        email: customer.email,
      },
    ],
    metadata: {
      appointmentId: appointment.id,
      notes: appointment.notes || "",
    },
  };

  // URL with apiKey as query param — **this is important**
  const url = `${CALCOM_API_URL}/bookings?apiKey=${CALCOM_API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Authorization header NOT needed when apiKey is query param
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cal.com API error: ${errorText}`);
  }

  return response.json() as Promise<CalcomBookingResponse>;
}
