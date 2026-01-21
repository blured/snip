# Hair Salon Appointment & Billing System

## Project Overview
A modern web application for managing hair salon appointments, client records, and billing. Designed for dozens of concurrent users (stylists, receptionists, clients).

## Technology Stack

### Backend
- **Runtime:** Node.js with TypeScript
- **Framework:** Express (or NestJS for more structure)
- **ORM:** Prisma
- **API Style:** RESTful (or GraphQL if needed later)

### Database
- **Primary Database:** PostgreSQL
- **Rationale:** 
  - Strong ACID compliance for appointments and billing
  - Excellent date/time support for scheduling
  - Natural fit for relational data (clients → appointments → stylists → services)
  - Prevents double-bookings with proper transactions

### Frontend
- **Framework:** Next.js (React + TypeScript)
- **Alternative:** React + Vite (if simpler setup preferred)
- **Styling:** Tailwind CSS
- **Calendar/Scheduling UI:** FullCalendar or react-big-calendar
- **State Management:** React Context or Zustand (if needed)

### Infrastructure & Services
- **Hosting Suggestions:** Vercel (frontend), Railway/Render (backend + DB)
- **Authentication:** NextAuth.js or Clerk
- **Payments:** Stripe or Square (Square popular in salons)
- **Notifications:** Twilio (SMS) + SendGrid (email) for appointment reminders
- **Alternative Backend:** Supabase (PostgreSQL + Auth + Realtime built-in)

## Core Features

### 1. Appointment Management
- Calendar view (day/week/month)
- Booking appointments with specific stylists
- Service selection with duration and pricing
- Recurring appointments support
- Conflict detection (prevent double-booking)
- Appointment reminders (SMS/email)
- Waitlist management

### 2. Client Management
- Client profiles (contact info, preferences, history)
- Appointment history
- Service preferences
- Notes (allergies, preferred products, etc.)
- Client portal for self-booking

### 3. Stylist Management
- Stylist schedules and availability
- Break times and time-off
- Service assignments (which services each stylist offers)
- Performance metrics (optional)

### 4. Billing & Payments
- Invoice generation
- Payment processing (credit card, cash, etc.)
- Tipping support
- Sales reports
- Tax calculations
- Product sales tracking (optional)

### 5. Services & Pricing
- Service catalog (haircut, coloring, treatment, etc.)
- Duration estimates
- Pricing tiers
- Package deals (optional)

## Database Schema Considerations

### Core Entities
- **Users** (stylists, admins, clients)
- **Appointments** (date, time, duration, status)
- **Services** (name, duration, price, category)
- **Clients** (contact info, preferences, notes)
- **Invoices** (items, payments, tax)
- **Availability** (stylist schedules, breaks, time-off)

### Key Relationships
- Client → Appointments (one-to-many)
- Stylist → Appointments (one-to-many)
- Appointment → Services (many-to-many)
- Invoice → Appointment (one-to-one or many-to-one)

## Development Priorities

### Phase 1 (MVP)
1. Basic appointment calendar
2. Client management
3. Stylist scheduling
4. Simple booking flow
5. Basic billing/checkout

### Phase 2
1. Client self-service portal
2. Automated reminders
3. Payment processing integration
4. Reporting dashboard

### Phase 3
1. Waitlist management
2. Recurring appointments
3. Mobile app (React Native/PWA)
4. Advanced analytics

## Code Quality & Maintenance

### Type Safety
- Full TypeScript coverage (frontend + backend)
- Prisma generates TypeScript types from database schema
- Strict mode enabled

### Testing
- Unit tests: Jest + React Testing Library
- E2E tests: Playwright or Cypress (for critical flows)
- API tests: Supertest

### Code Organization
```
/backend
  /src
    /routes
    /controllers
    /services
    /models (Prisma)
    /middleware
    /utils
/frontend
  /app (Next.js app directory)
  /components
  /lib
  /hooks
  /types
```

## Performance Considerations
- Database indexing on frequently queried fields (date, stylist_id, client_id)
- Caching with Redis (if needed for high-traffic periods)
- Optimistic UI updates for better UX
- Image optimization for client/service photos

## Security
- JWT or session-based authentication
- Role-based access control (admin, stylist, client)
- Input validation and sanitization
- SQL injection prevention (Prisma handles this)
- Rate limiting on API endpoints
- HTTPS only in production

## Scalability Notes
At dozens of users, the stack is more than sufficient. If the salon chain expands:
- Horizontal scaling: Add more backend instances
- Database: PostgreSQL can handle thousands of concurrent connections
- CDN for static assets (Next.js + Vercel handles this automatically)

## Environment Variables
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
STRIPE_SECRET_KEY=...
TWILIO_ACCOUNT_SID=...
SENDGRID_API_KEY=...
NEXT_PUBLIC_API_URL=...
```

## Getting Started Commands
```bash
# Backend
npm init -y
npm install express typescript @types/node prisma
npx prisma init

# Frontend
npx create-next-app@latest salon-app --typescript --tailwind --app

# Database
npx prisma migrate dev --name init
npx prisma studio  # View database in browser
```

## Resources & Documentation
- Prisma Docs: https://www.prisma.io/docs
- Next.js Docs: https://nextjs.org/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/
- FullCalendar React: https://fullcalendar.io/docs/react
- Stripe API: https://stripe.com/docs/api
- Tailwind CSS: https://tailwindcss.com/docs

## Notes
- This is designed for a hair salon with dozens of users
- Prioritizes developer experience and maintainability over extreme performance optimization
- Can easily adapt for other appointment-based businesses (spas, medical offices, etc.)
- Full type safety reduces bugs and improves long-term maintenance
