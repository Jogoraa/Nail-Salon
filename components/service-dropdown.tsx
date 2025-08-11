"use client"

import { useState } from "react"
import { ChevronDown, Check } from "lucide-react"
import type { Service } from "@/lib/supabase"

interface ServiceDropdownProps {
  value: string
  onChange: (value: string) => void
  services: Service[]
}
// interface ServiceMultiSelectProps {
//   value: string[] // selected service IDs
//   onChange: (value: string[]) => void
//   services: Service[]
// }

export default function ServiceDropdown({ value, onChange, services }: ServiceDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const allServices = [
    { id: "", name: "Select a service", price: 0, duration: 0 },
    ...services.map((service) => ({
      id: service.id,
      name: service.name,
      price: service.price,
      duration: service.duration,
    })),
  ]

  const selectedService = allServices.find((service) => service.id === value) || allServices[0]

  const handleSelect = (serviceId: string) => {
    onChange(serviceId)
    setIsOpen(false)
  }

  const formatPrice = (price: number) => {
    return price > 0 ? `${price.toFixed(0)} Birr` : ""
  }

  const formatDuration = (duration: number) => {
    return duration > 0 ? `${duration} min` : ""
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white text-left flex items-center justify-between hover:border-rose-300 transition-colors duration-200"
      >
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className={selectedService.id ? "text-gray-900" : "text-gray-500"}>{selectedService.name}</span>
            {selectedService.price > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="bg-rose-50 text-rose-600 px-2 py-1 rounded-full font-medium">
                  {formatPrice(selectedService.price)}
                </span>
                <span className="text-gray-400">•</span>
                <span>{formatDuration(selectedService.duration)}</span>
              </div>
            )}
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-20 overflow-hidden animate-in slide-in-from-top-2 duration-200">
            <div className="max-h-80 overflow-y-auto">
              {allServices.map((service, index) => (
                <button
                  key={service.id || "empty"}
                  type="button"
                  onClick={() => handleSelect(service.id)}
                  className={`w-full px-4 py-4 text-left hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 transition-all duration-200 border-b border-gray-100 last:border-b-0 ${
                    value === service.id ? "bg-gradient-to-r from-rose-50 to-pink-50" : ""
                  } ${index === 0 ? "text-gray-500" : "text-gray-900"}`}
                  disabled={index === 0}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {value === service.id && index !== 0 && <Check className="w-4 h-4 text-rose-500" />}
                      <div>
                        <div className="font-medium">{service.name}</div>
                        {service.duration > 0 && (
                          <div className="text-sm text-gray-500 mt-1">Duration: {formatDuration(service.duration)}</div>
                        )}
                      </div>
                    </div>
                    {service.price > 0 && (
                      <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {formatPrice(service.price)}
                      </div>
                    )}
                  </div>
                </button>
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
