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
  Plus,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
  Zap,
  Shield,
  BarChart3,
  Activity
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

      if (response.ok) {
        setMessage({ type: "success", text: "Service capacity updated successfully" })
        setEditingService(null)
        loadServiceConfigs()
      } else {
        throw new Error('Failed to update service capacity')
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
          action: 'create_override',
          ...overrideData
        })
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Capacity override created successfully" })
        setShowOverrideDialog(false)
        loadOverrides()
      } else {
        throw new Error('Failed to create capacity override')
      }
    } catch (error) {
      console.error("Error creating capacity override:", error)
      setMessage({ type: "error", text: "Failed to create capacity override" })
    }
  }

  const loadOverrides = async () => {
    // Implementation for loading overrides
  }

  const ServiceConfigCard = ({ config }: { config: ServiceCapacityConfig }) => {
    const [editing, setEditing] = useState(false)
    const [formData, setFormData] = useState(config)

    const handleSave = () => {
      updateServiceCapacity(config.id, formData)
      setEditing(false)
    }

    const handleCancel = () => {
      setFormData(config)
      setEditing(false)
    }

    return (
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">{config.name}</CardTitle>
                <p className="text-sm text-slate-600">Service capacity configuration</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {editing ? (
                <>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                    className="border-slate-300 text-slate-600 hover:bg-slate-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditing(true)}
                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Max Bookings per Slot
                </label>
                {editing ? (
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.maxBookingsPerSlot}
                    onChange={(e) => setFormData({...formData, maxBookingsPerSlot: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1">
                      {config.maxBookingsPerSlot}
                    </Badge>
                    <span className="text-sm text-slate-600">concurrent bookings</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Slot Duration
                </label>
                {editing ? (
                  <input
                    type="number"
                    min="15"
                    max="120"
                    step="15"
                    value={formData.slotDuration}
                    onChange={(e) => setFormData({...formData, slotDuration: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 px-3 py-1">
                      {config.slotDuration} min
                    </Badge>
                    <span className="text-sm text-slate-600">per appointment</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Operating Hours
                </label>
                {editing ? (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="time"
                      value={formData.defaultStartTime}
                      onChange={(e) => setFormData({...formData, defaultStartTime: e.target.value})}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="time"
                      value={formData.defaultEndTime}
                      onChange={(e) => setFormData({...formData, defaultEndTime: e.target.value})}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 px-3 py-1">
                      {config.defaultStartTime} - {config.defaultEndTime}
                    </Badge>
                    <span className="text-sm text-slate-600">daily</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  Buffer Time
                </label>
                {editing ? (
                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="5"
                    value={formData.bufferTime}
                    onChange={(e) => setFormData({...formData, bufferTime: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 px-3 py-1">
                      {config.bufferTime} min
                    </Badge>
                    <span className="text-sm text-slate-600">between appointments</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const OverrideDialog = () => {
    const [formData, setFormData] = useState({
      serviceId: selectedServiceForOverride,
      date: "",
      time: "09:00",
      maxBookings: 1,
      reason: ""
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      createCapacityOverride(formData)
    }

    return (
      <Dialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
        <DialogContent className="bg-white/95 backdrop-blur-md border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-slate-900">
              <Zap className="w-6 h-6 mr-3 text-blue-600" />
              Create Capacity Override
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Service</label>
              <select
                value={formData.serviceId}
                onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a service</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Max Bookings</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.maxBookings}
                onChange={(e) => setFormData({...formData, maxBookings: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Reason</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Explain why this override is needed..."
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowOverrideDialog(false)}
                className="border-slate-300 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                type="submit" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Override
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert className={`border-0 ${
          message.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
            : "bg-rose-50 text-rose-800 border-rose-200"
        }`}>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-lg">
          <TabsTrigger 
            value="services" 
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-md transition-all duration-200"
          >
            <Settings className="w-4 h-4 mr-2" />
            Service Configuration
          </TabsTrigger>
          <TabsTrigger 
            value="overrides"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-md transition-all duration-200"
          >
            <Zap className="w-4 h-4 mr-2" />
            Capacity Overrides
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {serviceConfigs.map(config => (
              <ServiceConfigCard key={config.id} config={config} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="overrides" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Capacity Overrides</h3>
              <p className="text-sm text-slate-600">Manage special capacity settings for specific dates and times</p>
            </div>
            <Button
              onClick={() => setShowOverrideDialog(true)}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Override
            </Button>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-6 text-center">
            <Zap className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-slate-600 mb-2">No Overrides Yet</h4>
            <p className="text-slate-500 mb-4">Create capacity overrides to handle special events, holidays, or peak times</p>
            <Button
              onClick={() => setShowOverrideDialog(true)}
              variant="outline"
              className="border-slate-300 text-slate-600 hover:bg-slate-100"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Override
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <OverrideDialog />
    </div>
  )
}

