"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import ContactBookingModal from "@/components/contact-booking-modal"
import type { Service } from "@/lib/supabase"

interface MobileMenuOverlayProps {
  isOpen: boolean
  onClose: () => void
  services: Service[]
}

export default function MobileMenuOverlay({ isOpen, onClose, services }: MobileMenuOverlayProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  // ✅ Add this state to hold selected services
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const handleLinkClick = () => {
    onClose()
  }

  const openBookingModal = () => {
    onClose()
    setIsBookingModalOpen(true)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-[55]" onClick={onClose} aria-hidden="true" />

      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-[60] transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
      >
        <div className="flex justify-end p-4 border-b border-gray-200">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-700" />
            <span className="sr-only">Close menu</span>
          </button>
        </div>
        <nav className="flex flex-col p-4 space-y-4">
          <Link href="#home" className="text-gray-700 hover:text-rose-600 text-lg py-2" onClick={handleLinkClick}>
            Home
          </Link>
          <Link href="#services" className="text-gray-700 hover:text-rose-600 text-lg py-2" onClick={handleLinkClick}>
            Services
          </Link>
          <Link href="#gallery" className="text-gray-700 hover:text-rose-600 text-lg py-2" onClick={handleLinkClick}>
            Gallery
          </Link>
          <Link href="#about" className="text-gray-700 hover:text-rose-600 text-lg py-2" onClick={handleLinkClick}>
            About
          </Link>
          <Link href="#contact" className="text-gray-700 hover:text-rose-600 text-lg py-2" onClick={handleLinkClick}>
            Contact
          </Link>
          <Link href="/admin" className="text-gray-700 hover:text-rose-600 text-lg py-2" onClick={handleLinkClick}>
            Dashboard
          </Link>

          <Button
            className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
            onClick={openBookingModal}
          >
            Book Appointment
          </Button>
        </nav>
      </div>

      {/* Booking Modal */}
      <ContactBookingModal
        services={services}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        defaultTab="booking"
        selectedServiceIds={selectedServiceIds}
        setSelectedServiceIds={setSelectedServiceIds}
      />
    </>
  )
}
