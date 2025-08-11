"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import type { Service } from "@/lib/supabase"

interface ServiceMultiSelectProps {
  value: string[]
  onChange: (value: string[]) => void
  services: Service[]
}

export default function ServiceMultiSelect({ value, onChange, services }: ServiceMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleService = (serviceId: string) => {
    if (value.includes(serviceId)) {
      onChange(value.filter((id) => id !== serviceId))
    } else {
      onChange([...value, serviceId])
    }
  }

  const formatPrice = (price: number) => price > 0 ? `${price.toFixed(0)} Birr` : ""
  const formatDuration = (duration: number) => duration > 0 ? `${duration} min` : ""

  const selectedServices = services.filter((s) => value.includes(s.id))

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white text-left flex items-center justify-between hover:border-rose-300 transition-colors duration-200"
      >
        <div className="flex-1">
          {selectedServices.length > 0 ? (
            <span className="text-gray-900">
              {selectedServices.map(s => s.name).join(", ")}
            </span>
          ) : (
            <span className="text-gray-500">Select one or more services</span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          <div className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
            <div className="max-h-80 overflow-y-auto">
              {services.map((service) => (
                <label
                  key={service.id}
                  className="flex items-start gap-4 p-4 cursor-pointer hover:bg-rose-50 border-b border-gray-100 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={value.includes(service.id)}
                    onChange={() => toggleService(service.id)}
                    className="mt-1 h-5 w-5 text-rose-600 border-gray-300 rounded"
                  />
                  <div className="flex flex-col flex-grow">
                    <span className="font-medium text-gray-900">{service.name}</span>
                    <span className="text-sm text-gray-500">
                      {formatPrice(service.price)} • {formatDuration(service.duration)}
                    </span>
                  </div>
                </label>
              ))}
            </div>

            <div className="bg-gradient-to-r from-rose-50 to-pink-50 px-4 py-3 border-t border-rose-100 text-sm text-gray-600 flex justify-between items-center">
              <span>{selectedServices.length} service(s) selected</span>
              <button
                type="button"
                className="text-rose-600 hover:text-rose-700 font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
