# Hami Nail Salon - Advanced Booking Management System

A sophisticated Next.js application for nail salon booking management with real-time capacity control, multi-service appointments, and comprehensive admin dashboard.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [Component Documentation](#component-documentation)
- [Capacity Management System](#capacity-management-system)
- [Admin Dashboard](#admin-dashboard)
- [Deployment](#deployment)
- [Development](#development)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview

Hami Nail Salon is a production-ready booking management system designed specifically for nail salons and beauty service providers. The application combines a beautiful customer-facing website with a powerful admin dashboard, featuring advanced capacity management, real-time availability checking, and seamless integration with external calendar systems.

The system addresses the common challenges faced by service-based businesses: overbooking, capacity management, customer communication, and operational efficiency. Built with modern web technologies, it provides a scalable solution that can handle high-concurrency booking scenarios while maintaining data consistency and user experience quality.

## Features

### Customer-Facing Features
- **Responsive Website**: Beautiful, mobile-first design showcasing services and gallery
- **Multi-Service Booking**: Customers can book multiple services in a single appointment
- **Real-Time Availability**: Live capacity checking with visual availability indicators
- **Smart Time Slot Selection**: Dynamic disabling of unavailable time slots
- **Service Gallery**: Visual showcase of nail art and services
- **Contact Forms**: Multiple contact options with service-specific inquiries
- **Booking Confirmation**: Automated email confirmations and notifications

### Admin Features
- **Comprehensive Dashboard**: Real-time overview of appointments and messages
- **Capacity Management**: Configure service capacity limits and operating hours
- **Appointment Management**: View, edit, and manage all bookings
- **Service Configuration**: Manage services, pricing, and availability
- **Customer Database**: Complete customer relationship management
- **Analytics Dashboard**: Booking patterns and capacity utilization insights
- **Waitlist Management**: Handle fully booked time slots with customer waitlists

### Technical Features
- **Real-Time Updates**: WebSocket-based live updates for availability
- **Overbooking Prevention**: Sophisticated capacity checking algorithms
- **Cal.com Integration**: Seamless calendar synchronization
- **Email Automation**: Automated booking confirmations and notifications
- **Row-Level Security**: Database-level security with Supabase RLS
- **API-First Design**: RESTful APIs for all operations
- **Performance Optimization**: Caching and query optimization
- **Mobile Responsive**: Optimized for all device sizes

## Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router for server-side rendering
- **React 19**: Latest React features with concurrent rendering
- **TypeScript**: Type-safe development with full IntelliSense support
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Radix UI**: Accessible component primitives for consistent design
- **Lucide React**: Beautiful icon library with consistent styling

### Backend
- **Supabase**: PostgreSQL database with real-time subscriptions
- **Supabase Auth**: Authentication and authorization system
- **Server Actions**: Next.js server-side form handling and API operations
- **Row Level Security**: Database-level security policies

### External Integrations
- **Cal.com API**: Calendar booking and scheduling integration
- **Resend**: Email delivery service for notifications
- **Vercel**: Deployment and hosting platform (recommended)

### Development Tools
- **ESLint**: Code linting and quality enforcement
- **Prettier**: Code formatting and style consistency
- **TypeScript**: Static type checking and development experience
- **Git**: Version control and collaboration

## Architecture

The application follows a modern, scalable architecture pattern with clear separation of concerns:

### Frontend Architecture
```
app/
├── (routes)/           # App Router pages
├── api/               # API route handlers
├── globals.css        # Global styles
└── layout.tsx         # Root layout

components/
├── ui/                # Reusable UI components
├── booking-form.tsx   # Booking interface
├── admin-dashboard/   # Admin components
└── [feature]/         # Feature-specific components

lib/
├── actions.ts         # Server actions
├── supabase.ts        # Database client
├── availability.ts    # Capacity management
└── utils.ts           # Utility functions
```

### Database Architecture
The database schema is designed for scalability and data integrity:

- **Services**: Core service definitions with capacity settings
- **Customers**: Customer information and contact details
- **Appointments**: Booking records with status tracking
- **Appointment Services**: Many-to-many relationship for multi-service bookings
- **Capacity Management**: Advanced tables for availability control
- **Admin Users**: Role-based access control

### API Architecture
RESTful API design with consistent patterns:

- **GET /api/availability**: Real-time availability checking
- **POST /api/admin/capacity**: Capacity management operations
- **Server Actions**: Form submissions and data mutations
- **Real-time Subscriptions**: Live updates via Supabase

## Installation

### Prerequisites
Ensure you have the following installed on your development machine:

- **Node.js 18+**: JavaScript runtime environment
- **npm, yarn, or pnpm**: Package manager (pnpm recommended)
- **Git**: Version control system
- **Supabase Account**: Database and authentication provider

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd nail_saloon_with_backend-branch_two
```

### Step 2: Install Dependencies
```bash
# Using pnpm (recommended)
pnpm install

# Using npm
npm install

# Using yarn
yarn install
```

### Step 3: Environment Configuration
Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Cal.com Integration (Optional)
CALCOM_API_KEY=your_calcom_api_key
CALCOM_API_URL=https://api.cal.com/v1

# Email Configuration (Optional)
RESEND_API_KEY=your_resend_api_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4: Database Setup
Run the database setup scripts in order:

```bash
# Connect to your Supabase project and run these SQL scripts:
# 1. scripts/01-create-tables.sql
# 2. scripts/02-seed-data.sql
# 3. scripts/03-row-level-security-fixed.sql
# 4. scripts/04-fix-rls-policies.sql
# 5. scripts/06-enhanced-capacity-schema.sql
```

### Step 5: Start Development Server
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## Configuration

### Supabase Setup

1. **Create a Supabase Project**
   - Visit [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and API keys

2. **Database Configuration**
   - Run the provided SQL scripts in the Supabase SQL editor
   - Enable Row Level Security (RLS) on all tables
   - Configure authentication providers as needed

3. **Authentication Setup**
   - Configure email authentication
   - Set up redirect URLs for your domain
   - Add admin users to the `admin_users` table

### Cal.com Integration (Optional)

1. **Create Cal.com Account**
   - Sign up at [cal.com](https://cal.com)
   - Generate an API key from your account settings

2. **Configure Event Types**
   - Create event types for each service
   - Note the event type IDs for service configuration

3. **Update Service Records**
   - Add `calcom_event_type_id` to your services
   - Configure booking duration and availability

### Email Configuration (Optional)

1. **Resend Setup**
   - Create account at [resend.com](https://resend.com)
   - Generate API key
   - Verify your sending domain

2. **Email Templates**
   - Customize email templates in `lib/email.ts`
   - Test email delivery in development

## Database Setup

### Core Tables

The application uses several interconnected tables to manage bookings and capacity:

#### Services Table
```sql
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration INTEGER NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  max_bookings_per_slot INTEGER DEFAULT 1,
  default_start_time TIME DEFAULT '09:00',
  default_end_time TIME DEFAULT '18:00',
  slot_duration INTEGER DEFAULT 30,
  buffer_time INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Appointments and Capacity Management
The system includes advanced tables for capacity management:

- **service_schedules**: Date-specific capacity overrides
- **capacity_overrides**: Time-specific capacity adjustments
- **waitlist_entries**: Customer waitlist management
- **availability_cache**: Performance optimization cache

### Database Functions

The system includes several PostgreSQL functions for efficient capacity checking:

- `get_available_slots()`: Calculate available capacity for a service/time
- `can_book_service()`: Check if a booking is possible
- `get_service_availability()`: Comprehensive availability data

### Indexes and Performance

Optimized indexes ensure fast query performance:

```sql
CREATE INDEX idx_appointments_date_time ON appointments(appointment_date, appointment_time);
CREATE INDEX idx_service_schedules_service_date ON service_schedules(service_id, date);
CREATE INDEX idx_availability_cache_service_date_time ON availability_cache(service_id, cache_date, cache_time);
```

## API Documentation

### Availability API

#### GET /api/availability
Retrieve real-time availability for services on a specific date.

**Parameters:**
- `date` (required): Date in YYYY-MM-DD format
- `services` (required): Comma-separated service IDs
- `startTime` (optional): Start time in HH:MM format (default: 09:00)
- `endTime` (optional): End time in HH:MM format (default: 18:00)
- `slotDuration` (optional): Slot duration in minutes (default: 30)

**Response:**
```json
{
  "date": "2024-01-15",
  "services": [
    {
      "serviceId": "uuid",
      "serviceName": "Manicure",
      "timeSlots": [
        {
          "time": "09:00",
          "maxCapacity": 2,
          "currentBookings": 1,
          "availableSlots": 1,
          "isAvailable": true
        }
      ]
    }
  ],
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

#### POST /api/availability
Check booking availability or get available time slots.

**Request Body:**
```json
{
  "action": "check_booking",
  "serviceIds": ["uuid1", "uuid2"],
  "date": "2024-01-15",
  "time": "10:00",
  "quantities": [1, 1]
}
```

**Response:**
```json
{
  "canBook": true,
  "conflicts": []
}
```

### Admin Capacity API

#### GET /api/admin/capacity
Retrieve capacity configuration for a service.

**Parameters:**
- `serviceId` (required): Service UUID
- `action` (required): "config" or "waitlist"

#### POST /api/admin/capacity
Update capacity settings or create overrides.

**Actions:**
- `update_capacity`: Update service capacity settings
- `set_override`: Create capacity override for specific date/time
- `add_waitlist`: Add customer to waitlist

### Server Actions

The application uses Next.js Server Actions for form handling:

- `bookAppointmentWithCapacityCheck()`: Enhanced booking with capacity validation
- `getBookingAvailability()`: Real-time availability for booking forms
- `updateServiceCapacity()`: Admin capacity management
- `checkTimeSlotAvailability()`: Validate specific time slots

## Component Documentation

### Enhanced Booking Form

The `EnhancedBookingForm` component provides a sophisticated booking interface with real-time availability checking.

**Features:**
- Multi-service selection with visual feedback
- Real-time availability display
- Dynamic time slot disabling
- Capacity-aware booking validation
- Loading states and error handling

**Usage:**
```tsx
import EnhancedBookingForm from '@/components/enhanced-booking-form'

<EnhancedBookingForm 
  services={services} 
  preSelectedServiceId="optional-uuid" 
/>
```

### Admin Capacity Manager

The `AdminCapacityManager` component provides comprehensive capacity management for administrators.

**Features:**
- Service capacity configuration
- Operating hours management
- Capacity overrides for special dates
- Waitlist management
- Analytics dashboard

**Usage:**
```tsx
import AdminCapacityManager from '@/components/admin-capacity-manager'

<AdminCapacityManager services={services} />
```

### Multi-Select Dropdown

The `MultiSelectDropdown` component allows customers to select multiple services with detailed information display.

**Features:**
- Service information display (price, duration)
- Visual selection feedback
- Responsive design
- Accessibility support

## Capacity Management System

The capacity management system is the core innovation of this application, providing sophisticated overbooking prevention and resource optimization.

### How It Works

1. **Service Configuration**: Each service has configurable capacity limits (`max_bookings_per_slot`)
2. **Real-Time Checking**: Before any booking, the system validates availability
3. **Concurrent Protection**: Database-level constraints prevent race conditions
4. **Override System**: Administrators can set special capacity rules for specific dates/times
5. **Waitlist Management**: Customers can join waitlists for fully booked slots

### Capacity Checking Algorithm

The system uses a multi-layered approach to determine availability:

1. **Check Overrides**: Look for date/time-specific capacity overrides
2. **Check Schedules**: Look for date-specific capacity adjustments
3. **Default Capacity**: Fall back to service default capacity
4. **Count Bookings**: Count existing bookings for the time slot
5. **Calculate Availability**: Determine remaining capacity

### Performance Optimization

- **Database Functions**: Complex calculations performed at database level
- **Caching Layer**: Availability results cached for frequently accessed data
- **Optimized Queries**: Efficient indexing and query patterns
- **Real-Time Updates**: WebSocket-based updates minimize unnecessary requests

## Admin Dashboard

The admin dashboard provides comprehensive management capabilities for salon operations.

### Appointment Management

- **Real-Time View**: Live updates of all appointments
- **Status Management**: Update appointment status (pending, confirmed, completed, cancelled)
- **Customer Information**: Complete customer details and history
- **Service Details**: Multi-service appointment support
- **Bulk Operations**: Manage multiple appointments efficiently

### Capacity Configuration

- **Service Settings**: Configure capacity limits for each service
- **Operating Hours**: Set default operating hours and time slots
- **Special Schedules**: Create capacity overrides for holidays or events
- **Waitlist Management**: Handle customer waitlists for popular time slots

### Analytics and Reporting

- **Capacity Utilization**: Track how efficiently time slots are used
- **Peak Hours Analysis**: Identify busy periods for staffing optimization
- **Revenue Insights**: Analyze booking patterns and revenue trends
- **Customer Analytics**: Understand customer behavior and preferences

### Security and Access Control

- **Role-Based Access**: Different permission levels for admin and staff
- **Audit Logging**: Track all administrative actions
- **Secure Authentication**: Supabase Auth with row-level security
- **Data Protection**: GDPR-compliant data handling

## Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

2. **Environment Variables**
   Configure all environment variables in Vercel dashboard

3. **Domain Configuration**
   - Add custom domain in Vercel settings
   - Update Supabase redirect URLs
   - Configure email sending domain

### Alternative Deployment Options

#### Netlify
```bash
# Build command
npm run build

# Publish directory
.next
```

#### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Email delivery tested
- [ ] Cal.com integration verified
- [ ] Performance monitoring setup
- [ ] Backup strategy implemented
- [ ] Error tracking configured

## Development

### Development Workflow

1. **Feature Development**
   ```bash
   # Create feature branch
   git checkout -b feature/new-feature
   
   # Make changes
   # Test locally
   pnpm dev
   
   # Run tests
   pnpm test
   
   # Commit and push
   git commit -m "Add new feature"
   git push origin feature/new-feature
   ```

2. **Code Quality**
   ```bash
   # Lint code
   pnpm lint
   
   # Format code
   pnpm format
   
   # Type check
   pnpm type-check
   ```

### Database Development

1. **Schema Changes**
   - Create migration scripts in `scripts/` directory
   - Test migrations on development database
   - Document schema changes in README

2. **Seed Data**
   - Update seed data scripts for new features
   - Ensure consistent test data across environments

### Component Development

1. **Component Structure**
   ```tsx
   // components/new-component.tsx
   "use client" // if client component
   
   import { useState } from "react"
   import { Button } from "@/components/ui/button"
   
   interface NewComponentProps {
     // Define props
   }
   
   export default function NewComponent({ }: NewComponentProps) {
     // Component logic
     return (
       // JSX
     )
   }
   ```

2. **Styling Guidelines**
   - Use Tailwind CSS classes
   - Follow existing design patterns
   - Ensure mobile responsiveness
   - Test accessibility

### API Development

1. **Server Actions**
   ```typescript
   // lib/actions.ts
   "use server"
   
   export async function newAction(formData: FormData) {
     // Validation
     // Database operations
     // Return result
   }
   ```

2. **API Routes**
   ```typescript
   // app/api/new-endpoint/route.ts
   import { NextRequest, NextResponse } from 'next/server'
   
   export async function GET(request: NextRequest) {
     // Handle GET request
   }
   
   export async function POST(request: NextRequest) {
     // Handle POST request
   }
   ```

## Testing

### Testing Strategy

The application uses a comprehensive testing approach:

1. **Unit Tests**: Individual function and component testing
2. **Integration Tests**: API endpoint and database operation testing
3. **End-to-End Tests**: Complete user journey testing
4. **Performance Tests**: Load testing for high-concurrency scenarios

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test booking-form.test.tsx
```

### Test Examples

#### Component Testing
```typescript
// __tests__/components/booking-form.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import BookingForm from '@/components/booking-form'

describe('BookingForm', () => {
  it('renders service selection', () => {
    render(<BookingForm services={mockServices} />)
    expect(screen.getByText('Select services')).toBeInTheDocument()
  })
  
  it('validates required fields', async () => {
    render(<BookingForm services={mockServices} />)
    fireEvent.click(screen.getByText('Book Appointment'))
    expect(await screen.findByText('Please fill in all required fields')).toBeInTheDocument()
  })
})
```

#### API Testing
```typescript
// __tests__/api/availability.test.ts
import { GET } from '@/app/api/availability/route'

describe('/api/availability', () => {
  it('returns availability data', async () => {
    const request = new Request('http://localhost/api/availability?date=2024-01-15&services=uuid1')
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.date).toBe('2024-01-15')
    expect(data.services).toHaveLength(1)
  })
})
```

### Performance Testing

```bash
# Load testing with Artillery
npm install -g artillery
artillery run load-test.yml

# Database performance testing
npm run test:db-performance
```

## Troubleshooting

### Common Issues

#### Database Connection Issues
```
Error: Failed to connect to Supabase
```

**Solution:**
1. Verify environment variables are correct
2. Check Supabase project status
3. Ensure database is not paused
4. Verify network connectivity

#### Capacity Checking Errors
```
Error: Failed to check booking availability
```

**Solution:**
1. Check database functions are installed
2. Verify service has capacity configuration
3. Check for database constraint violations
4. Review server logs for detailed errors

#### Email Delivery Issues
```
Error: Failed to send confirmation email
```

**Solution:**
1. Verify Resend API key is correct
2. Check sending domain verification
3. Review email template syntax
4. Check rate limits and quotas

#### Cal.com Integration Issues
```
Error: Failed to create Cal.com booking
```

**Solution:**
1. Verify Cal.com API key is valid
2. Check event type IDs are correct
3. Ensure Cal.com account has proper permissions
4. Review API rate limits

### Debug Mode

Enable debug logging by setting environment variable:
```env
DEBUG=true
NEXT_PUBLIC_DEBUG=true
```

This will provide detailed logging for:
- Database queries
- API requests
- Capacity calculations
- Email operations
- Cal.com integration

### Performance Issues

#### Slow Availability Checking
1. Check database indexes are present
2. Review query execution plans
3. Consider enabling availability caching
4. Optimize database connection pooling

#### High Memory Usage
1. Review component re-rendering patterns
2. Check for memory leaks in useEffect hooks
3. Optimize image loading and caching
4. Consider code splitting for large components

### Getting Help

1. **Documentation**: Review this README and inline code comments
2. **Issues**: Check GitHub issues for known problems
3. **Community**: Join our Discord community for support
4. **Professional Support**: Contact us for enterprise support options

## Contributing

We welcome contributions to improve the Hami Nail Salon booking system. Please follow these guidelines:

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Standards

- Follow TypeScript best practices
- Use consistent naming conventions
- Add JSDoc comments for functions
- Ensure mobile responsiveness
- Test accessibility compliance

### Pull Request Process

1. Update documentation for new features
2. Add tests for bug fixes and new features
3. Ensure CI/CD pipeline passes
4. Request review from maintainers
5. Address feedback promptly

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by the AJ  Team**

For questions, support, or feature requests, please contact us or open an issue on GitHub.

