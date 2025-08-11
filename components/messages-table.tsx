"use client"

import { useState, useTransition } from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Trash2, CheckCircle, XCircle, Clock, User, MessageSquare, Eye, Reply, Archive } from "lucide-react"
import type { ContactMessage } from "@/lib/supabase"
import { updateMessageStatus, deleteMessage } from "@/lib/actions"
import { toast } from "sonner"

interface MessagesTableProps {
  messages: ContactMessage[]
}

export default function MessagesTable({ messages }: MessagesTableProps) {
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleStatusChange = (id: string, newStatus: ContactMessage["status"]) => {
    startTransition(async () => {
      const result = await updateMessageStatus(id, newStatus)
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
      const result = await deleteMessage(id)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
      setDeletingId(null)
    })
  }

  const getStatusColor = (status: ContactMessage["status"]) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "read":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "replied":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "archived":
        return "bg-slate-100 text-slate-800 border-slate-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const getStatusIcon = (status: ContactMessage["status"]) => {
    switch (status) {
      case "new":
        return <Clock className="w-4 h-4" />
      case "read":
        return <Eye className="w-4 h-4" />
      case "replied":
        return <Reply className="w-4 h-4" />
      case "archived":
        return <Archive className="w-4 h-4" />
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
                <MessageSquare className="w-4 h-4" />
                <span>Message</span>
              </div>
            </TableHead>
            <TableHead className="text-slate-700 font-semibold">Date</TableHead>
            <TableHead className="text-slate-700 font-semibold">Status</TableHead>
            <TableHead className="text-right text-slate-700 font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.length === 0 ? (
            <TableRow className="hover:bg-slate-50/50 border-0">
              <TableCell colSpan={5} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-slate-400" />
                  </div>
                  <div className="text-slate-500">
                    <p className="font-medium">No messages found</p>
                    <p className="text-sm">When customers send messages, they will appear here</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            messages.map((message) => (
              <TableRow key={message.id} className="hover:bg-slate-50/50 border-0 transition-colors duration-200">
                <TableCell className="py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">
                        {message.name}
                      </div>
                      <div className="text-sm text-slate-600">{message.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="max-w-xs">
                    <div className="font-medium text-slate-900 mb-1">
                      {message.subject || "No Subject"}
                    </div>
                    <div className="text-sm text-slate-600 line-clamp-2">
                      {message.message}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="text-sm text-slate-600">
                    {new Date(message.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(message.status)} border px-3 py-1 rounded-full flex items-center space-x-1 w-fit`}
                  >
                    {getStatusIcon(message.status)}
                    <span className="capitalize">{message.status}</span>
                  </Badge>
                </TableCell>
                <TableCell className="py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400"
                      onClick={() => {
                        // View message details
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
                          onClick={() => handleStatusChange(message.id, "read")}
                          className="text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Mark as Read
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(message.id, "replied")}
                          className="text-blue-700 hover:bg-blue-50 cursor-pointer"
                        >
                          <Reply className="w-4 h-4 mr-2" />
                          Mark as Replied
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(message.id, "archived")}
                          className="text-slate-700 hover:bg-slate-50 cursor-pointer"
                        >
                          <Archive className="w-4 h-4 mr-2" />
                          Archive Message
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(message.id)}
                          className="text-rose-700 hover:bg-rose-50 cursor-pointer"
                          disabled={deletingId === message.id}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {deletingId === message.id ? "Deleting..." : "Delete"}
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
