"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Settings, 
  Users, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  CheckCircle,
  Edit,
  Save,
  X,
  Plus
} from "lucide-react"
import type { Service } from "@/lib/supabase"

interface AdminCapacityManagerProps {
  services: Service[]
}

interface ServiceCapacityConfig {
  id: string
  name: string
  maxBookingsPerSlot: number
  defaultStartTime: string
  defaultEndTime: string
  slotDuration: number
  bufferTime: number
}

interface CapacityOverride {
  id: string
  serviceId: string
  overrideDate: string
  overrideTime: string
  maxBookings: number
  reason: string
  isActive: boolean
}

export default function AdminCapacityManager({ services }: AdminCapacityManagerProps) {
  const [serviceConfigs, setServiceConfigs] = useState<ServiceCapacityConfig[]>([])
  const [overrides, setOverrides] = useState<CapacityOverride[]>([])
  const [editingService, setEditingService] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [showOverrideDialog, setShowOverrideDialog] = useState(false)
  const [selectedServiceForOverride, setSelectedServiceForOverride] = useState<string>("")

  useEffect(() => {
    loadServiceConfigs()
  }, [services])

  const loadServiceConfigs = async () => {
    setIsLoading(true)
    try {
      // Transform services data to match our config interface
      const configs: ServiceCapacityConfig[] = services.map(service => ({
        id: service.id,
        name: service.name,
        maxBookingsPerSlot: service.max_bookings_per_slot || 1,
        defaultStartTime: service.default_start_time || "09:00",
        defaultEndTime: service.default_end_time || "18:00",
        slotDuration: service.slot_duration || 30,
        bufferTime: service.buffer_time || 0
      }))
      
      setServiceConfigs(configs)
    } catch (error) {
      console.error("Error loading service configs:", error)
      setMessage({ type: "error", text: "Failed to load service configurations" })
    } finally {
      setIsLoading(false)
    }
  }

  const updateServiceCapacity = async (serviceId: string, updates: Partial<ServiceCapacityConfig>) => {
    try {
      const response = await fetch('/api/admin/capacity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_capacity',
          serviceId,
          ...updates
        })
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: "success", text: result.message })
        setServiceConfigs(prev => 
          prev.map(config => 
            config.id === serviceId ? { ...config, ...updates } : config
          )
        )
        setEditingService(null)
      } else {
        setMessage({ type: "error", text: result.message })
      }
    } catch (error) {
      console.error("Error updating service capacity:", error)
      setMessage({ type: "error", text: "Failed to update service capacity" })
    }
  }

  const createCapacityOverride = async (overrideData: {
    serviceId: string
    date: string
    time: string
    maxBookings: number
    reason: string
  }) => {
    try {
      const response = await fetch('/api/admin/capacity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_override',
          ...overrideData
        })
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: "success", text: result.message })
        setShowOverrideDialog(false)
        // Refresh overrides list
        loadOverrides()
      } else {
        setMessage({ type: "error", text: result.message })
      }
    } catch (error) {
      console.error("Error creating capacity override:", error)
      setMessage({ type: "error", text: "Failed to create capacity override" })
    }
  }

  const loadOverrides = async () => {
    // This would load existing overrides from the API
    // For now, we'll use empty array
    setOverrides([])
  }

  const ServiceConfigCard = ({ config }: { config: ServiceCapacityConfig }) => {
    const [localConfig, setLocalConfig] = useState(config)
    const isEditing = editingService === config.id

    const handleSave = () => {
      updateServiceCapacity(config.id, {
        maxBookingsPerSlot: localConfig.maxBookingsPerSlot,
        defaultStartTime: localConfig.defaultStartTime,
        defaultEndTime: localConfig.defaultEndTime,
        slotDuration: localConfig.slotDuration,
        bufferTime: localConfig.bufferTime
      })
    }

    const handleCancel = () => {
      setLocalConfig(config)
      setEditingService(null)
    }

    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{config.name}</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                <Users className="w-3 h-3 mr-1" />
                {config.maxBookingsPerSlot} per slot
              </Badge>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingService(config.id)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              ) : (
                <div className="flex space-x-1">
                  <Button variant="outline" size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Bookings per Slot
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={localConfig.maxBookingsPerSlot}
                  onChange={(e) => setLocalConfig(prev => ({
                    ...prev,
                    maxBookingsPerSlot: parseInt(e.target.value) || 1
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-md">{config.maxBookingsPerSlot}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              {isEditing ? (
                <input
                  type="time"
                  value={localConfig.defaultStartTime}
                  onChange={(e) => setLocalConfig(prev => ({
                    ...prev,
                    defaultStartTime: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-md">{config.defaultStartTime}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              {isEditing ? (
                <input
                  type="time"
                  value={localConfig.defaultEndTime}
                  onChange={(e) => setLocalConfig(prev => ({
                    ...prev,
                    defaultEndTime: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-md">{config.defaultEndTime}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slot Duration (min)
              </label>
              {isEditing ? (
                <select
                  value={localConfig.slotDuration}
                  onChange={(e) => setLocalConfig(prev => ({
                    ...prev,
                    slotDuration: parseInt(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  <option value={15}>15 min</option>
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>60 min</option>
                </select>
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-md">{config.slotDuration} min</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const OverrideDialog = () => {
    const [overrideForm, setOverrideForm] = useState({
      serviceId: selectedServiceForOverride,
      date: "",
      time: "",
      maxBookings: 1,
      reason: ""
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      createCapacityOverride(overrideForm)
    }

    return (
      <Dialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Capacity Override</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service
              </label>
              <select
                value={overrideForm.serviceId}
                onChange={(e) => setOverrideForm(prev => ({ ...prev, serviceId: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="">Select a service</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={overrideForm.date}
                  onChange={(e) => setOverrideForm(prev => ({ ...prev, date: e.target.value }))}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={overrideForm.time}
                  onChange={(e) => setOverrideForm(prev => ({ ...prev, time: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Bookings
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={overrideForm.maxBookings}
                onChange={(e) => setOverrideForm(prev => ({ 
                  ...prev, 
                  maxBookings: parseInt(e.target.value) || 0 
                }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason
              </label>
              <textarea
                value={overrideForm.reason}
                onChange={(e) => setOverrideForm(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="e.g., Holiday closure, Special event, Maintenance"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowOverrideDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Override</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Service Capacity Management</h2>
        <Button onClick={() => setShowOverrideDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Override
        </Button>
      </div>

      {message && (
        <Alert className={message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <AlertDescription className={message.type === "success" ? "text-green-700" : "text-red-700"}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="services" className="w-full">
        <TabsList>
          <TabsTrigger value="services">Service Configuration</TabsTrigger>
          <TabsTrigger value="overrides">Capacity Overrides</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            Configure default capacity settings for each service. These settings apply to all time slots unless overridden.
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">Loading service configurations...</div>
          ) : (
            serviceConfigs.map(config => (
              <ServiceConfigCard key={config.id} config={config} />
            ))
          )}
        </TabsContent>

        <TabsContent value="overrides" className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            Create specific capacity overrides for individual dates and times. Useful for holidays, special events, or maintenance periods.
          </div>
          
          {overrides.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No capacity overrides configured</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowOverrideDialog(true)}
                >
                  Create First Override
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {overrides.map(override => (
                <Card key={override.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {services.find(s => s.id === override.serviceId)?.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {override.overrideDate} at {override.overrideTime} - {override.maxBookings} bookings max
                        </div>
                        {override.reason && (
                          <div className="text-sm text-gray-500">{override.reason}</div>
                        )}
                      </div>
                      <Badge variant={override.isActive ? "default" : "secondary"}>
                        {override.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            Capacity utilization analytics and insights.
          </div>
          
          <Card>
            <CardContent className="text-center py-8">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Analytics dashboard coming soon</p>
              <p className="text-sm text-gray-500 mt-2">
                This will show capacity utilization, peak hours, and optimization recommendations.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <OverrideDialog />
    </div>
  )
}

