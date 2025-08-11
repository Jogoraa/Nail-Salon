"use client"

import type React from "react"

import { useState, useEffect ,useRef} from "react" // Import useEffect
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import ServiceDropdown from "./service-dropdown"
import type { Service } from "@/lib/supabase"
import { bookAppointment } from "@/lib/actions"
import ServiceMultiSelect from "./ServiceMultiSelect"
import MultiSelectDropdown from "./MultiSelectDropdown"

interface BookingFormProps {
  services: Service[]
  preSelectedServiceId?: string // New prop
}

export default function BookingForm({ services, preSelectedServiceId }: BookingFormProps) {
  const [selectedService, setSelectedService] = useState(preSelectedServiceId || "")
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(preSelectedServiceId ? [preSelectedServiceId] : [])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
   const formRef = useRef<HTMLFormElement | null>(null)

  // Update selectedService when preSelectedServiceId changes
  useEffect(() => {
    if (preSelectedServiceId) {
      setSelectedService(preSelectedServiceId)
    }
  }, [preSelectedServiceId])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    const formData = new FormData(event.currentTarget)

    // Add the selected service to form data
    // if (selectedService) {
    //   formData.set("serviceId", selectedService)
    // }
if (selectedServiceIds.length > 0) {
  selectedServiceIds.forEach((id) => {
    formData.append("serviceIds[]", id)
  })
}
    try {
      const result = await bookAppointment(formData)
       console.log("Booking result:", result);
      if (result?.success) {
        setMessage({ type: "success", text: result.message })
        // Reset form 
        formRef.current?.reset()
        setSelectedServiceIds([]) 
      } else {
        setMessage({ type: "error", text: result?.message })
      }
    } catch (error) {
      console.error("Booking threw an unexpected error:", error)
  setMessage({ type: "error", text: "An unexpected error occurred. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split("T")[0]

  return (
    <Card className="p-8 shadow-xl border-0">
      <h3 className="text-2xl font-bold mb-6">Book an Appointment</h3>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
            <input
              type="text"
              name="firstName"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              placeholder="Your first name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
            <input
              type="text"
              name="lastName"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              placeholder="Your last name"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
          <input
            type="email"
            name="email"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            name="phone"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="(555) 123-4567"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Service *</label>
                <MultiSelectDropdown value={selectedServiceIds} onChange={setSelectedServiceIds} services={services} />
         

        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date *</label>
            <input
              type="date"
              name="appointmentDate"
              required
              min={today}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time *</label>
            <select
              name="appointmentTime"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              <option value="">Select time</option>
              <option value="09:00">9:00 AM</option>
              <option value="09:30">9:30 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="10:30">10:30 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="11:30">11:30 AM</option>
              <option value="12:00">12:00 PM</option>
              <option value="12:30">12:30 PM</option>
              <option value="13:00">1:00 PM</option>
              <option value="13:30">1:30 PM</option>
              <option value="14:00">2:00 PM</option>
              <option value="14:30">2:30 PM</option>
              <option value="15:00">3:00 PM</option>
              <option value="15:30">3:30 PM</option>
              <option value="16:00">4:00 PM</option>
              <option value="16:30">4:30 PM</option>
              <option value="17:00">5:00 PM</option>
              <option value="17:30">5:30 PM</option>
              <option value="18:00">6:00 PM</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
          <textarea
            rows={4}
            name="notes"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="Any special requests or questions?"
          ></textarea>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
          >
            {message.text}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting || selectedServiceIds.length === 0}
          className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white py-3 disabled:opacity-50"
        >
          {isSubmitting ? "Booking..." : "Book Appointment"}
        </Button>
      </form>
    </Card>
  )
}
