import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

// Load environment variables
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
// Allow CORS from configured origins or all origins in production
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3001', 'http://udock:3001', 'http://udock.artistvan.com:3001', 'https://salon.artistvan.com'];

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? true : allowedOrigins,
  credentials: true
}));

// Workaround: Use raw body parser for auth routes to avoid dot-stripping bug in express.json()
// Mount this BEFORE express.json() so it processes auth routes first
app.use('/api/auth', bodyParser.raw({ type: 'application/json' }), (req: Request, _res: Response, next: NextFunction) => {
  if (req.body && req.body.length > 0) {
    const rawString = req.body.toString();
    console.log('RAW BODY BUFFER:', rawString);
    console.log('HEX DUMP:', req.body.toString('hex'));
    try {
      const parsed = JSON.parse(rawString);
      console.log('MANUALLY PARSED email:', parsed.email);
      // Store in both body and a safe property
      (req as any).body = parsed;
      (req as any).safeBody = parsed; // Store in separate property
      // IMPORTANT: Mark request to skip body parsing
      (req as any)._body = true;
      (req as any)._parsedBody = true;
    } catch (e) {
      console.error('JSON parse error:', e);
      (req as any).body = {};
      (req as any).safeBody = {};
    }
  }
  next();
});

app.use((req: Request, res: Response, next: NextFunction) => {
  // Skip express.json() for auth routes to prevent reparsing
  if (req.path?.startsWith('/api/auth')) {
    console.log('Skipping express.json() for auth route, body already parsed:', (req as any).body?.email);
    return next();
  }
  express.json()(req, res, next);
});
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Import routes
import authRoutes from './routes/auth.routes';
import clientRoutes from './routes/clients.routes';
import stylistRoutes from './routes/stylists.routes';
import serviceRoutes from './routes/services.routes';
import appointmentRoutes from './routes/appointments.routes';
import invoiceRoutes from './routes/invoices.routes';
import dashboardRoutes from './routes/dashboard.routes';

// API info endpoint
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    message: 'Hair Salon Appointment & Billing API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      clients: '/api/clients',
      stylists: '/api/stylists',
      services: '/api/services',
      appointments: '/api/appointments',
      invoices: '/api/invoices',
      dashboard: '/api/dashboard'
    }
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/stylists', stylistRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

// Start server - Listen on all interfaces (0.0.0.0) to allow external access
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 External access: http://udock.localdomain:${PORT}/health`);
});

export default app;
