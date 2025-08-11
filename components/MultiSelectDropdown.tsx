"use client"

import { useEffect, useState } from "react"
import { ChevronDown, Check } from "lucide-react"
import type { Service } from "@/lib/supabase"

interface MultiSelectDropdownProps {
  value: string[] // selected service IDs
  onChange: (value: string[]) => void
  services: Service[]
}

export default function MultiSelectDropdown({ value, onChange, services }: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const allServices = services.map((service) => ({
    id: service.id,
    name: service.name,
    price: service.price,
    duration: service.duration,
  }))

  const formatPrice = (price: number) => {
    return price > 0 ? `${price.toFixed(0)} Birr` : ""
  }

  const formatDuration = (duration: number) => {
    return duration > 0 ? `${duration} min` : ""
  }

  const toggleService = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id)) // remove
    } else {
      onChange([...value, id]) // add
    }
  }

  useEffect(() => {
    console.log("Selected Services:", value)
  }, [value])

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white text-left flex items-center justify-between hover:border-rose-300 transition-colors duration-200"
      >
        <div className="flex-1">
          <span className={value.length > 0 ? "text-gray-900" : "text-gray-500"}>
            {value.length > 0 ? `${value.length} selected` : "Select services"}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-20 overflow-hidden animate-in slide-in-from-top-2 duration-200">
            <div className="max-h-80 overflow-y-auto">
              {allServices.map((service) => (
                <label
                  key={service.id}
                  className="flex items-start space-x-3 px-4 py-3 hover:bg-rose-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={value.includes(service.id)}
                    onChange={() => toggleService(service.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{service.name}</div>
                    <div className="text-sm text-gray-500">
                      {service.duration > 0 && `Duration: ${formatDuration(service.duration)} `}
                      {service.price > 0 && `• Price: ${formatPrice(service.price)}`}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 px-4 py-3 border-t border-rose-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Need help choosing?</span>
                <button
                  type="button"
                  className="text-rose-600 hover:text-rose-700 font-medium transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Call us: (555) 123-4567
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
