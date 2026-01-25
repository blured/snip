# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hair Salon Appointment & Billing System - A full-stack TypeScript application for managing salon appointments, client records, billing, and stylist scheduling.

**Stack:** Node.js + Express + PostgreSQL + Prisma (backend), Next.js 16 + React 19 + Tailwind CSS (frontend)

## Development Commands

### Backend (Root Directory)

```bash
# Development
npm run dev                    # Start dev server with hot-reload (tsx watch)
npm run build                  # Compile TypeScript to JavaScript
npm start                      # Run production build

# Database
npm run prisma:generate        # Generate Prisma Client (after schema changes)
npm run prisma:migrate         # Create and apply migrations
npm run prisma:studio          # Open Prisma Studio GUI (localhost:5555)
npm run prisma:seed            # Seed database with initial data

# Database is hosted on udock.localdomain:5432 (PostgreSQL 16)
# Connection string in .env: DATABASE_URL
```

### Frontend (frontend/ Directory)

```bash
cd frontend

npm run dev                    # Start Next.js dev server (port 3001)
npm run build                  # Build for production
npm start                      # Run production build
npm run lint                   # Run ESLint
```

### Docker Deployment

```bash
docker-compose up -d           # Start all services (postgres, backend, frontend)
docker-compose logs -f backend # View backend logs
docker-compose down            # Stop all services
```

## Architecture

### Backend Structure (src/)

```
src/
├── routes/           # Express route definitions (*.routes.ts)
│   ├── auth.routes.ts
│   ├── clients.routes.ts
│   ├── stylists.routes.ts
│   ├── appointments.routes.ts
│   ├── services.routes.ts
│   ├── invoices.routes.ts
│   └── dashboard.routes.ts
├── controllers/      # Route handlers (business logic)
│   └── auth.controller.ts
├── middleware/       # Express middleware
│   ├── auth.ts       # JWT authentication & role-based authorization
│   └── validation.ts # Request validation
├── utils/            # Utilities
│   ├── jwt.ts        # JWT token generation/verification
│   ├── password.ts   # bcrypt password hashing
│   └── prisma.ts     # Prisma client instance
├── services/         # Currently empty (business logic in controllers)
└── index.ts          # Express app entry point
```

**Key Patterns:**
- **Routes → Controllers:** Routes define endpoints and validation, controllers handle logic
- **Authentication:** JWT tokens in Authorization header, middleware in `src/middleware/auth.ts`
  - `authenticate()` verifies JWT, adds `req.user` with payload
  - `authorize(...roles)` checks user role (ADMIN, STYLIST, RECEPTIONIST, CLIENT)
- **Validation:** express-validator in route files, validated with `validate` middleware
- **Database:** Prisma Client accessed via `prisma` from `src/utils/prisma.ts`

### Frontend Structure (frontend/)

```
frontend/
├── app/                    # Next.js App Router (file-based routing)
│   ├── dashboard/          # Admin dashboard (/dashboard)
│   │   ├── appointments/   # Appointment management
│   │   ├── clients/        # Client management
│   │   ├── stylists/       # Stylist management
│   │   ├── services/       # Service catalog
│   │   ├── invoices/       # Billing & invoices
│   │   ├── schedule/       # Calendar view
│   │   └── settings/       # Settings
│   ├── client-portal/      # Client-facing portal
│   ├── stylist-portal/     # Stylist-facing portal
│   ├── login/              # Authentication pages
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # React components
│   ├── ui/                 # Reusable UI components (button, input, modal, card, etc.)
│   ├── appointments/       # Appointment-specific components
│   └── clients/            # Client-specific components
├── hooks/                  # Custom React hooks
│   ├── use-auth.ts
│   ├── use-appointments.ts
│   ├── use-clients.ts
│   ├── use-stylists.ts
│   ├── use-services.ts
│   └── use-invoices.ts
├── lib/                    # Library code
│   ├── api/                # API client functions
│   │   ├── client.ts       # Axios instance with auth interceptor
│   │   ├── auth.ts
│   │   ├── appointments.ts
│   │   └── ...
│   ├── query-client.ts     # TanStack Query configuration
│   └── providers.tsx       # Provider wrappers
├── store/                  # Zustand state management
│   └── auth.ts             # Auth state (user, token, isAuthenticated)
└── types/                  # TypeScript type definitions
```

**Key Patterns:**
- **API Calls:** Axios client in `frontend/lib/api/client.ts` with auto-auth via interceptors
  - Token stored in localStorage, added to Authorization header
  - Base URL routing: `/api/*` → rewrites to backend (Next.js rewrites in next.config.ts)
- **Data Fetching:** TanStack Query hooks in `frontend/hooks/`
- **State Management:** Zustand for auth state (`frontend/store/auth.ts`)
- **Styling:** Tailwind CSS (v4) + custom components in `frontend/components/ui/`
- **Calendar:** TUI Calendar (TOAST UI) for appointment calendar

### Database Schema (Prisma)

**Core Models:**
- `User` → base user (email, password, role)
- `Client` → client profile (extends User)
- `Stylist` → stylist profile (extends User)
- `Service` → service catalog (haircut, coloring, etc.)
- `Appointment` → scheduled appointments (client + stylist + services)
- `Invoice` → billing (tied to appointments)
- `StylistAvailability` → weekly schedules
- `StylistTimeOff` → time-off requests
- `JobTitle` → stylist career stages

**Important Relationships:**
- User has one-to-one with Client or Stylist
- Appointment has many-to-many with Services via AppointmentService junction table
- Appointments auto-create Invoices
- Stylists have many-to-many Services via StylistService (defines which services each stylist offers)

**Schema location:** `prisma/schema.prisma`

After schema changes: `npm run prisma:generate && npm run prisma:migrate`

## Environment Configuration

Backend uses `.env` file:
- `DATABASE_URL` - PostgreSQL connection string (udock.localdomain:5432)
- `JWT_SECRET` - Secret for JWT tokens
- `PORT` - API port (default 3000)
- `NODE_ENV` - development/production
- `FRONTEND_URL` - Frontend origin for CORS

Frontend uses environment variables:
- `NEXT_PUBLIC_API_URL` - Backend API URL (for server-side requests)

## API Structure

All endpoints under `/api/*`:
- `/api/auth` - Login, register, profile, password change
- `/api/clients` - Client CRUD operations
- `/api/stylists` - Stylist management, availability, services
- `/api/services` - Service catalog
- `/api/appointments` - Appointment scheduling, calendar data
- `/api/invoices` - Billing and payments
- `/api/dashboard` - Dashboard stats and analytics

**Authentication:** Most endpoints require JWT token in `Authorization: Bearer <token>` header

## Important Notes

### Type Safety
- Prisma generates TypeScript types from database schema
- Frontend uses `@/*` path alias (maps to `frontend/`)
- Backend outputs to `dist/` directory

### CORS Configuration
- Backend allows frontend origins (localhost:3001, udock:3001, production domains)
- Configured in `src/index.ts`

### Frontend API Routing
- Next.js rewrites `/api/*` to backend `http://backend:3000/api/*` (Docker)
- In development, uses relative URLs in browser, NEXT_PUBLIC_API_URL for SSR

### Database Migrations
- Always run `npm run prisma:migrate` after schema changes
- Migrations stored in `prisma/migrations/`
- Seed data available via `npm run prisma:seed`

### Development Workflow
1. Backend runs on port 3000 (tsx watch for hot-reload)
2. Frontend runs on port 3001 (Next.js dev server)
3. API calls from frontend automatically proxied to backend
4. Database accessible via Prisma Studio on port 5555

### Testing Database Changes
Use Prisma Studio (`npm run prisma:studio`) for quick database inspection and manual data manipulation.
