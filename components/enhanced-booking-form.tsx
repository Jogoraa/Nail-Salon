"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Clock, Users, TriangleAlert, CheckCircle } from "lucide-react"
import type { Service } from "@/lib/supabase"
import { bookAppointmentWithCapacityCheck, getBookingAvailability, getSuggestedTimeSlots } from "@/lib/enhanced-actions"
import MultiSelectDropdown from "./MultiSelectDropdown"

interface EnhancedBookingFormProps {
  services: Service[]
  preSelectedServiceId?: string
}

interface TimeSlotOption {
  time: string
  label: string
  isAvailable: boolean
  availabilityDetails: {
    serviceId: string
    serviceName: string
    remainingSlots: number
    isAvailable: boolean
  }[]
}

export default function EnhancedBookingForm({ services, preSelectedServiceId }: EnhancedBookingFormProps) {
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(
    preSelectedServiceId ? [preSelectedServiceId] : []
  )
  const [selectedDate, setSelectedDate] = useState("")
  const [timeSlots, setTimeSlots] = useState<TimeSlotOption[]>([])
  const [selectedTime, setSelectedTime] = useState("")
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)
  const [suggestedTimes, setSuggestedTimes] = useState<string[]>([])
  const formRef = useRef<HTMLFormElement | null>(null)

  // Update selected services when preSelectedServiceId changes
  useEffect(() => {
    if (preSelectedServiceId) {
      setSelectedServiceIds([preSelectedServiceId])
    }
  }, [preSelectedServiceId])

  // Fetch availability when date or services change
  useEffect(() => {
    if (selectedDate && selectedServiceIds.length > 0) {
      fetchAvailability()
    } else {
      setTimeSlots([])
      setSelectedTime("")
    }
  }, [selectedDate, selectedServiceIds])

  const fetchAvailability = async () => {
    if (!selectedDate || selectedServiceIds.length === 0) return

    setIsLoadingAvailability(true)
    setAvailabilityError(null)

    try {
      const result = await getBookingAvailability(selectedDate, selectedServiceIds)
      
      if (result.error) {
        setAvailabilityError(result.error)
        setTimeSlots([])
      } else {
        setTimeSlots(result.timeSlots)
        // Clear selected time if it's no longer available
        if (selectedTime && !result.timeSlots.find((slot: TimeSlotOption) => slot.time === selectedTime && slot.isAvailable)) {
          setSelectedTime("")
        }
      }
    } catch (error) {
      console.error("Error fetching availability:", error)
      setAvailabilityError("Failed to load availability. Please try again.")
      setTimeSlots([])
    } finally {
      setIsLoadingAvailability(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    const formData = new FormData(event.currentTarget)

    // Add selected services to form data
    if (selectedServiceIds.length > 0) {
      selectedServiceIds.forEach((id) => {
        formData.append("serviceIds[]", id)
      })
    }

    try {
      const result = await bookAppointmentWithCapacityCheck(formData)
      
      if (result?.success) {
        setMessage({ type: "success", text: result.message })
        // Reset form
        formRef.current?.reset()
        setSelectedServiceIds([])
        setSelectedDate("")
        setSelectedTime("")
        setTimeSlots([])
        setSuggestedTimes([])
      } else {
        setMessage({ 
          type: "error", 
          text: result?.message || "Booking failed. Please try again." 
        })
        setSuggestedTimes([])
        
        // If there were conflicts, refresh availability
        if (result?.conflicts) {
          fetchAvailability()
          // Also fetch suggested alternative time slots to assist the user
          try {
            const alternatives = await getSuggestedTimeSlots(selectedServiceIds, selectedDate, selectedTime)
            setSuggestedTimes(alternatives)
          } catch {
            // ignore suggestions failure
          }
        }
      }
    } catch (error) {
      console.error("Booking threw an unexpected error:", error)
      setMessage({ type: "error", text: "An unexpected error occurred. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value
    setSelectedDate(newDate)
    setSelectedTime("") // Clear selected time when date changes
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const getTimeSlotVariant = (slot: TimeSlotOption) => {
    if (!slot.isAvailable) return "unavailable"
    
    const totalRemaining = slot.availabilityDetails.reduce((sum, detail) => sum + detail.remainingSlots, 0)
    const avgRemaining = totalRemaining / slot.availabilityDetails.length
    
    if (avgRemaining <= 1) return "limited"
    return "available"
  }

  const getTimeSlotIcon = (slot: TimeSlotOption) => {
    if (!slot.isAvailable) return <TriangleAlert className="w-4 h-4" />
    
    const totalRemaining = slot.availabilityDetails.reduce((sum, detail) => sum + detail.remainingSlots, 0)
    const avgRemaining = totalRemaining / slot.availabilityDetails.length
    
    if (avgRemaining <= 1) return <Clock className="w-4 h-4" />
    return <CheckCircle className="w-4 h-4" />
  }

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split("T")[0]

  return (
    <Card className="p-8 shadow-xl border-0">
      <h3 className="text-2xl font-bold mb-6">Book an Appointment</h3>
      
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
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

        {/* Service Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Services *</label>
          <MultiSelectDropdown 
            value={selectedServiceIds} 
            onChange={setSelectedServiceIds} 
            services={services} 
          />
          {selectedServiceIds.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedServiceIds.map(serviceId => {
                const service = services.find(s => s.id === serviceId)
                return service ? (
                  <Badge key={serviceId} variant="secondary" className="bg-rose-100 text-rose-700">
                    {service.name}
                  </Badge>
                ) : null
              })}
            </div>
          )}
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date *</label>
          <input
            type="date"
            name="appointmentDate"
            value={selectedDate}
            onChange={handleDateChange}
            required
            min={today}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>

        {/* Time Selection with Availability */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Time *
            {selectedServiceIds.length > 0 && selectedDate && (
              <span className="text-sm text-gray-500 ml-2">
                (Showing availability for selected services)
              </span>
            )}
          </label>
          
          {isLoadingAvailability && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
              <span className="ml-2 text-gray-600">Loading availability...</span>
            </div>
          )}

          {availabilityError && (
            <Alert className="mb-4">
              <TriangleAlert className="h-4 w-4" />
              <AlertDescription>{availabilityError}</AlertDescription>
            </Alert>
          )}

          {!isLoadingAvailability && !availabilityError && timeSlots.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {timeSlots.map((slot) => {
                const variant = getTimeSlotVariant(slot)
                const isSelected = selectedTime === slot.time
                
                return (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => slot.isAvailable && handleTimeSelect(slot.time)}
                    disabled={!slot.isAvailable}
                    className={`
                      relative p-3 rounded-lg border-2 transition-all duration-200 text-left
                      ${isSelected 
                        ? 'border-rose-500 bg-rose-50 text-rose-700' 
                        : variant === 'available'
                        ? 'border-green-200 bg-green-50 text-green-700 hover:border-green-300'
                        : variant === 'limited'
                        ? 'border-yellow-200 bg-yellow-50 text-yellow-700 hover:border-yellow-300'
                        : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{slot.label}</span>
                      {getTimeSlotIcon(slot)}
                    </div>
                    
                    {slot.isAvailable ? (
                      <div className="text-xs">
                        {slot.availabilityDetails.map((detail, index) => (
                          <div key={detail.serviceId} className="flex justify-between">
                            <span className="truncate mr-1">{detail.serviceName}</span>
                            <span>{detail.remainingSlots} left</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs">Fully booked</div>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {!isLoadingAvailability && !availabilityError && timeSlots.length === 0 && selectedDate && selectedServiceIds.length > 0 && (
            <Alert>
              <TriangleAlert className="h-4 w-4" />
              <AlertDescription>
                No available time slots found for the selected date and services. Please try a different date.
              </AlertDescription>
            </Alert>
          )}

          {/* Hidden input for form submission */}
          <input type="hidden" name="appointmentTime" value={selectedTime} />
        </div>

        {/* Special Requests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
          <textarea
            rows={4}
            name="notes"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="Any special requests or questions?"
          />
        </div>

        {/* Status Messages */}
        {message && (
          <Alert className={
            message.type === "success" 
              ? "border-green-200 bg-green-50" 
              : message.type === "warning"
              ? "border-yellow-200 bg-yellow-50"
              : "border-red-200 bg-red-50"
          }>
            <AlertDescription className={
              message.type === "success" 
                ? "text-green-700" 
                : message.type === "warning"
                ? "text-yellow-700"
                : "text-red-700"
            }>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || selectedServiceIds.length === 0 || !selectedDate || !selectedTime}
          className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white py-3 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Booking...
            </>
          ) : (
            "Book Appointment"
          )}
        </Button>

        {suggestedTimes.length > 0 && (
          <div className="mt-4">
            <div className="text-sm text-gray-700 mb-2">Suggested alternative times:</div>
            <div className="flex flex-wrap gap-2">
              {suggestedTimes.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className="px-3 py-1 rounded-full border text-sm hover:bg-gray-50"
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Booking Requirements */}
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Please select at least one service and an available time slot</p>
          <p>• Availability is updated in real-time</p>
          <p>• You'll receive a confirmation email once your booking is processed</p>
        </div>
      </form>
    </Card>
  )
}

