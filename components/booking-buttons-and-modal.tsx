"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import ContactBookingModal from "@/components/contact-booking-modal"
import type { Service } from "@/lib/supabase"
import Link from "next/link" // Keep Link for Dashboard

interface BookingButtonsAndModalProps {
  services: Service[]
}

export default function BookingButtonsAndModal({ services }: BookingButtonsAndModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [defaultModalTab, setDefaultModalTab] = useState<"contact" | "booking">("booking")
   const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])

  const openBookingModal = () => {
    setDefaultModalTab("booking")
    setIsModalOpen(true)
  }

  const openContactModal = () => {
    setDefaultModalTab("contact")
    setIsModalOpen(true)
  }

  return (
    <>
      {/* Header Buttons */}
      <div className="flex items-center space-x-2">
    <Link
  href="/admin"
  className="text-pink-500 font-bold hover:text-rose-600 transition-colors text-sm px-4 py-2 md:px-6 md:py-2"
>
  Admin Dashboard
</Link>
       
        {/* Mobile menu button - remains as is */}
        <button className="md:hidden p-2">
          <div className="w-6 h-6 flex flex-col justify-center space-y-1">
            <div className="w-full h-0.5 bg-gray-700"></div>
            <div className="w-full h-0.5 bg-gray-700"></div>
            <div className="w-full h-0.5 bg-gray-700"></div>
          </div>
        </button>
      </div>

      {/* Hero Section Buttons (these are outside the component, so we'll need to update app/page.tsx directly) */}
      {/* For now, this component only handles the header buttons and the modal. */}
      {/* The hero section buttons will be updated in app/page.tsx directly. */}

      <ContactBookingModal
       isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  services={services}
  defaultTab={defaultModalTab}
  selectedServiceIds={selectedServiceIds}
  setSelectedServiceIds={setSelectedServiceIds}
      />
    </>
  )
}
