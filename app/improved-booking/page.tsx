import { getServices } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, Clock, Scissors, Users, Zap, CheckCircle, Star } from "lucide-react"
import Link from "next/link"
import ServiceFirstBookingForm from "@/components/service-first-booking-form"

interface ImprovedBookingPageProps {
  searchParams: Promise<{ service?: string }>
}

export default async function ImprovedBookingPage({ searchParams }: ImprovedBookingPageProps) {
  const resolvedSearchParams = await searchParams
  const preSelectedServiceId = resolvedSearchParams.service

  let services = []
  let error = null

  try {
    services = await getServices()
    console.log("=== GETTING SERVICES ===")
    console.log("Found", services.length, "services")
  } catch (err) {
    console.error("Error loading services:", err)
    error = err instanceof Error ? err.message : "Unknown error occurred"
  }

  // If there's an error loading services, show error message
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Improved Booking System</h1>
            <p className="text-slate-600">Experience our revolutionary new booking flow</p>
          </div>

          <Card className="bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-800">Error Loading Services</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-4">
                We encountered an error while loading our services. Please try again later or contact support if the problem persists.
              </p>
              <div className="bg-red-100 p-4 rounded-lg">
                <p className="text-sm text-red-800 font-mono">{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent">
                  Improved Booking System
                </h1>
                <p className="text-slate-600 text-sm">Revolutionary service-first booking experience</p>
              </div>
            </div>
            
            <Link href="/">
              <Button variant="outline" className="border-slate-300 text-slate-600 hover:bg-slate-50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            <span>New & Improved</span>
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Book Your Perfect Appointment
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Our revolutionary booking system puts you in control. Choose your services first, then see real-time availability that fits your schedule.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Scissors className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-slate-900">Service-First Approach</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-slate-600">
                Start by selecting the services you want, then find the perfect time that works for you.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-slate-900">Real-Time Availability</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-slate-600">
                See exactly when your chosen services are available, with no booking conflicts.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-slate-900">Smart Scheduling</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-slate-600">
                Our system intelligently manages capacity to ensure the best experience for everyone.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-center text-slate-900 text-2xl">
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                    1
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Choose Services</h3>
                  <p className="text-sm text-slate-600">Select the nail services you want</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                    2
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Pick Date</h3>
                  <p className="text-sm text-slate-600">Choose your preferred date</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                    3
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Select Time</h3>
                  <p className="text-sm text-slate-600">See available time slots</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                    4
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Confirm</h3>
                  <p className="text-sm text-slate-600">Book your appointment</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Form */}
        <div className="mb-12" id="booking-form">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-slate-900">
                Ready to Book?
              </CardTitle>
              <p className="text-slate-600">
                Experience the future of appointment booking
              </p>
            </CardHeader>
            <CardContent>
              <ServiceFirstBookingForm 
                services={services} 
                preSelectedServiceId={preSelectedServiceId}
              />
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-center text-blue-900 text-2xl">
                Why Choose Our New System?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-blue-900 mb-4 text-lg">✨ Benefits</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span className="text-blue-800">No more double-booking issues</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span className="text-blue-800">See real-time availability</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span className="text-blue-800">Faster booking process</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span className="text-blue-800">Better customer experience</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-4 text-lg">🚀 Features</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-800">Service-first booking flow</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-800">Smart capacity management</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-800">Real-time availability updates</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-800">Mobile-optimized interface</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-br from-slate-900 to-blue-900 text-white border-0 shadow-2xl">
            <CardContent className="pt-12 pb-12">
              <h3 className="text-3xl font-bold mb-4">
                Ready to Transform Your Booking Experience?
              </h3>
              <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
                Join the future of appointment booking with our revolutionary new system. 
                Experience seamless scheduling like never before.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  asChild
                >
                  <a href="#booking-form">
                    <Calendar className="w-5 h-5 mr-2" />
                    Start Booking Now
                  </a>
                </Button>
                <Link href="/">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 