import { NextRequest, NextResponse } from 'next/server'
import { 
  updateServiceCapacity, 
  setCapacityOverride, 
  getServiceCapacityConfig,
  getCapacityOverrides,
  addToWaitlist,
  getWaitlistEntries
} from '@/lib/availability'
import { checkAdminStatus } from '@/lib/actions'

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    await checkAdminStatus()

    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')
    const action = searchParams.get('action')

    switch (action) {
      case 'config':
        if (!serviceId) {
          return NextResponse.json(
            { error: 'Service ID is required for config action' },
            { status: 400 }
          )
        }
        const config = await getServiceCapacityConfig(serviceId)
        return NextResponse.json(config)

      case 'overrides':
        const overridesResult = await getCapacityOverrides(serviceId || undefined)
        return NextResponse.json(overridesResult)

      case 'waitlist':
        if (!serviceId) {
          return NextResponse.json(
            { error: 'Service ID is required for waitlist action' },
            { status: 400 }
          )
        }
        const date = searchParams.get('date')
        const waitlist = await getWaitlistEntries(serviceId, date || undefined)
        return NextResponse.json({ waitlist })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: config, overrides, waitlist' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error in capacity GET API:', error)
    
    if (error instanceof Error && error.message.includes('redirect')) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch capacity data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    await checkAdminStatus()

    const body = await request.json()
    const { action, ...params } = body

    switch (action) {
      case 'update_capacity':
        const { serviceId, maxBookingsPerSlot, startTime, endTime, slotDuration, bufferTime } = params
        
        if (!serviceId || maxBookingsPerSlot === undefined) {
          return NextResponse.json(
            { error: 'Service ID and maxBookingsPerSlot are required' },
            { status: 400 }
          )
        }

        const updateResult = await updateServiceCapacity(
          serviceId,
          maxBookingsPerSlot,
          startTime,
          endTime,
          slotDuration,
          bufferTime
        )
        return NextResponse.json(updateResult)

      case 'set_override':
        const { serviceId: sId, date, time, maxBookings, reason } = params
        
        if (!sId || !date || !time || maxBookings === undefined) {
          return NextResponse.json(
            { error: 'Service ID, date, time, and maxBookings are required' },
            { status: 400 }
          )
        }

        const overrideResult = await setCapacityOverride(
          sId,
          date,
          time,
          maxBookings,
          reason
        )
        return NextResponse.json(overrideResult)

      case 'add_waitlist':
        const { customerId, serviceId: wServiceId, preferredDate, preferredTime, alternativeDates, alternativeTimes } = params
        
        if (!customerId || !wServiceId || !preferredDate || !preferredTime) {
          return NextResponse.json(
            { error: 'Customer ID, service ID, preferred date, and preferred time are required' },
            { status: 400 }
          )
        }

        const waitlistResult = await addToWaitlist(
          customerId,
          wServiceId,
          preferredDate,
          preferredTime,
          alternativeDates,
          alternativeTimes
        )
        return NextResponse.json(waitlistResult)

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: update_capacity, set_override, add_waitlist' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error in capacity POST API:', error)
    
    if (error instanceof Error && error.message.includes('redirect')) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process capacity request' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check admin authentication
    await checkAdminStatus()

    const body = await request.json()
    const { serviceId, ...updateData } = body

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      )
    }

    // Update service capacity configuration
    const result = await updateServiceCapacity(
      serviceId,
      updateData.maxBookingsPerSlot,
      updateData.startTime,
      updateData.endTime,
      updateData.slotDuration
    )

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error in capacity PUT API:', error)
    
    if (error instanceof Error && error.message.includes('redirect')) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update capacity configuration' },
      { status: 500 }
    )
  }
}

