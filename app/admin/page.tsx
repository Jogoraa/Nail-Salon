import { getAppointments, getContactMessages, getServices, checkAdminStatus, signOut } from "@/lib/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, MessageSquare, Scissors } from "lucide-react"
import AppointmentsTable from "@/components/appointments-table"
import MessagesTable from "@/components/messages-table"
import { Button } from "@/components/ui/button" // Ensure Button is imported

export default async function AdminDashboard() {
  await checkAdminStatus() // This will redirect if not authenticated or not an admin

  const [appointments, messages, services] = await Promise.all([getAppointments(), getContactMessages(), getServices()])

  const todayAppointments = appointments.filter(
    (apt) => new Date(apt.appointment_date).toDateString() === new Date().toDateString(),
  )

  const pendingAppointments = appointments.filter((apt) => apt.status === "pending")
  const newMessages = messages.filter((msg) => msg.status === "new")

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          {" "}
          {/* Added flex and items-center */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your nail salon business</p>
          </div>
          <form action={signOut}>
            {" "}
            {/* Logout form */}
            <Button
              type="submit"
              variant="outline"
              className="text-rose-600 border-rose-300 hover:bg-rose-50 bg-transparent"
            >
              Logout
            </Button>
          </form>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayAppointments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingAppointments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{newMessages.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Services</CardTitle>
              <Scissors className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{services.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* All Appointments Table */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">All Appointments</h2>
          <AppointmentsTable appointments={appointments} />
        </div>

        {/* All Messages Table */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">All Contact Messages</h2>
          <MessagesTable messages={messages} />
        </div>
      </div>
    </div>
  )
}
