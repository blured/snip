import { PrismaClient, UserRole, AppointmentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Sample data for random generation
const firstNames = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
  'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia',
  'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
];

const stylistFirstNames = ['Sarah', 'Mike', 'Jessica', 'David', 'Emily', 'Chris', 'Ashley', 'Ryan'];
const specialties = [
  'Hair coloring, Balayage, Highlights',
  'Haircuts, Styling, Men\'s grooming',
  'Bridal styling, Updos, Special occasions',
  'Hair treatment, Keratin, Deep conditioning',
  'Curly hair specialist, Textured hair',
  'Short hair, Pixie cuts, Modern styles',
  'Long hair, Layering, Texture',
  'Color correction, Fashion colors'
];

const serviceCategories = ['Haircut', 'Color', 'Styling', 'Treatment', 'Consultation'];
const serviceNames = [
  { name: 'Women\'s Haircut', category: 'Haircut', duration: 60, price: 65 },
  { name: 'Men\'s Haircut', category: 'Haircut', duration: 30, price: 35 },
  { name: 'Kids Haircut', category: 'Haircut', duration: 30, price: 25 },
  { name: 'Bang Trim', category: 'Haircut', duration: 15, price: 15 },
  { name: 'Single Process Color', category: 'Color', duration: 120, price: 85 },
  { name: 'Full Highlights', category: 'Color', duration: 150, price: 150 },
  { name: 'Balayage', category: 'Color', duration: 180, price: 200 },
  { name: 'Color Correction', category: 'Color', duration: 240, price: 250 },
  { name: 'Blowout & Style', category: 'Styling', duration: 45, price: 45 },
  { name: 'Updo / Special Occasion', category: 'Styling', duration: 60, price: 75 },
  { name: 'Bridal Hair Trial', category: 'Styling', duration: 90, price: 100 },
  { name: 'Deep Conditioning Treatment', category: 'Treatment', duration: 30, price: 35 },
  { name: 'Keratin Treatment', category: 'Treatment', duration: 180, price: 250 },
  { name: 'Scalp Treatment', category: 'Treatment', duration: 30, price: 40 },
  { name: 'Consultation', category: 'Consultation', duration: 15, price: 0 },
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function getRandomEmail(firstName: string, lastName: string): string {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@example.com`;
}

function getRandomTime(startHour: number, endHour: number): Date {
  const now = new Date();
  const hour = startHour + Math.floor(Math.random() * (endHour - startHour));
  const minute = Math.random() > 0.5 ? 0 : 30;
  now.setHours(hour, minute, 0, 0);
  return now;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

async function main() {
  console.log('Seeding database...');

  // Hash password
  const passwordHash = await bcrypt.hash('password', 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@salon.com' },
    update: {},
    create: {
      email: 'admin@salon.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      active: true,
    },
  });

  console.log('Created admin user:', admin.email);

  // Get or create services
  const services = await Promise.all(
    serviceNames.map(async (service) => {
      return prisma.service.upsert({
        where: { id: service.name.toLowerCase().replace(/\s+/g, '-') },
        update: {},
        create: {
          id: service.name.toLowerCase().replace(/\s+/g, '-'),
          name: service.name,
          category: service.category,
          durationMinutes: service.duration,
          basePrice: service.price,
          active: true,
        },
      });
    })
  );

  console.log(`Created ${services.length} services`);

  // Create stylists
  const stylists = [];
  for (let i = 0; i < stylistFirstNames.length; i++) {
    const firstName = stylistFirstNames[i];
    const lastName = getRandomItem(lastNames);
    const email = `${firstName.toLowerCase()}@salon.com`;

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone: `555-010${i}`,
        role: 'STYLIST',
        active: true,
      },
    });

    const stylist = await prisma.stylist.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        specialties: getRandomItem(specialties),
        bio: `Professional stylist with ${5 + Math.floor(Math.random() * 10)} years of experience.`,
        hourlyRate: 25 + Math.random() * 15,
        commissionRate: 0.3 + Math.random() * 0.2,
        active: true,
      },
    });

    // Add services to stylist
    const servicesForStylist = getRandomItems(services, 5 + Math.floor(Math.random() * 5));
    await Promise.all(
      servicesForStylist.map((service) =>
        prisma.stylistService.upsert({
          where: {
            stylistId_serviceId: {
              stylistId: stylist.id,
              serviceId: service.id,
            },
          },
          update: {},
          create: {
            stylistId: stylist.id,
            serviceId: service.id,
          },
        })
      )
    );

    // Add availability (Mon-Fri, 9AM-6PM)
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] as const;
    await Promise.all(
      days.map((day) =>
        prisma.stylistAvailability.upsert({
          where: {
            id: `${stylist.id}-${day}`,
          },
          update: {},
          create: {
            id: `${stylist.id}-${day}`,
            stylistId: stylist.id,
            dayOfWeek: day,
            startTime: '09:00',
            endTime: '18:00',
            active: true,
          },
        })
      )
    );

    // Store stylist with user info
    stylists.push({ ...stylist, user });
    console.log(`Created stylist: ${user.firstName} ${user.lastName}`);
  }

  // Create clients
  const clients = [];
  const clientCount = 30;
  for (let i = 0; i < clientCount; i++) {
    const firstName = getRandomItem(firstNames);
    const lastName = getRandomItem(lastNames);
    const email = getRandomEmail(firstName, lastName);

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone: `555-${1000 + i}`,
        role: 'CLIENT',
        active: true,
      },
    });

    const client = await prisma.client.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        preferredStylistId: getRandomItem(stylists).id,
        notes: `Loves ${getRandomItem(['bold colors', 'classic styles', 'modern cuts', 'natural looks'])}.`,
      },
    });

    // Store client with user info
    clients.push({ ...client, user });
  }

  console.log(`Created ${clients.length} clients`);

  // Create appointments for the next 30 days
  // Track appointments per stylist per day (max 16 per stylist per day)
  const MAX_APPOINTMENTS_PER_STYLIST_PER_DAY = 16;
  const APPOINTMENT_DAYS = 30;

  // Track: appointmentsPerDay[dayIndex][stylistId] = count
  const appointmentsPerDay: Record<number, Record<string, number>> = {};

  for (let day = 0; day < APPOINTMENT_DAYS; day++) {
    const date = addDays(new Date(), day - 7); // Start from 7 days ago
    const dayIndex = day;
    appointmentsPerDay[dayIndex] = {};

    // For each stylist, randomly assign 8-16 appointments
    for (const stylist of stylists) {
      const numAppointments = 8 + Math.floor(Math.random() * 9); // 8-16 appointments per stylist

      for (let i = 0; i < numAppointments; i++) {
        // Track count for this stylist on this day
        if (!appointmentsPerDay[dayIndex][stylist.id]) {
          appointmentsPerDay[dayIndex][stylist.id] = 0;
        }

        // Skip if this stylist already has max appointments
        if (appointmentsPerDay[dayIndex][stylist.id] >= MAX_APPOINTMENTS_PER_STYLIST_PER_DAY) {
          break;
        }

        const client = getRandomItem(clients);
        const service = getRandomItem(services);

        // Calculate time based on appointment index (spread through the day)
        const startHour = 9 + Math.floor((i * 60) / 60); // Spread from 9AM onwards
        const startTime = new Date(date);
        startTime.setHours(startHour + (i % 8), (i % 4) * 15, 0, 0);

        const endTime = addHours(startTime, service.durationMinutes / 60);

        // Skip if end time is past 6PM
        if (endTime.getHours() > 18 || endTime.getDate() !== date.getDate()) {
          continue;
        }

        const status = day < 7
          ? getRandomItem(['COMPLETED', 'CANCELLED', 'NO_SHOW'] as AppointmentStatus[])
          : getRandomItem(['SCHEDULED', 'CONFIRMED'] as AppointmentStatus[]);

        try {
          await prisma.appointment.create({
            data: {
              clientId: client.id,
              stylistId: stylist.id,
              scheduledStart: startTime,
              scheduledEnd: endTime,
              status,
              notes: status === 'COMPLETED' ? 'Client was happy with the result.' : undefined,
              reminderSent: status === 'CONFIRMED' || status === 'COMPLETED',
              services: {
                create: {
                  serviceId: service.id,
                  price: service.basePrice,
                },
              },
            },
          });

          appointmentsPerDay[dayIndex][stylist.id]++;

          console.log(`Created appointment: ${client.user.firstName} with ${stylist.user.firstName} on ${date.toDateString()} (${appointmentsPerDay[dayIndex][stylist.id]}/${MAX_APPOINTMENTS_PER_STYLIST_PER_DAY})`);
        } catch (error) {
          // Skip if there's a conflict or other error
          console.log(`Skipped appointment due to error`);
        }
      }
    }
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
