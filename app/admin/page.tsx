import { getAppointments, getContactMessages, getServices, checkAdminStatus, signOut } from "@/lib/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, MessageSquare, Scissors, Settings, Clock, TrendingUp, BarChart3, Activity, Zap, Shield, Palette, Star, Eye, Plus, Filter, Search, Download, RefreshCw, Home, LayoutDashboard, FileText, UserCheck, Cog, LogOut } from "lucide-react"
import AppointmentsTable from "@/components/appointments-table"
import MessagesTable from "@/components/messages-table"
import AdminCapacityManager from "@/components/admin-capacity-manager"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AdminDashboard() {
  await checkAdminStatus() // This will redirect if not authenticated or not an admin

  const [appointments, messages, services] = await Promise.all([getAppointments(), getContactMessages(), getServices()])

  const todayAppointments = appointments.filter(
    (apt) => new Date(apt.appointment_date).toDateString() === new Date().toDateString(),
  )

  const pendingAppointments = appointments.filter((apt) => apt.status === "pending")
  const newMessages = messages.filter((msg) => msg.status === "new")
  const completedAppointments = appointments.filter((apt) => apt.status === "completed")
  const cancelledAppointments = appointments.filter((apt) => apt.status === "cancelled")

  // Calculate revenue (assuming average service price of $50)
  const totalRevenue = completedAppointments.length * 50
  const monthlyRevenue = totalRevenue * 0.3 // Rough estimate

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Top Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
          <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-slate-600 text-sm">Manage your nail salon business</p>
              </div>
          </div>
            
            <div className="flex items-center space-x-3">
              <Link href="/improved-booking">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                  <Zap className="w-4 h-4 mr-2" />
                  New Booking System
                </Button>
              </Link>
          <form action={signOut}>
            <Button
              type="submit"
              variant="outline"
                  className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all duration-200"
            >
                  <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </form>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white/80 backdrop-blur-md border-r border-white/20 shadow-lg min-h-screen">
          <nav className="p-6">
            <div className="space-y-6">
              {/* Main Navigation */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Main</h3>
                <div className="space-y-2">
                  <Link href="/admin" className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                  <Link href="/" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-200">
                    <Home className="w-5 h-5" />
                    <span>View Site</span>
                  </Link>
                </div>
              </div>

              {/* Business Management */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Business</h3>
                <div className="space-y-2">
                  <Link href="#appointments" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-200">
                    <Calendar className="w-5 h-5" />
                    <span>Appointments</span>
                  </Link>
                  <Link href="#messages" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-200">
                    <MessageSquare className="w-5 h-5" />
                    <span>Messages</span>
                  </Link>
                  <Link href="#services" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-200">
                    <Scissors className="w-5 h-5" />
                    <span>Services</span>
                  </Link>
                </div>
              </div>

              {/* System Management */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">System</h3>
                <div className="space-y-2">
                  <Link href="#capacity" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-200">
                    <Settings className="w-5 h-5" />
                    <span>Capacity Management</span>
                  </Link>
                  <Link href="#analytics" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-200">
                    <BarChart3 className="w-5 h-5" />
                    <span>Analytics</span>
                  </Link>
                  <Link href="#settings" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-200">
                    <Cog className="w-5 h-5" />
                    <span>Settings</span>
                  </Link>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Link href="/improved-booking" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-200">
                    <Zap className="w-5 h-5" />
                    <span>Test New System</span>
                  </Link>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">Today's Appointments</CardTitle>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{todayAppointments.length}</div>
                <p className="text-xs text-slate-500 mt-1">Active today</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600"></div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">Pending Bookings</CardTitle>
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{pendingAppointments.length}</div>
                <p className="text-xs text-slate-500 mt-1">Awaiting confirmation</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-600"></div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
                  <CardTitle className="text-sm font-medium text-slate-600">New Messages</CardTitle>
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-slate-900">{newMessages.length}</div>
                <p className="text-xs text-slate-500 mt-1">Unread messages</p>
            </CardContent>
          </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-600"></div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">Active Services</CardTitle>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Scissors className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{services.length}</div>
                <p className="text-xs text-slate-500 mt-1">Available services</p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue & Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0 shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-blue-100">Total Revenue</CardTitle>
                  <BarChart3 className="h-5 w-5 text-blue-200" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">${totalRevenue}</div>
                <p className="text-xs text-blue-200 mt-1">From {completedAppointments.length} completed appointments</p>
            </CardContent>
          </Card>

            <Card className="bg-gradient-to-br from-emerald-600 to-green-700 text-white border-0 shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-emerald-100">Monthly Estimate</CardTitle>
                  <TrendingUp className="h-5 w-5 text-emerald-200" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">${monthlyRevenue}</div>
                <p className="text-xs text-emerald-200 mt-1">Projected monthly revenue</p>
            </CardContent>
          </Card>

            <Card className="bg-gradient-to-br from-amber-600 to-orange-700 text-white border-0 shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-amber-100">Completion Rate</CardTitle>
                  <Activity className="h-5 w-5 text-amber-200" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">
                  {appointments.length > 0 ? Math.round((completedAppointments.length / appointments.length) * 100) : 0}%
                </div>
                <p className="text-xs text-amber-200 mt-1">Appointments completed successfully</p>
            </CardContent>
          </Card>
        </div>

          {/* Improved Booking System Info */}
        <div className="mb-8">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-900">
                  <Zap className="w-6 h-6 mr-3 text-blue-600" />
                  Revolutionary New Booking System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-4 text-lg">🚀 What's New</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-blue-800">Service-first booking flow</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-blue-800">Real-time availability checking</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-blue-800">No more booking conflicts</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-blue-800">Enhanced user experience</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-4 text-lg">⚡ Quick Actions</h3>
                    <div className="space-y-3">
                      <Link href="/improved-booking">
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                          <Eye className="w-4 h-4 mr-2" />
                          Test New System
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Capacity Management Section */}
          <div id="capacity" className="mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-900">
                  <Settings className="w-6 h-6 mr-3 text-slate-600" />
                  Service Capacity Management
                </CardTitle>
                <p className="text-slate-600 text-sm">Configure service durations, concurrent bookings, and availability</p>
              </CardHeader>
              <CardContent>
                <AdminCapacityManager services={services} />
              </CardContent>
            </Card>
          </div>

          {/* Appointments Management */}
          <div id="appointments" className="mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center text-slate-900">
                      <Calendar className="w-6 h-6 mr-3 text-slate-600" />
                      Appointments Management
                    </CardTitle>
                    <p className="text-slate-600 text-sm mt-1">Manage all appointments and bookings</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-50">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-50">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-50">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
          <AppointmentsTable appointments={appointments} />
              </CardContent>
            </Card>
        </div>

          {/* Messages Management */}
          <div id="messages" className="mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center text-slate-900">
                      <MessageSquare className="w-6 h-6 mr-3 text-slate-600" />
                      Contact Messages
                    </CardTitle>
                    <p className="text-slate-600 text-sm mt-1">Manage customer inquiries and feedback</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-50">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                    <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-50">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
          <MessagesTable messages={messages} />
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Footer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-slate-100 to-slate-200 border-0">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-300 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Appointments</p>
                    <p className="text-2xl font-bold text-slate-900">{appointments.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-100 to-slate-200 border-0">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-300 rounded-lg flex items-center justify-center">
                    <Palette className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Services Offered</p>
                    <p className="text-2xl font-bold text-slate-900">{services.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-100 to-slate-200 border-0">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-300 rounded-lg flex items-center justify-center">
                    <Star className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Customer Messages</p>
                    <p className="text-2xl font-bold text-slate-900">{messages.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
