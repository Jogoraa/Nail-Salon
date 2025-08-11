"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Service } from "@/lib/supabase"

// Updated component to use the new improved booking system
export default function ServiceBookingButton({ services, serviceId }: { services: Service[]; serviceId: string }) {
  return (
    <Link href={`/improved-booking?service=${serviceId}`}>
      <Button className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white">
        ✨ Book with New System
      </Button>
    </Link>
  )
}
