/**
 * Tests for the enhanced capacity management system
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { 
  getServiceAvailability, 
  canBookServices, 
  getAvailableTimeSlots,
  updateServiceCapacity,
  setCapacityOverride
} from '../lib/availability'

// Mock Supabase client
jest.mock('../lib/supabase-server', () => ({
  supabaseAdmin: {
    rpc: jest.fn(),
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        })),
        in: jest.fn(),
        update: jest.fn(() => ({
          eq: jest.fn()
        })),
        upsert: jest.fn(),
        delete: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn()
          }))
        }))
      }))
    }))
  }
}))

describe('Availability System', () => {
  const mockServiceIds = ['service-1', 'service-2']
  const mockDate = '2024-01-15'
  const mockTime = '10:00'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getServiceAvailability', () => {
    it('should return availability data for multiple services', async () => {
      const mockAvailabilityData = [
        {
          service_id: 'service-1',
          service_name: 'Manicure',
          time_slot: '09:00',
          max_capacity: 2,
          current_bookings: 1,
          available_slots: 1,
          is_available: true
        },
        {
          service_id: 'service-1',
          service_name: 'Manicure',
          time_slot: '10:00',
          max_capacity: 2,
          current_bookings: 2,
          available_slots: 0,
          is_available: false
        }
      ]

      const { supabaseAdmin } = require('../lib/supabase-server')
      supabaseAdmin.rpc.mockResolvedValue({ data: mockAvailabilityData, error: null })

      const result = await getServiceAvailability({
        date: mockDate,
        serviceIds: ['service-1']
      })

      expect(result.date).toBe(mockDate)
      expect(result.services).toHaveLength(1)
      expect(result.services[0].serviceId).toBe('service-1')
      expect(result.services[0].timeSlots).toHaveLength(2)
      expect(result.services[0].timeSlots[0].isAvailable).toBe(true)
      expect(result.services[0].timeSlots[1].isAvailable).toBe(false)
    })

    it('should handle database errors gracefully', async () => {
      const { supabaseAdmin } = require('../lib/supabase-server')
      supabaseAdmin.rpc.mockResolvedValue({ 
        data: null, 
        error: { message: 'Database error' } 
      })

      await expect(getServiceAvailability({
        date: mockDate,
        serviceIds: mockServiceIds
      })).rejects.toThrow('Failed to fetch availability data')
    })

    it('should validate input parameters', async () => {
      await expect(getServiceAvailability({
        date: 'invalid-date',
        serviceIds: mockServiceIds
      })).rejects.toThrow('Invalid date format')

      await expect(getServiceAvailability({
        date: mockDate,
        serviceIds: []
      })).rejects.toThrow('At least one service ID is required')
    })
  })

  describe('canBookServices', () => {
    it('should return true when all services are available', async () => {
      const { supabaseAdmin } = require('../lib/supabase-server')
      supabaseAdmin.rpc.mockResolvedValue({ data: true, error: null })
      supabaseAdmin.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { name: 'Test Service' },
              error: null
            })
          }))
        }))
      })

      const result = await canBookServices(mockServiceIds, mockDate, mockTime)

      expect(result.canBook).toBe(true)
      expect(result.conflicts).toHaveLength(0)
    })

    it('should return false with conflicts when services are unavailable', async () => {
      const { supabaseAdmin } = require('../lib/supabase-server')
      
      // Mock first service as unavailable, second as available
      supabaseAdmin.rpc
        .mockResolvedValueOnce({ data: false, error: null }) // service-1 unavailable
        .mockResolvedValueOnce({ data: true, error: null })  // service-2 available

      supabaseAdmin.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { name: 'Unavailable Service' },
              error: null
            })
          }))
        }))
      })

      const result = await canBookServices(mockServiceIds, mockDate, mockTime)

      expect(result.canBook).toBe(false)
      expect(result.conflicts).toContain('Unavailable Service')
    })

    it('should handle quantities parameter', async () => {
      const { supabaseAdmin } = require('../lib/supabase-server')
      supabaseAdmin.rpc.mockResolvedValue({ data: true, error: null })

      await canBookServices(mockServiceIds, mockDate, mockTime, [2, 1])

      expect(supabaseAdmin.rpc).toHaveBeenCalledWith('can_book_service', {
        p_service_id: 'service-1',
        p_date: mockDate,
        p_time: mockTime,
        p_quantity: 2
      })
    })
  })

  describe('getAvailableTimeSlots', () => {
    it('should return only time slots where all services are available', async () => {
      const mockAvailabilityData = [
        {
          service_id: 'service-1',
          service_name: 'Service 1',
          time_slot: '09:00',
          max_capacity: 2,
          current_bookings: 1,
          available_slots: 1,
          is_available: true
        },
        {
          service_id: 'service-2',
          service_name: 'Service 2',
          time_slot: '09:00',
          max_capacity: 1,
          current_bookings: 0,
          available_slots: 1,
          is_available: true
        },
        {
          service_id: 'service-1',
          service_name: 'Service 1',
          time_slot: '10:00',
          max_capacity: 2,
          current_bookings: 2,
          available_slots: 0,
          is_available: false
        },
        {
          service_id: 'service-2',
          service_name: 'Service 2',
          time_slot: '10:00',
          max_capacity: 1,
          current_bookings: 0,
          available_slots: 1,
          is_available: true
        }
      ]

      const { supabaseAdmin } = require('../lib/supabase-server')
      supabaseAdmin.rpc.mockResolvedValue({ data: mockAvailabilityData, error: null })

      const result = await getAvailableTimeSlots(mockServiceIds, mockDate)

      expect(result).toEqual(['09:00']) // Only 09:00 has both services available
    })

    it('should return empty array when no slots are available', async () => {
      const { supabaseAdmin } = require('../lib/supabase-server')
      supabaseAdmin.rpc.mockResolvedValue({ data: [], error: null })

      const result = await getAvailableTimeSlots(mockServiceIds, mockDate)

      expect(result).toEqual([])
    })
  })

  describe('updateServiceCapacity', () => {
    it('should update service capacity successfully', async () => {
      const { supabaseAdmin } = require('../lib/supabase-server')
      supabaseAdmin.from.mockReturnValue({
        update: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({ error: null })
        })),
        upsert: jest.fn().mockResolvedValue({ error: null }),
        delete: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({ error: null })
        }))
      })

      const result = await updateServiceCapacity(
        'service-1',
        5,
        '09:00',
        '17:00',
        30
      )

      expect(result.success).toBe(true)
      expect(result.message).toBe('Service capacity updated successfully')
    })

    it('should handle database errors during update', async () => {
      const { supabaseAdmin } = require('../lib/supabase-server')
      supabaseAdmin.from.mockReturnValue({
        update: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({ 
            error: { message: 'Update failed' } 
          })
        }))
      })

      const result = await updateServiceCapacity('service-1', 5)

      expect(result.success).toBe(false)
      expect(result.message).toBe('Failed to update service capacity')
    })
  })

  describe('setCapacityOverride', () => {
    it('should create capacity override successfully', async () => {
      const { supabaseAdmin } = require('../lib/supabase-server')
      supabaseAdmin.from.mockReturnValue({
        upsert: jest.fn().mockResolvedValue({ error: null }),
        delete: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn().mockResolvedValue({ error: null })
          }))
        }))
      })

      const result = await setCapacityOverride(
        'service-1',
        '2024-01-15',
        '10:00',
        3,
        'Special event'
      )

      expect(result.success).toBe(true)
      expect(result.message).toBe('Capacity override set successfully')
    })

    it('should handle database errors during override creation', async () => {
      const { supabaseAdmin } = require('../lib/supabase-server')
      supabaseAdmin.from.mockReturnValue({
        upsert: jest.fn().mockResolvedValue({ 
          error: { message: 'Override failed' } 
        })
      })

      const result = await setCapacityOverride(
        'service-1',
        '2024-01-15',
        '10:00',
        3
      )

      expect(result.success).toBe(false)
      expect(result.message).toBe('Failed to set capacity override')
    })
  })
})

describe('Edge Cases and Error Handling', () => {
  it('should handle concurrent booking attempts', async () => {
    // This would test race condition handling
    // In a real implementation, this would involve multiple concurrent requests
    const { supabaseAdmin } = require('../lib/supabase-server')
    
    // Simulate race condition where availability changes between check and booking
    supabaseAdmin.rpc
      .mockResolvedValueOnce({ data: true, error: null })  // First check: available
      .mockResolvedValueOnce({ data: false, error: null }) // Second check: unavailable

    const firstCheck = await canBookServices(['service-1'], '2024-01-15', '10:00')
    const secondCheck = await canBookServices(['service-1'], '2024-01-15', '10:00')

    expect(firstCheck.canBook).toBe(true)
    expect(secondCheck.canBook).toBe(false)
  })

  it('should handle invalid service IDs gracefully', async () => {
    const { supabaseAdmin } = require('../lib/supabase-server')
    supabaseAdmin.rpc.mockResolvedValue({ data: [], error: null })

    const result = await getServiceAvailability({
      date: '2024-01-15',
      serviceIds: ['invalid-service-id']
    })

    expect(result.services).toHaveLength(0)
  })

  it('should handle network timeouts', async () => {
    const { supabaseAdmin } = require('../lib/supabase-server')
    supabaseAdmin.rpc.mockRejectedValue(new Error('Network timeout'))

    await expect(getServiceAvailability({
      date: '2024-01-15',
      serviceIds: ['service-1']
    })).rejects.toThrow('Network timeout')
  })
})

describe('Performance Tests', () => {
  it('should handle large numbers of services efficiently', async () => {
    const manyServiceIds = Array.from({ length: 100 }, (_, i) => `service-${i}`)
    const mockData = manyServiceIds.flatMap(serviceId => 
      Array.from({ length: 20 }, (_, i) => ({
        service_id: serviceId,
        service_name: `Service ${serviceId}`,
        time_slot: `${9 + Math.floor(i / 2)}:${(i % 2) * 30}`,
        max_capacity: 2,
        current_bookings: Math.floor(Math.random() * 3),
        available_slots: Math.floor(Math.random() * 3),
        is_available: Math.random() > 0.3
      }))
    )

    const { supabaseAdmin } = require('../lib/supabase-server')
    supabaseAdmin.rpc.mockResolvedValue({ data: mockData, error: null })

    const startTime = Date.now()
    const result = await getServiceAvailability({
      date: '2024-01-15',
      serviceIds: manyServiceIds
    })
    const endTime = Date.now()

    expect(result.services).toHaveLength(100)
    expect(endTime - startTime).toBeLessThan(1000) // Should complete within 1 second
  })

  it('should handle multiple concurrent availability requests', async () => {
    const { supabaseAdmin } = require('../lib/supabase-server')
    supabaseAdmin.rpc.mockResolvedValue({ data: [], error: null })

    const requests = Array.from({ length: 10 }, () => 
      getServiceAvailability({
        date: '2024-01-15',
        serviceIds: ['service-1']
      })
    )

    const startTime = Date.now()
    const results = await Promise.all(requests)
    const endTime = Date.now()

    expect(results).toHaveLength(10)
    expect(endTime - startTime).toBeLessThan(2000) // Should complete within 2 seconds
  })
})

