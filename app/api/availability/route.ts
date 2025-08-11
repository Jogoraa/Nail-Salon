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

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: check_booking, get_available_slots' },
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

