"use client"

import { useState, useTransition } from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Trash2, MailOpen, Mail } from "lucide-react"
import type { ContactMessage } from "@/lib/supabase"
import { updateContactMessageStatus, deleteContactMessage } from "@/lib/actions"
import { toast } from "sonner" // Assuming sonner is available for toasts

interface MessagesTableProps {
  messages: ContactMessage[]
}

export default function MessagesTable({ messages }: MessagesTableProps) {
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleStatusChange = (id: string, newStatus: ContactMessage["status"]) => {
    startTransition(async () => {
      const result = await updateContactMessageStatus(id, newStatus)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this message? This action cannot be undone.")) {
      return
    }
    setDeletingId(id)
    startTransition(async () => {
      const result = await deleteContactMessage(id)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
      setDeletingId(null)
    })
  }

  const getStatusVariant = (status: ContactMessage["status"]) => {
    switch (status) {
      case "new":
        return "default"
      case "read":
        return "secondary"
      case "replied":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sender</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                No messages found.
              </TableCell>
            </TableRow>
          ) : (
            messages.map((message) => (
              <TableRow key={message.id}>
                <TableCell>
                  <div className="font-medium">
                    {message.first_name} {message.last_name}
                  </div>
                  <div className="text-sm text-gray-500">{message.phone}</div>
                </TableCell>
                <TableCell>{message.email}</TableCell>
                <TableCell>{message.service?.name || "General Inquiry"}</TableCell>
                <TableCell className="max-w-[200px] truncate text-sm text-gray-600">
                  {message.message || "No message provided."}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(message.status)}>{message.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending && deletingId === message.id}>
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(message.id, "read")}
                        disabled={message.status === "read" || isPending}
                      >
                        <MailOpen className="mr-2 h-4 w-4" /> Mark as Read
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(message.id, "replied")}
                        disabled={message.status === "replied" || isPending}
                      >
                        <Mail className="mr-2 h-4 w-4" /> Mark as Replied
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(message.id)}
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
