import { NextRequest, NextResponse } from 'next/server'
import { getServiceAvailability, canBookServices, getAvailableTimeSlots } from '@/lib/availability'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const date = searchParams.get('date')
    const serviceIds = searchParams.get('services')?.split(',') || []
    const startTime = searchParams.get('startTime') || '09:00'
    const endTime = searchParams.get('endTime') || '18:00'
    const slotDuration = parseInt(searchParams.get('slotDuration') || '30')

    // Validate required parameters
    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required (YYYY-MM-DD format)' },
        { status: 400 }
      )
    }

    if (serviceIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one service ID is required' },
        { status: 400 }
      )
    }

    // Get availability data
    const availability = await getServiceAvailability({
      date,
      serviceIds,
      startTime,
      endTime,
      slotDuration
    })

    return NextResponse.json(availability)

  } catch (error) {
    console.error('Error in availability API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch availability data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...params } = body

    switch (action) {
      case 'check_booking':
        const { serviceIds, date, time, quantities } = params
        const result = await canBookServices(serviceIds, date, time, quantities)
        return NextResponse.json(result)

      case 'get_available_slots':
        const { serviceIds: sIds, date: checkDate } = params
        const slots = await getAvailableTimeSlots(sIds, checkDate)
        return NextResponse.json({ availableSlots: slots })

      case 'get_booking_availability':
        const { date: bookingDate, serviceIds: bookingServiceIds } = params
        try {
          const availability = await getServiceAvailability({
            date: bookingDate,
            serviceIds: bookingServiceIds,
            startTime: "09:00",
            endTime: "18:00",
            slotDuration: 30
          })

          // Transform data for booking form
          const timeSlots = []
          const allTimes = new Set<string>()

          // Collect all possible time slots
          availability.services.forEach(service => {
            service.timeSlots.forEach(slot => {
              allTimes.add(slot.time)
            })
          })

          // Check availability for each time slot
          for (const time of Array.from(allTimes).sort()) {
            const isAvailable = availability.services.every(service => {
              const slot = service.timeSlots.find(s => s.time === time)
              return slot && slot.isAvailable
            })

            const availabilityDetails = availability.services.map(service => {
              const slot = service.timeSlots.find(s => s.time === time)
              return {
                serviceId: service.serviceId,
                serviceName: service.serviceName,
                remainingSlots: slot?.availableSlots || 0,
                isAvailable: slot?.isAvailable || false
              }
            })

            timeSlots.push({
              time,
              label: formatTimeForDisplay(time),
              isAvailable,
              availabilityDetails
            })
          }

          return NextResponse.json({ timeSlots, error: null })

        } catch (error) {
          console.error('Error in get_booking_availability:', error)
          return NextResponse.json({ timeSlots: [], error: 'Failed to fetch availability' }, { status: 500 })
        }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: check_booking, get_available_slots, get_booking_availability' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error in availability POST API:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

/**
 * Format time for display (e.g., "09:00" -> "9:00 AM")
 */
function formatTimeForDisplay(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

