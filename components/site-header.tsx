"use client"

import { useState } from "react"
import Link from "next/link"
import BookingButtonsAndModal from "@/components/booking-buttons-and-modal"
import MobileMenuOverlay from "@/components/mobile-menu-overlay"
import type { Service } from "@/lib/supabase"
import { X,Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
interface SiteHeaderProps {
  services: Service[]
}

export default function SiteHeader({ services }: SiteHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

return (
    <header className="bg-white/80 backdrop-blur-md border-b border-rose-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                Haymi Nail Care
              </h1>
              <p className="text-sm text-gray-600">Haymi Nail Care</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link href="#home" className="text-gray-700 hover:text-rose-600 transition-colors text-sm lg:text-base">
              Home
            </Link>
            <Link href="#services" className="text-gray-700 hover:text-rose-600 transition-colors text-sm lg:text-base">
              Services
            </Link>
            <Link href="#gallery" className="text-gray-700 hover:text-rose-600 transition-colors text-sm lg:text-base">
              Gallery
            </Link>
            <Link href="#about" className="text-gray-700 hover:text-rose-600 transition-colors text-sm lg:text-base">
              About
            </Link>
            <Link href="#contact" className="text-gray-700 hover:text-rose-600 transition-colors text-sm lg:text-base">
              Contact
            </Link>
          </nav>

          {/* New Booking Button - More Prominent */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/improved-booking">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-2 shadow-lg">
                <span className="mr-2">✨</span>
                New Booking
              </Button>
            </Link>
            <div className="w-px h-8 bg-gray-300"></div>
            <BookingButtonsAndModal services={services} />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-rose-600 focus:outline-none">
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-2">
            <Link href="#home" className="block text-gray-700 hover:text-rose-600 text-base">
              Home
            </Link>
            <Link href="#services" className="block text-gray-700 hover:text-rose-600 text-base">
              Services
            </Link>
            <Link href="#gallery" className="block text-gray-700 hover:text-rose-600 text-base">
              Gallery
            </Link>
            <Link href="#about" className="block text-gray-700 hover:text-rose-600 text-base">
              About
            </Link>
            <Link href="#contact" className="block text-gray-700 hover:text-rose-600 text-base">
              Contact
            </Link>
            <div className="pt-2 border-t border-gray-200">
              <Link href="/improved-booking" className="block text-blue-600 hover:text-blue-700 text-base font-medium">
                ✨ New Booking System
              </Link>
            </div>
            <div className="pt-2">
              <BookingButtonsAndModal services={services} />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
