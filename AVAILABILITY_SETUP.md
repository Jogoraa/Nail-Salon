# Availability System Setup Guide

## Current Issue
The booking system was failing because it was trying to call database functions (`get_service_availability`, `can_book_service`) that don't exist in your current database.

## Immediate Fix (Recommended)
I've updated the code to work with your existing database schema. The system now:
- Generates time slots dynamically (9:00 AM to 6:00 PM, 30-minute intervals)
- Checks availability by counting existing appointments
- Prevents double-booking through application-level checks
- Works immediately without database changes

## Database Setup Options

### Option 1: Basic Setup (Recommended for now)
Run this SQL script to add basic capacity management:

```sql
-- Execute this in your Supabase SQL editor or via psql
\i scripts/08-basic-availability-setup.sql
```

This adds:
- `max_bookings_per_slot` column to services table
- Simple availability checking functions
- Default capacity of 1 booking per service per time slot

### Option 2: Enhanced Setup (Future upgrade)
When you're ready for advanced features, run these in order:

```sql
\i scripts/06-enhanced-capacity-schema.sql
\i scripts/07-transactional-booking.sql
```

This adds:
- Service schedules and capacity overrides
- Waitlist management
- Availability caching
- Transactional booking with advisory locks

## How to Apply the Fix

### Via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the content of `scripts/08-basic-availability-setup.sql`
4. Click "Run" to execute

### Via Command Line
If you have Supabase CLI installed:

```bash
# Navigate to your project directory
cd /path/to/your/project

# Apply the basic setup
supabase db execute --file scripts/08-basic-availability-setup.sql
```

### Via Direct Database Connection
```bash
# Replace with your actual database connection string
psql "postgresql://username:password@host:port/database" -f scripts/08-basic-availability-setup.sql
```

## How the System Works Now

### Availability Calculation
1. **Time Slot Generation**: Creates 30-minute slots from 9:00 AM to 6:00 PM
2. **Booking Count**: Counts existing appointments for each service at each time
3. **Capacity Check**: Compares current bookings against `max_bookings_per_slot`
4. **Real-time Updates**: Refreshes availability after each booking

### Concurrency Protection
- **Double-check**: Verifies availability again just before creating the appointment
- **Rollback**: If linking services fails, the appointment is automatically deleted
- **Conflict Detection**: Shows alternative time suggestions when conflicts occur

## Testing the System

### 1. Basic Functionality
- Visit `/improved-booking`
- Select services and date
- Choose an available time slot
- Complete the booking form

### 2. Concurrency Testing
- Open multiple browser tabs/windows
- Try to book the same service at the same time
- Verify only one booking succeeds
- Check that others receive conflict messages with alternatives

### 3. Admin Verification
- Check `/admin` page for new appointments
- Verify appointment_services table has correct links
- Confirm no duplicate bookings exist

## Troubleshooting

### Common Issues

#### "Function not found" errors
- Ensure you've run the SQL setup script
- Check that the functions exist in your database schema
- Verify you're connected to the correct database

#### Availability not updating
- Check browser console for errors
- Verify the `appointments` and `appointment_services` tables exist
- Ensure services have `max_bookings_per_slot` values set

#### Booking conflicts not detected
- Verify the `canBookServices` function is working
- Check appointment status filtering (cancelled appointments should be excluded)
- Ensure the booking count logic is correct

### Debug Steps
1. Check browser console for JavaScript errors
2. Verify database functions exist: `\df` in psql
3. Test availability query manually in SQL editor
4. Check appointment data structure matches expectations

## Performance Considerations

### Current Implementation
- **Pros**: Simple, works immediately, easy to debug
- **Cons**: No caching, queries run on each request

### Enhanced Implementation (Future)
- **Pros**: Cached availability, better performance, advanced features
- **Cons**: More complex setup, requires additional tables

## Next Steps

### Immediate (This Week)
1. Apply the basic setup script
2. Test the booking flow
3. Verify concurrency protection works

### Short Term (Next 2 Weeks)
1. Monitor system performance
2. Collect user feedback
3. Plan enhanced schema migration

### Long Term (Next Month)
1. Implement enhanced capacity management
2. Add waitlist functionality
3. Implement availability caching
4. Add admin capacity override tools

## Support

If you encounter issues:
1. Check this guide first
2. Review the browser console for errors
3. Verify database schema matches expectations
4. Test with simple queries in SQL editor

## Files Modified

- `lib/availability.ts` - Updated to work with existing schema
- `lib/enhanced-actions.ts` - Simplified booking logic
- `components/service-first-booking-form.tsx` - Added conflict handling
- `components/enhanced-booking-form.tsx` - Added conflict handling
- `scripts/08-basic-availability-setup.sql` - Basic database setup

The system should now work immediately with your existing database structure!
