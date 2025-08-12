"use client"

import { useState, useTransition, useCallback } from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Trash2, CheckCircle, XCircle, Clock, User, MessageSquare, Eye, Reply, Archive, Download, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import type { ContactMessage } from "@/lib/supabase"
import { updateMessageStatus, deleteMessage } from "@/lib/actions"
import { toast } from "sonner"

interface MessagesTableProps {
  messages: ContactMessage[]
}

type SortField = 'customer' | 'subject' | 'date' | 'status' | 'created'
type SortDirection = 'asc' | 'desc'

export default function MessagesTable({ messages }: MessagesTableProps) {
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Sorting function
  const sortMessages = useCallback((messages: ContactMessage[]) => {
    return [...messages].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'customer':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'subject':
          aValue = (a.subject || '').toLowerCase()
          bValue = (b.subject || '').toLowerCase()
          break
        case 'date':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'created':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [sortField, sortDirection])

  // Handle sort column click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Get sort icon for column
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
  }

  // Export to CSV
  const exportToCSV = () => {
    const sortedMessages = sortMessages(messages)
    
    const csvContent = [
      ['Customer Name', 'Email', 'Phone', 'Subject', 'Message', 'Status', 'Created At'],
      ...sortedMessages.map(msg => [
        msg.name,
        msg.email,
        msg.phone || '',
        msg.subject || 'No Subject',
        msg.message,
        msg.status,
        msg.created_at
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `messages-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Messages exported successfully!')
  }

  // Refresh data
  const handleRefresh = () => {
    setIsRefreshing(true)
    // Simulate refresh - in a real app, you'd call a refresh function
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success('Data refreshed successfully!')
    }, 1000)
  }

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

  const sortedMessages = sortMessages(messages)

  return (
    <div className="space-y-4">
      {/* Table Controls */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-slate-600">
          Showing {sortedMessages.length} message{sortedMessages.length !== 1 ? 's' : ''}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            className="border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl border-0 shadow-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-100/80 border-0">
              <TableHead className="text-slate-700 font-semibold">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('customer')}
                  className="h-auto p-0 font-semibold text-slate-700 hover:bg-transparent"
                >
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Customer</span>
                    {getSortIcon('customer')}
                  </div>
                </Button>
              </TableHead>
              <TableHead className="text-slate-700 font-semibold">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('subject')}
                  className="h-auto p-0 font-semibold text-slate-700 hover:bg-transparent"
                >
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Message</span>
                    {getSortIcon('subject')}
                  </div>
                </Button>
              </TableHead>
              <TableHead className="text-slate-700 font-semibold">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('date')}
                  className="h-auto p-0 font-semibold text-slate-700 hover:bg-transparent"
                >
                  <div className="flex items-center space-x-2">
                    <span>Date</span>
                    {getSortIcon('date')}
                  </div>
                </Button>
              </TableHead>
              <TableHead className="text-slate-700 font-semibold">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('status')}
                  className="h-auto p-0 font-semibold text-slate-700 hover:bg-transparent"
                >
                  <div className="flex items-center space-x-2">
                    <span>Status</span>
                    {getSortIcon('status')}
                  </div>
                </Button>
              </TableHead>
              <TableHead className="text-right text-slate-700 font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedMessages.length === 0 ? (
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
              sortedMessages.map((message) => (
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
    </div>
  )
}
