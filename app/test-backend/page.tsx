import { getServices, getAppointments, getContactMessages } from "@/lib/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function TestBackend() {
  let services = []
  let appointments = []
  let messages = []
  const errors = []

  // Test services
  try {
    services = await getServices()
    console.log("Services loaded:", services.length)
  } catch (error) {
    console.error("Services error:", error)
    errors.push(`Services: ${error}`)
  }

  // Test appointments
  try {
    appointments = await getAppointments()
    console.log("Appointments loaded:", appointments.length)
  } catch (error) {
    console.error("Appointments error:", error)
    errors.push(`Appointments: ${error}`)
  }

  // Test messages
  try {
    messages = await getContactMessages()
    console.log("Messages loaded:", messages.length)
  } catch (error) {
    console.error("Messages error:", error)
    errors.push(`Messages: ${error}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Backend Integration Test</h1>

        {errors.length > 0 && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700">Errors Detected</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-red-600">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Services Test */}
          <Card>
            <CardHeader>
              <CardTitle>Services ({services.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {services.length > 0 ? (
                <div className="space-y-2">
                  {services.slice(0, 3).map((service) => (
                    <div key={service.id} className="p-2 bg-gray-100 rounded">
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-gray-600">
                        ${service.price} - {service.duration}min
                      </div>
                    </div>
                  ))}
                  {services.length > 3 && (
                    <div className="text-sm text-gray-500">...and {services.length - 3} more</div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500">No services found. Run the seed script!</div>
              )}
            </CardContent>
          </Card>

          {/* Appointments Test */}
          <Card>
            <CardHeader>
              <CardTitle>Appointments ({appointments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {appointments.length > 0 ? (
                <div className="space-y-2">
                  {appointments.slice(0, 3).map((appointment) => (
                    <div key={appointment.id} className="p-2 bg-gray-100 rounded">
                      <div className="font-medium">
                        {appointment.customer?.first_name} {appointment.customer?.last_name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {appointment.service?.name} - {appointment.appointment_date}
                      </div>
                    </div>
                  ))}
                  {appointments.length > 3 && (
                    <div className="text-sm text-gray-500">...and {appointments.length - 3} more</div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500">No appointments yet</div>
              )}
            </CardContent>
          </Card>

          {/* Messages Test */}
          <Card>
            <CardHeader>
              <CardTitle>Messages ({messages.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {messages.length > 0 ? (
                <div className="space-y-2">
                  {messages.slice(0, 3).map((message) => (
                    <div key={message.id} className="p-2 bg-gray-100 rounded">
                      <div className="font-medium">
                        {message.first_name} {message.last_name}
                      </div>
                      <div className="text-sm text-gray-600">{message.email}</div>
                    </div>
                  ))}
                  {messages.length > 3 && (
                    <div className="text-sm text-gray-500">...and {messages.length - 3} more</div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500">No messages yet</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Environment Variables Check */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>SUPABASE_URL:</strong>{" "}
                <span className={process.env.NEXT_PUBLIC_SUPABASE_URL ? "text-green-600" : "text-red-600"}>
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Set" : "✗ Missing"}
                </span>
              </div>
              <div>
                <strong>SUPABASE_ANON_KEY:</strong>{" "}
                <span className={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "text-green-600" : "text-red-600"}>
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Set" : "✗ Missing"}
                </span>
              </div>
              <div>
                <strong>SUPABASE_SERVICE_KEY:</strong>{" "}
                <span className={process.env.SUPABASE_SERVICE_ROLE_KEY ? "text-green-600" : "text-red-600"}>
                  {process.env.SUPABASE_SERVICE_ROLE_KEY ? "✓ Set" : "✗ Missing"}
                </span>
              </div>
              <div>
                <strong>RESEND_API_KEY:</strong>{" "}
                <span className={process.env.RESEND_API_KEY ? "text-green-600" : "text-red-600"}>
                  {process.env.RESEND_API_KEY ? "✓ Set" : "✗ Missing"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
