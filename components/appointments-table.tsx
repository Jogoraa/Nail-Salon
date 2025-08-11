"use client"

import { useState, useTransition } from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Trash2, CheckCircle, XCircle, Clock, User, Calendar, Scissors, Eye, Edit } from "lucide-react"
import type { Appointment } from "@/lib/supabase"
import { updateAppointmentStatus, deleteAppointment } from "@/lib/actions"
import { toast } from "sonner" // Assuming sonner is available for toasts

interface AppointmentsTableProps {
  appointments: Appointment[],
}

export default function AppointmentsTable({ appointments }: AppointmentsTableProps) {
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleStatusChange = (id: string, newStatus: Appointment["status"]) => {
    startTransition(async () => {
      const result = await updateAppointmentStatus(id, newStatus)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this appointment? This action cannot be undone.")) {
      return
    }
    setDeletingId(id)
    startTransition(async () => {
      const result = await deleteAppointment(id)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
      setDeletingId(null)
    })
  }

  const getStatusVariant = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed":
        return "default"
      case "pending":
        return "secondary"
      case "completed":
        return "outline"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "cancelled":
        return "bg-rose-100 text-rose-800 border-rose-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const getStatusIcon = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />
      case "pending":
        return <Clock className="w-4 h-4" />
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "cancelled":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl border-0 shadow-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80 hover:bg-slate-100/80 border-0">
            <TableHead className="text-slate-700 font-semibold">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Customer</span>
              </div>
            </TableHead>
            <TableHead className="text-slate-700 font-semibold">
              <div className="flex items-center space-x-2">
                <Scissors className="w-4 h-4" />
                <span>Service</span>
              </div>
            </TableHead>
            <TableHead className="text-slate-700 font-semibold">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Date & Time</span>
              </div>
            </TableHead>
            <TableHead className="text-slate-700 font-semibold">Status</TableHead>
            <TableHead className="text-right text-slate-700 font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.length === 0 ? (
            <TableRow className="hover:bg-slate-50/50 border-0">
              <TableCell colSpan={5} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-slate-400" />
                  </div>
                  <div className="text-slate-500">
                    <p className="font-medium">No appointments found</p>
                    <p className="text-sm">When appointments are created, they will appear here</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            appointments.map((appointment) => (
              <TableRow key={appointment.id} className="hover:bg-slate-50/50 border-0 transition-colors duration-200">
                <TableCell className="py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">
                        {appointment.customer?.first_name} {appointment.customer?.last_name}
                      </div>
                      <div className="text-sm text-slate-600">{appointment.customer?.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <Scissors className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-slate-800">
                      {appointment.appointment_services.map(s => s.service.name).join(", ") || "N/A"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">
                        {new Date(appointment.appointment_date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-slate-600">
                        at {appointment.appointment_time}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(appointment.status)} border px-3 py-1 rounded-full flex items-center space-x-1 w-fit`}
                  >
                    {getStatusIcon(appointment.status)}
                    <span className="capitalize">{appointment.status}</span>
                  </Badge>
                </TableCell>
                <TableCell className="py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400"
                      onClick={() => {
                        // View appointment details
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-md border-0 shadow-xl">
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(appointment.id, "confirmed")}
                          className="text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark Confirmed
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(appointment.id, "completed")}
                          className="text-blue-700 hover:bg-blue-50 cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark Completed
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(appointment.id, "cancelled")}
                          className="text-rose-700 hover:bg-rose-50 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel Appointment
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(appointment.id)}
                          className="text-rose-700 hover:bg-rose-50 cursor-pointer"
                          disabled={deletingId === appointment.id}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {deletingId === appointment.id ? "Deleting..." : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
