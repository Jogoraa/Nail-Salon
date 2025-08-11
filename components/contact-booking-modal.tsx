"use client"

import { useState } from "react"
import { X } from "lucide-react"
import ContactForm from "./contact-form"
import BookingForm from "./booking-form"
import type { Service } from "@/lib/supabase"

interface ContactBookingModalProps {
    services: Service[]
  isOpen: boolean
  onClose: () => void
  defaultTab?: "contact" | "booking"
  preSelectedServiceId?: string
  selectedServiceIds: string[]
  setSelectedServiceIds: (ids: string[]) => void
}

export default function ContactBookingModal({
  services,
  isOpen,
  onClose,
  defaultTab = "contact",
  preSelectedServiceId,
}: ContactBookingModalProps) {
  const [activeTab, setActiveTab] = useState<"contact" | "booking">(defaultTab)
const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])

  // Set initial tab based on defaultTab prop
  useState(() => {
    setActiveTab(defaultTab)
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in-0 duration-200">
      <div className="bg-white rounded-2xl max-w-full sm:max-w-lg md:max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-top-2 duration-200">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex space-x-2 sm:space-x-4">
            <button
              onClick={() => setActiveTab("contact")}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                activeTab === "contact" ? "bg-rose-100 text-rose-700" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Contact Us
            </button>
            <button
              onClick={() => setActiveTab("booking")}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                activeTab === "booking" ? "bg-rose-100 text-rose-700" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Book Appointment
            </button>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6">
          {activeTab === "contact" ? (
            <ContactForm services={services} />
          ) : (
            <BookingForm services={services} preSelectedServiceId={preSelectedServiceId} />
          )}
        </div>
      </div>
    </div>
  )
}
