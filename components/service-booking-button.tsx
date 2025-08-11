"use client"

import { Button } from "@/components/ui/button"
import ContactBookingModal from "@/components/contact-booking-modal"
import type { Service } from "@/lib/supabase" // Corrected import path
import { useState } from "react"

// New Client Component for Service Card Buttons
// This component will manage its own modal state for each service card.
export default function ServiceBookingButton({ services, serviceId }: { services: Service[]; serviceId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([serviceId])

  return (
    <>
      <Button
        className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
        onClick={() => setIsModalOpen(true)} // Open modal on click
      >
        Book This Service
      </Button>
      <ContactBookingModal
        services={services}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultTab="booking" // Default to booking tab
        preSelectedServiceId={serviceId} // Pass the service ID to pre-select
        selectedServiceIds={selectedServiceIds}        
        setSelectedServiceIds={setSelectedServiceIds} 
      />
    </>
  )
}
