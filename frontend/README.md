# Salon Manager - Frontend

Modern Next.js frontend for the Hair Salon Appointment & Billing System.

## Features

- **Authentication**: Login/logout with JWT tokens
- **Dashboard**: Overview of appointments, clients, revenue, and stats
- **Appointments Management**: Calendar view and booking system (coming soon)
- **Client Management**: Client profiles, history, and preferences (coming soon)
- **Stylist Management**: Stylist schedules, availability, and time-off (coming soon)
- **Services**: Service catalog with pricing (coming soon)
- **Invoicing**: Billing and payment tracking (coming soon)
- **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running at `http://udock.localdomain:3000`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Environment Variables

The `.env.local` file is already configured:

```env
NEXT_PUBLIC_API_URL=http://udock.localdomain:3000
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard and main app pages
│   ├── login/             # Login page
│   └── layout.tsx         # Root layout with providers
├── components/            # React components
│   ├── layout/           # Layout components (Sidebar, etc.)
│   └── ui/               # Reusable UI components
├── lib/                   # Utilities and configuration
│   ├── api/              # API client functions
│   ├── providers.tsx     # React Query & Toast providers
│   └── query-client.ts   # React Query configuration
├── hooks/                 # Custom React hooks
├── store/                 # Zustand stores
├── types/                 # TypeScript type definitions
└── public/               # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Development Workflow

1. Start the backend API on udock.localdomain
2. Run `npm run dev` in the frontend directory
3. Open `http://localhost:3000` in your browser
4. You'll be redirected to the login page

## API Integration

The frontend communicates with the backend API via Axios client configured in `lib/api/client.ts`. All API calls include:

- Automatic JWT token injection
- Error handling with interceptors
- Automatic redirect to login on 401 errors
- Toast notifications for success/error states

## Next Steps

- [ ] Implement backend API endpoints
- [ ] Build appointments calendar view
- [ ] Create client management CRUD pages
- [ ] Add stylist management interface
- [ ] Implement services management
- [ ] Build invoice creation and payment processing
- [ ] Add real-time updates
- [ ] Create reports and analytics

## Deploy on Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.
