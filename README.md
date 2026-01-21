# Hair Salon Appointment & Billing System

## Setup Instructions

### 1. Deploy PostgreSQL Database on udock.localdomain

Copy the `docker-compose.yml` file to your Docker server at udock.localdomain and start the PostgreSQL container:

```bash
# On your udock server
docker-compose up -d
```

This will start a PostgreSQL 16 container with the following default credentials:
- **Database**: salon_db
- **User**: salon_user
- **Password**: salon_password_change_in_production
- **Port**: 5432

To verify the database is running:

```bash
docker-compose ps
docker-compose logs postgres
```

### 2. Run Database Migrations

Once the PostgreSQL container is running on udock.localdomain, run the Prisma migrations to create the database schema:

```bash
npm run prisma:migrate
```

This will create all the necessary tables for:
- Users (Admin, Stylists, Receptionists, Clients)
- Clients (profiles, preferences, notes)
- Stylists (availability, services, time-off)
- Services (haircuts, coloring, treatments, etc.)
- Appointments (scheduling, status tracking)
- Invoices & Payments (billing, tax, tips)

### 3. View Database with Prisma Studio

To explore and manage your database visually:

```bash
npm run prisma:studio
```

This opens a browser-based GUI at `http://localhost:5555`

### 4. Start Development Server

```bash
npm run dev
```

This starts the backend server with hot-reload using `tsx watch`.

## Environment Variables

The `.env` file contains your database connection and other configurations. Update these values for production:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT token generation
- `PORT`: API server port (default: 3000)

See `.env.example` for all available configuration options.

## Database Schema Overview

### Core Tables

1. **User**: Authentication and base user information
2. **Client**: Client-specific data (notes, preferences, allergies)
3. **Stylist**: Stylist profiles, specialties, rates
4. **Service**: Service catalog with pricing and duration
5. **Appointment**: Appointment scheduling and status
6. **Invoice**: Billing and payment tracking
7. **StylistAvailability**: Weekly schedules for each stylist
8. **StylistTimeOff**: Time-off requests and approvals

### Key Features

- **Appointment Management**: Full calendar support with conflict detection
- **Client Profiles**: Complete history, preferences, and notes
- **Billing**: Invoices with tax, tips, and multiple payment methods
- **Scheduling**: Stylist availability, time-off, and service assignments

## NPM Scripts

- `npm run dev` - Start development server with hot-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio GUI

## Next Steps

1. Deploy PostgreSQL container on udock.localdomain
2. Run `npm run prisma:migrate` to create database schema
3. Create a basic Express server in `src/index.ts`
4. Build API endpoints for appointments, clients, and services
5. Set up authentication with JWT
6. Create the Next.js frontend application

## Tech Stack

- **Backend**: Node.js + TypeScript + Express
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Hosting**: Backend on local/cloud, DB on udock.localdomain

## Security Notes

- Change default database credentials in production
- Use strong JWT secrets
- Enable HTTPS in production
- Implement rate limiting on API endpoints
- Validate and sanitize all user inputs
