"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import ContactBookingModal from "@/components/contact-booking-modal"
import type { Service } from "@/lib/supabase"

interface HeroBookingButtonsProps {
  services: Service[]
  preSelectedServiceId?: string
}

export default function HeroBookingButtons({
  services,
  preSelectedServiceId
}: HeroBookingButtonsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // If preSelectedServiceId exists, initialize with it
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(
    preSelectedServiceId ? [preSelectedServiceId] : []
  )

  return (
    <>
      <Button
        size="lg"
        onClick={() => setIsModalOpen(true)}
        className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-3"
      >
        Book Appointment
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="border-rose-300 text-rose-600 hover:bg-rose-50 px-8 py-3 bg-transparent"
      >
        View Services
      </Button>

      <ContactBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        services={services}
        selectedServiceIds={selectedServiceIds}
        setSelectedServiceIds={setSelectedServiceIds}
        defaultTab="booking"
      />
    </>
  )
}
