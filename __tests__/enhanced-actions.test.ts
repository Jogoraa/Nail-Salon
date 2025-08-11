/**
 * Tests for enhanced booking actions with capacity checking
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { 
  bookAppointmentWithCapacityCheck,
  getBookingAvailability,
  checkTimeSlotAvailability,
  getSuggestedTimeSlots
} from '../lib/enhanced-actions'

// Mock dependencies
jest.mock('../lib/supabase-server')
jest.mock('../lib/availability')
jest.mock('../lib/email')
jest.mock('../lib/createCalcomBooking')

describe('Enhanced Booking Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('bookAppointmentWithCapacityCheck', () => {
    const createMockFormData = (data: Record<string, string | string[]>) => {
      const formData = new FormData()
      
      Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => formData.append(key, v))
        } else {
          formData.set(key, value)
        }
      })
      
      return formData
    }

    it('should successfully book appointment when capacity is available', async () => {
      const mockFormData = createMockFormData({
        'serviceIds[]': ['service-1', 'service-2'],
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-1234',
        appointmentDate: '2024-01-15',
        appointmentTime: '10:00',
        notes: 'Test booking'
      })

      // Mock availability check to return available
      const { canBookServices } = require('../lib/availability')
      canBookServices.mockResolvedValue({ canBook: true, conflicts: [] })

      // Mock database operations
      const { supabaseAdmin } = require('../lib/supabase-server')
      supabaseAdmin.from.mockReturnValue({
        select: jest.fn(() => ({
          in: jest.fn(() => Promise.resolve({
            data: [
              { id: 'service-1', name: 'Manicure', price: 50, duration: 60 },
              { id: 'service-2', name: 'Pedicure', price: 40, duration: 45 }
            ],
            error: null
          })),
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: null,
              error: { code: 'PGRST116' } // Customer not found
            }))
          }))
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: { id: 'customer-1', email: 'john@example.com' },
              error: null
            }))
          }))
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null }))
        })),
        delete: jest.fn(() => ({
          in: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => Promise.resolve({ error: null }))
            }))
          }))
        }))
      })

      // Mock appointment creation
      supabaseAdmin.from.mockReturnValueOnce({
        insert: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({
            data: [{ id: 'appointment-1', customer_id: 'customer-1' }],
            error: null
          }))
        }))
      })

      // Mock service linking
      supabaseAdmin.from.mockReturnValue({
        insert: jest.fn(() => Promise.resolve({ error: null }))
      })

      const result = await bookAppointmentWithCapacityCheck(mockFormData)

      expect(result.success).toBe(true)
      expect(result.message).toContain('Appointment booked successfully')
      expect(result.appointmentId).toBe('appointment-1')
      expect(canBookServices).toHaveBeenCalledWith(
        ['service-1', 'service-2'],
        '2024-01-15',
        '10:00'
      )
    })

    it('should reject booking when capacity is not available', async () => {
      const mockFormData = createMockFormData({
        'serviceIds[]': ['service-1'],
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        appointmentDate: '2024-01-15',
        appointmentTime: '10:00'
      })

      // Mock availability check to return unavailable
      const { canBookServices } = require('../lib/availability')
      canBookServices.mockResolvedValue({ 
        canBook: false, 
        conflicts: ['Manicure'] 
      })

      const result = await bookAppointmentWithCapacityCheck(mockFormData)

      expect(result.success).toBe(false)
      expect(result.message).toContain('fully booked')
      expect(result.conflicts).toEqual(['Manicure'])
    })

    it('should validate required fields', async () => {
      const mockFormData = createMockFormData({
        firstName: 'John'
        // Missing required fields
      })

      const result = await bookAppointmentWithCapacityCheck(mockFormData)

      expect(result.success).toBe(false)
      expect(result.message).toBe('Please fill in all required fields.')
    })

    it('should validate email format', async () => {
      const mockFormData = createMockFormData({
        'serviceIds[]': ['service-1'],
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        appointmentDate: '2024-01-15',
        appointmentTime: '10:00'
      })

      const result = await bookAppointmentWithCapacityCheck(mockFormData)

      expect(result.success).toBe(false)
      expect(result.message).toBe('Please enter a valid email address.')
    })

    it('should handle race conditions with final availability check', async () => {
      const mockFormData = createMockFormData({
        'serviceIds[]': ['service-1'],
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        appointmentDate: '2024-01-15',
        appointmentTime: '10:00'
      })

      const { canBookServices } = require('../lib/availability')
      // First check passes, final check fails (race condition)
      canBookServices
        .mockResolvedValueOnce({ canBook: true, conflicts: [] })
        .mockResolvedValueOnce({ canBook: false, conflicts: ['Service 1'] })

      const { supabaseAdmin } = require('../lib/supabase-server')
      supabaseAdmin.from.mockReturnValue({
        select: jest.fn(() => ({
          in: jest.fn(() => Promise.resolve({
            data: [{ id: 'service-1', name: 'Service 1' }],
            error: null
          })),
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: { id: 'customer-1' },
              error: null
            }))
          }))
        }))
      })

      const result = await bookAppointmentWithCapacityCheck(mockFormData)

      expect(result.success).toBe(false)
      expect(result.message).toContain('just booked by another customer')
    })
  })

  describe('getBookingAvailability', () => {
    it('should return formatted time slots with availability', async () => {
      const { getServiceAvailability } = require('../lib/availability')
      getServiceAvailability.mockResolvedValue({
        date: '2024-01-15',
        services: [
          {
            serviceId: 'service-1',
            serviceName: 'Manicure',
            timeSlots: [
              {
                time: '09:00',
                maxCapacity: 2,
                currentBookings: 1,
                availableSlots: 1,
                isAvailable: true
              },
              {
                time: '10:00',
                maxCapacity: 2,
                currentBookings: 2,
                availableSlots: 0,
                isAvailable: false
              }
            ]
          }
        ]
      })

      const result = await getBookingAvailability('2024-01-15', ['service-1'])

      expect(result.timeSlots).toHaveLength(2)
      expect(result.timeSlots[0]).toMatchObject({
        time: '09:00',
        label: '9:00 AM',
        isAvailable: true
      })
      expect(result.timeSlots[1]).toMatchObject({
        time: '10:00',
        label: '10:00 AM',
        isAvailable: false
      })
    })

    it('should handle multiple services and find common availability', async () => {
      const { getServiceAvailability } = require('../lib/availability')
      getServiceAvailability.mockResolvedValue({
        date: '2024-01-15',
        services: [
          {
            serviceId: 'service-1',
            serviceName: 'Manicure',
            timeSlots: [
              { time: '09:00', isAvailable: true },
              { time: '10:00', isAvailable: false }
            ]
          },
          {
            serviceId: 'service-2',
            serviceName: 'Pedicure',
            timeSlots: [
              { time: '09:00', isAvailable: true },
              { time: '10:00', isAvailable: true }
            ]
          }
        ]
      })

      const result = await getBookingAvailability('2024-01-15', ['service-1', 'service-2'])

      // Only 09:00 should be available for both services
      expect(result.timeSlots[0].isAvailable).toBe(true)  // 09:00
      expect(result.timeSlots[1].isAvailable).toBe(false) // 10:00
    })

    it('should handle errors gracefully', async () => {
      const { getServiceAvailability } = require('../lib/availability')
      getServiceAvailability.mockRejectedValue(new Error('Database error'))

      const result = await getBookingAvailability('2024-01-15', ['service-1'])

      expect(result.timeSlots).toEqual([])
      expect(result.error).toBe('Failed to fetch availability')
    })

    it('should validate input parameters', async () => {
      const result1 = await getBookingAvailability('', ['service-1'])
      expect(result1.error).toBe('Date and service selection required')

      const result2 = await getBookingAvailability('2024-01-15', [])
      expect(result2.error).toBe('Date and service selection required')
    })
  })

  describe('checkTimeSlotAvailability', () => {
    it('should return availability status for specific time slot', async () => {
      const { canBookServices } = require('../lib/availability')
      canBookServices.mockResolvedValue({ canBook: true, conflicts: [] })

      const result = await checkTimeSlotAvailability(
        ['service-1'],
        '2024-01-15',
        '10:00'
      )

      expect(result.available).toBe(true)
      expect(result.message).toBeUndefined()
    })

    it('should return conflicts when time slot is unavailable', async () => {
      const { canBookServices } = require('../lib/availability')
      canBookServices.mockResolvedValue({ 
        canBook: false, 
        conflicts: ['Manicure', 'Pedicure'] 
      })

      const result = await checkTimeSlotAvailability(
        ['service-1', 'service-2'],
        '2024-01-15',
        '10:00'
      )

      expect(result.available).toBe(false)
      expect(result.message).toContain('Manicure, Pedicure')
      expect(result.details).toEqual(['Manicure', 'Pedicure'])
    })

    it('should handle errors gracefully', async () => {
      const { canBookServices } = require('../lib/availability')
      canBookServices.mockRejectedValue(new Error('Network error'))

      const result = await checkTimeSlotAvailability(
        ['service-1'],
        '2024-01-15',
        '10:00'
      )

      expect(result.available).toBe(false)
      expect(result.message).toBe('Unable to check availability at this time')
    })
  })

  describe('getSuggestedTimeSlots', () => {
    it('should return alternative time slots sorted by proximity', async () => {
      const { getServiceAvailability } = require('../lib/availability')
      getServiceAvailability.mockResolvedValue({
        date: '2024-01-15',
        services: [
          {
            serviceId: 'service-1',
            serviceName: 'Manicure',
            timeSlots: [
              { time: '09:00', isAvailable: true },
              { time: '09:30', isAvailable: true },
              { time: '10:00', isAvailable: false }, // Preferred time
              { time: '10:30', isAvailable: true },
              { time: '11:00', isAvailable: true },
              { time: '14:00', isAvailable: true }
            ]
          }
        ]
      })

      const result = await getSuggestedTimeSlots(
        ['service-1'],
        '2024-01-15',
        '10:00' // Preferred time
      )

      // Should return alternatives sorted by proximity to 10:00
      expect(result).toEqual(['09:30', '10:30', '09:00', '11:00', '14:00'])
      expect(result).toHaveLength(5) // Maximum 5 suggestions
    })

    it('should exclude the preferred time from suggestions', async () => {
      const { getServiceAvailability } = require('../lib/availability')
      getServiceAvailability.mockResolvedValue({
        date: '2024-01-15',
        services: [
          {
            serviceId: 'service-1',
            serviceName: 'Manicure',
            timeSlots: [
              { time: '09:00', isAvailable: true },
              { time: '10:00', isAvailable: true } // Preferred time
            ]
          }
        ]
      })

      const result = await getSuggestedTimeSlots(
        ['service-1'],
        '2024-01-15',
        '10:00'
      )

      expect(result).toEqual(['09:00'])
      expect(result).not.toContain('10:00')
    })

    it('should handle multiple services and find common availability', async () => {
      const { getServiceAvailability } = require('../lib/availability')
      getServiceAvailability.mockResolvedValue({
        date: '2024-01-15',
        services: [
          {
            serviceId: 'service-1',
            serviceName: 'Manicure',
            timeSlots: [
              { time: '09:00', isAvailable: true },
              { time: '10:00', isAvailable: false },
              { time: '11:00', isAvailable: true }
            ]
          },
          {
            serviceId: 'service-2',
            serviceName: 'Pedicure',
            timeSlots: [
              { time: '09:00', isAvailable: false },
              { time: '10:00', isAvailable: false },
              { time: '11:00', isAvailable: true }
            ]
          }
        ]
      })

      const result = await getSuggestedTimeSlots(
        ['service-1', 'service-2'],
        '2024-01-15',
        '10:00'
      )

      // Only 11:00 is available for both services
      expect(result).toEqual(['11:00'])
    })

    it('should return empty array when no alternatives are available', async () => {
      const { getServiceAvailability } = require('../lib/availability')
      getServiceAvailability.mockResolvedValue({
        date: '2024-01-15',
        services: [
          {
            serviceId: 'service-1',
            serviceName: 'Manicure',
            timeSlots: [
              { time: '10:00', isAvailable: false } // Only the preferred time
            ]
          }
        ]
      })

      const result = await getSuggestedTimeSlots(
        ['service-1'],
        '2024-01-15',
        '10:00'
      )

      expect(result).toEqual([])
    })

    it('should handle errors gracefully', async () => {
      const { getServiceAvailability } = require('../lib/availability')
      getServiceAvailability.mockRejectedValue(new Error('Database error'))

      const result = await getSuggestedTimeSlots(
        ['service-1'],
        '2024-01-15',
        '10:00'
      )

      expect(result).toEqual([])
    })
  })
})

describe('Integration Tests', () => {
  it('should handle complete booking flow with capacity checking', async () => {
    // This would test the entire flow from availability check to booking confirmation
    const { canBookServices, getServiceAvailability } = require('../lib/availability')
    const { supabaseAdmin } = require('../lib/supabase-server')

    // Mock availability check
    canBookServices.mockResolvedValue({ canBook: true, conflicts: [] })

    // Mock database operations for successful booking
    supabaseAdmin.from.mockReturnValue({
      select: jest.fn(() => ({
        in: jest.fn(() => Promise.resolve({
          data: [{ id: 'service-1', name: 'Test Service', price: 50 }],
          error: null
        })),
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: { id: 'customer-1' },
            error: null
          }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({
          data: [{ id: 'appointment-1' }],
          error: null
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null }))
      })),
      delete: jest.fn(() => ({
        in: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ error: null }))
          }))
        }))
      }))
    })

    const mockFormData = new FormData()
    mockFormData.append('serviceIds[]', 'service-1')
    mockFormData.set('firstName', 'John')
    mockFormData.set('lastName', 'Doe')
    mockFormData.set('email', 'john@example.com')
    mockFormData.set('appointmentDate', '2024-01-15')
    mockFormData.set('appointmentTime', '10:00')

    const result = await bookAppointmentWithCapacityCheck(mockFormData)

    expect(result.success).toBe(true)
    expect(canBookServices).toHaveBeenCalledTimes(2) // Initial check + final check
  })
})

