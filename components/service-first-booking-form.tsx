"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Clock, Users, AlertTriangle, CheckCircle, Calendar, X } from "lucide-react"
import type { Service } from "@/lib/supabase"
import { bookAppointmentWithCapacityCheck, getBookingAvailability, getSuggestedTimeSlots } from "@/lib/enhanced-actions"
import MultiSelectDropdown from "./MultiSelectDropdown"

interface ServiceFirstBookingFormProps {
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

export default function ServiceFirstBookingForm({ services, preSelectedServiceId }: ServiceFirstBookingFormProps) {
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
  const [step, setStep] = useState<"services" | "date" | "time" | "details">("services")
  const formRef = useRef<HTMLFormElement | null>(null)

  // Update selected services when preSelectedServiceId changes
  useEffect(() => {
    if (preSelectedServiceId) {
      setSelectedServiceIds([preSelectedServiceId])
      setStep("date")
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
        if (selectedTime && !result.timeSlots.find(slot => slot.time === selectedTime && slot.isAvailable)) {
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
        // Reset form and go back to first step
        formRef.current?.reset()
        setSelectedServiceIds([])
        setSelectedDate("")
        setSelectedTime("")
        setTimeSlots([])
        setStep("services")
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
    if (!slot.isAvailable) return <AlertTriangle className="w-4 h-4" />
    
    const totalRemaining = slot.availabilityDetails.reduce((sum, detail) => sum + detail.remainingSlots, 0)
    const avgRemaining = totalRemaining / slot.availabilityDetails.length
    
    if (avgRemaining <= 1) return <Clock className="w-4 h-4" />
    return <CheckCircle className="w-4 h-4" />
  }

  const canProceedToDate = selectedServiceIds.length > 0
  const canProceedToTime = selectedDate && selectedServiceIds.length > 0
  const canProceedToDetails = selectedTime && selectedDate && selectedServiceIds.length > 0

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split("T")[0]

  const renderServicesStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Select Your Services</h3>
        <p className="text-gray-600">Choose the services you'd like to book</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Services *</label>
        <MultiSelectDropdown 
          value={selectedServiceIds} 
          onChange={setSelectedServiceIds} 
          services={services} 
        />
        {selectedServiceIds.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedServiceIds.map(serviceId => {
              const service = services.find(s => s.id === serviceId)
              return service ? (
                <Badge key={serviceId} variant="secondary" className="bg-rose-100 text-rose-700">
                  {service.name}
                  <button
                    type="button"
                    onClick={() => setSelectedServiceIds(prev => prev.filter(id => id !== serviceId))}
                    className="ml-2 hover:bg-rose-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ) : null
            })}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={() => setStep("date")}
          disabled={!canProceedToDate}
          className="bg-rose-600 hover:bg-rose-700"
        >
          Continue to Date Selection
        </Button>
      </div>
    </div>
  )

  const renderDateStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Your Date</h3>
        <p className="text-gray-600">Select when you'd like your appointment</p>
      </div>

      <div className="flex items-center justify-center space-x-4 mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Selected Services</span>
        </div>
        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        <span className="text-sm text-gray-600">Date Selection</span>
        <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
        <span className="text-sm text-gray-600">Time Selection</span>
        <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
        <span className="text-sm text-gray-600">Details</span>
      </div>

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

      <div className="flex justify-between">
        <Button 
          variant="outline"
          onClick={() => setStep("services")}
        >
          Back to Services
        </Button>
        <Button 
          onClick={() => setStep("time")}
          disabled={!canProceedToTime}
          className="bg-rose-600 hover:bg-rose-700"
        >
          Continue to Time Selection
        </Button>
      </div>
    </div>
  )

  const renderTimeStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Select Available Time</h3>
        <p className="text-gray-600">Choose from available time slots for your selected services</p>
      </div>

      <div className="flex items-center justify-center space-x-4 mb-6">
        <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
        <span className="text-sm text-gray-600">Selected Services</span>
        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        <span className="text-sm text-gray-600">Date Selection</span>
        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        <span className="text-sm text-gray-600">Time Selection</span>
        <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
        <span className="text-sm text-gray-600">Details</span>
      </div>

      {isLoadingAvailability && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
          <span className="ml-2 text-gray-600">Loading availability...</span>
        </div>
      )}

      {availabilityError && (
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
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
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No available time slots found for the selected date and services. Please try a different date.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between">
        <Button 
          variant="outline"
          onClick={() => setStep("date")}
        >
          Back to Date Selection
        </Button>
        <Button 
          onClick={() => setStep("details")}
          disabled={!canProceedToDetails}
          className="bg-rose-600 hover:bg-rose-700"
        >
          Continue to Details
        </Button>
      </div>
    </div>
  )

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Complete Your Booking</h3>
        <p className="text-gray-600">Fill in your details to confirm your appointment</p>
      </div>

      <div className="flex items-center justify-center space-x-4 mb-6">
        <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
        <span className="text-sm text-gray-600">Selected Services</span>
        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        <span className="text-sm text-gray-600">Date Selection</span>
        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        <span className="text-sm text-gray-600">Time Selection</span>
        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        <span className="text-sm text-gray-600">Details</span>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {/* Hidden inputs for form submission */}
        <input type="hidden" name="appointmentDate" value={selectedDate} />
        <input type="hidden" name="appointmentTime" value={selectedTime} />
        
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

        {/* Booking Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Booking Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Services:</span>
              <span className="font-medium">
                {selectedServiceIds.map(id => services.find(s => s.id === id)?.name).join(", ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{selectedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">{selectedTime}</span>
            </div>
          </div>
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

        <div className="flex justify-between">
          <Button 
            type="button"
            variant="outline"
            onClick={() => setStep("time")}
          >
            Back to Time Selection
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
            className="bg-rose-600 hover:bg-rose-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Booking...
              </>
            ) : (
              "Confirm Booking"
            )}
          </Button>
        </div>
      </form>
    </div>
  )

  return (
    <Card className="p-8 shadow-xl border-0">
      <h3 className="text-2xl font-bold mb-6 text-center">Book Your Appointment</h3>
      
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center space-x-2 ${step === "services" ? "text-rose-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === "services" ? "bg-rose-600 text-white" : "bg-gray-200 text-gray-600"
            }`}>
              1
            </div>
            <span className="hidden sm:inline">Services</span>
          </div>
          <div className={`w-12 h-0.5 ${step === "date" || step === "time" || step === "details" ? "bg-rose-600" : "bg-gray-200"}`}></div>
          <div className={`flex items-center space-x-2 ${step === "date" ? "text-rose-600" : step === "time" || step === "details" ? "text-blue-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === "date" ? "bg-rose-600 text-white" : step === "time" || step === "details" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
            }`}>
              2
            </div>
            <span className="hidden sm:inline">Date</span>
          </div>
          <div className={`w-12 h-0.5 ${step === "time" || step === "details" ? "bg-blue-600" : "bg-gray-200"}`}></div>
          <div className={`flex items-center space-x-2 ${step === "time" ? "text-rose-600" : step === "details" ? "text-blue-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === "time" ? "bg-rose-600 text-white" : step === "details" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
            }`}>
              3
            </div>
            <span className="hidden sm:inline">Time</span>
          </div>
          <div className={`w-12 h-0.5 ${step === "details" ? "bg-blue-600" : "bg-gray-200"}`}></div>
          <div className={`flex items-center space-x-2 ${step === "details" ? "text-rose-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === "details" ? "bg-rose-600 text-white" : "bg-gray-200 text-gray-600"
            }`}>
              4
            </div>
            <span className="hidden sm:inline">Details</span>
          </div>
        </div>
      </div>

      {/* Step content */}
      {step === "services" && renderServicesStep()}
      {step === "date" && renderDateStep()}
      {step === "time" && renderTimeStep()}
      {step === "details" && renderDetailsStep()}

      {/* Status Messages */}
      {message && (
        <Alert className={`mt-6 ${
          message.type === "success" 
            ? "border-green-200 bg-green-50 text-green-700" 
            : message.type === "warning"
            ? "border-yellow-200 bg-yellow-50 text-yellow-700"
            : "border-red-200 bg-red-50 text-red-700"
        }`}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {suggestedTimes.length > 0 && (
        <div className="mt-4">
          <div className="text-sm text-gray-700 mb-2">Suggested alternative times:</div>
          <div className="flex flex-wrap gap-2">
            {suggestedTimes.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => {
                  setSelectedTime(time)
                  setStep("time")
                }}
                className="px-3 py-1 rounded-full border text-sm hover:bg-gray-50"
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
} 