// Enums matching backend
export enum UserRole {
  ADMIN = 'ADMIN',
  STYLIST = 'STYLIST',
  RECEPTIONIST = 'RECEPTIONIST',
  CLIENT = 'CLIENT',
}

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  DIGITAL_WALLET = 'DIGITAL_WALLET',
  OTHER = 'OTHER',
}

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

// Data models
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  stylist?: Stylist;
  client?: Client;
}

export interface Client {
  id: string;
  userId: string;
  dateOfBirth?: string;
  preferredStylistId?: string;
  notes?: string;
  allergies?: string;
  preferredProducts?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  preferredStylist?: Stylist;
  appointments?: Appointment[];
  invoices?: Invoice[];
}

export interface Stylist {
  id: string;
  userId: string;
  specialties?: string;
  bio?: string;
  photo?: string;
  hourlyRate?: number;
  commissionRate?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
  appointments?: Appointment[];
  availability?: StylistAvailability[];
  timeOff?: StylistTimeOff[];
  stylistServices?: StylistService[];
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  category: string;
  durationMinutes: number;
  basePrice: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StylistService {
  id: string;
  stylistId: string;
  serviceId: string;
  createdAt: string;
  stylist: Stylist;
  service: Service;
}

export interface Appointment {
  id: string;
  clientId: string;
  stylistId: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  status: AppointmentStatus;
  notes?: string;
  cancellationReason?: string;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
  client: Client;
  stylist: Stylist;
  services?: AppointmentService[];
  invoice?: Invoice;
}

export interface AppointmentService {
  id: string;
  appointmentId: string;
  serviceId: string;
  price: number;
  createdAt: string;
  service: Service;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  appointmentId?: string;
  clientId: string;
  subtotal: number;
  tax: number;
  tip: number;
  discount: number;
  total: number;
  status: InvoiceStatus;
  dueDate?: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  client: Client;
  appointment?: Appointment;
  items?: InvoiceItem[];
  payments?: Payment[];
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  serviceId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt: string;
  service?: Service;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  transactionId?: string;
  notes?: string;
  processedAt: string;
  createdAt: string;
}

export interface StylistAvailability {
  id: string;
  stylistId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StylistTimeOff {
  id: string;
  stylistId: string;
  startDate: string;
  endDate: string;
  reason?: string;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface CreateAppointmentRequest {
  clientId: string;
  stylistId: string;
  scheduledStart: string;
  scheduledEnd: string;
  serviceIds: string[];
  notes?: string;
}

export interface ApiError {
  error: string;
  message: string;
}
