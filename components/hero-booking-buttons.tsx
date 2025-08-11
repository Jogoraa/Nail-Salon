"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Service } from "@/lib/supabase"

interface HeroBookingButtonsProps {
  services: Service[]
  preSelectedServiceId?: string
}

export default function HeroBookingButtons({
  services,
  preSelectedServiceId
}: HeroBookingButtonsProps) {
  // Build the URL for the improved booking system
  const getBookingUrl = () => {
    if (preSelectedServiceId) {
      return `/improved-booking?service=${preSelectedServiceId}`
    }
    return "/improved-booking"
  }

  return (
    <>
      <Link href={getBookingUrl()}>
        <Button
          size="lg"
          className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-3"
        >
          ✨ Book with New System
        </Button>
      </Link>
      <Link href="#services">
        <Button
          size="lg"
          variant="outline"
          className="border-rose-300 text-rose-600 hover:bg-rose-50 px-8 py-3 bg-transparent"
        >
          View Services
        </Button>
      </Link>
      
      <div className="text-sm text-gray-500 mt-2">
        <span className="inline-flex items-center">
          <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
          New: Service-first booking with real-time availability
        </span>
      </div>
    </>
  )
}
