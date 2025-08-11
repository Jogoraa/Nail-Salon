"use client"

import { useState, useTransition } from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Trash2, CheckCircle, XCircle, Clock } from "lucide-react"
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

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                No appointments found.
              </TableCell>
            </TableRow>
          ) : (
            appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>
                  <div className="font-medium">
                    {appointment.customer?.first_name} {appointment.customer?.last_name}
                  </div>
                  <div className="text-sm text-gray-500">{appointment.customer?.email}</div>
                </TableCell>
<TableCell>
  {appointment.appointment_services.map(s => s.service.name).join(", ") || "N/A"}
</TableCell>

                <TableCell>
                  {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_time}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(appointment.status)}>{appointment.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        disabled={isPending && deletingId === appointment.id}
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(appointment.id, "confirmed")}
                        disabled={appointment.status === "confirmed" || isPending}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" /> Confirm
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(appointment.id, "cancelled")}
                        disabled={appointment.status === "cancelled" || isPending}
                      >
                        <XCircle className="mr-2 h-4 w-4" /> Cancel
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(appointment.id, "completed")}
                        disabled={appointment.status === "completed" || isPending}
                      >
                        <Clock className="mr-2 h-4 w-4" /> Mark as Completed
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(appointment.id)}
                        disabled={isPending}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
