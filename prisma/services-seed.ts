import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const services = [
  // Ladies Services
  {
    name: 'Blow Dry (Long)',
    category: 'Ladies',
    targetAudience: 'Ladies',
    durationMinutes: 45,
    basePrice: 32.00,
    priceType: 'Fixed',
    notes: '',
  },
  {
    name: 'Blow Dry (Medium)',
    category: 'Ladies',
    targetAudience: 'Ladies',
    durationMinutes: 40,
    basePrice: 30.00,
    priceType: 'Fixed',
    notes: '',
  },
  {
    name: 'Blow Dry (Short)',
    category: 'Ladies',
    targetAudience: 'Ladies',
    durationMinutes: 30,
    basePrice: 28.00,
    priceType: 'Fixed',
    notes: '',
  },
  {
    name: 'Cut & Blow Dry',
    category: 'Ladies',
    targetAudience: 'Ladies',
    durationMinutes: 60,
    basePrice: 53.00,
    priceType: 'Fixed',
    notes: '',
  },
  {
    name: 'Shampoo & Set',
    category: 'Ladies',
    targetAudience: 'Ladies',
    durationMinutes: 30,
    basePrice: 28.00,
    priceType: 'Fixed',
    notes: '',
  },
  {
    name: 'Wash & Cut',
    category: 'Ladies',
    targetAudience: 'Ladies',
    durationMinutes: 45,
    basePrice: 35.00,
    priceType: 'Fixed',
    notes: '',
  },
  {
    name: 'Upstyles',
    category: 'Ladies',
    targetAudience: 'Ladies',
    durationMinutes: 60,
    basePrice: 48.00,
    priceType: 'Starting',
    notes: 'From',
  },
  {
    name: 'GHD Curls',
    category: 'Ladies',
    targetAudience: 'Ladies',
    durationMinutes: 45,
    basePrice: 38.00,
    priceType: 'Starting',
    notes: 'From',
  },
  // Colours
  {
    name: 'Tint, Cut & Semi',
    category: 'Colours',
    targetAudience: 'Ladies',
    durationMinutes: 150,
    basePrice: 96.00,
    priceType: 'Fixed',
    notes: '',
  },
  {
    name: 'Tint & Cut',
    category: 'Colours',
    targetAudience: 'Ladies',
    durationMinutes: 135,
    basePrice: 93.00,
    priceType: 'Fixed',
    notes: '',
  },
  {
    name: 'Tint & Blow Dry',
    category: 'Colours',
    targetAudience: 'Ladies',
    durationMinutes: 120,
    basePrice: 79.00,
    priceType: 'Fixed',
    notes: '',
  },
  {
    name: 'Semi & Cut',
    category: 'Colours',
    targetAudience: 'Ladies',
    durationMinutes: 135,
    basePrice: 87.00,
    priceType: 'Fixed',
    notes: '',
  },
  {
    name: 'Semi & Blow Dry',
    category: 'Colours',
    targetAudience: 'Ladies',
    durationMinutes: 120,
    basePrice: 80.00,
    priceType: 'Fixed',
    notes: '',
  },
  {
    name: 'Couture Colour Balayage (Full)',
    category: 'Colours',
    targetAudience: 'Ladies',
    durationMinutes: 210,
    basePrice: 160.00,
    priceType: 'Fixed',
    notes: '',
  },
  {
    name: 'Couture Colour Balayage (Half)',
    category: 'Colours',
    targetAudience: 'Ladies',
    durationMinutes: 150,
    basePrice: 130.00,
    priceType: 'Fixed',
    notes: '',
  },
  // Highlights
  {
    name: 'Full Head & Cut (Long)',
    category: 'Highlights',
    targetAudience: 'Ladies',
    durationMinutes: 180,
    basePrice: 156.00,
    priceType: 'Starting',
    notes: 'From',
  },
  {
    name: 'Full Head & Blow Dry (Long)',
    category: 'Highlights',
    targetAudience: 'Ladies',
    durationMinutes: 165,
    basePrice: 141.00,
    priceType: 'Starting',
    notes: 'From',
  },
  {
    name: 'Full Head & Cut (Short)',
    category: 'Highlights',
    targetAudience: 'Ladies',
    durationMinutes: 150,
    basePrice: 138.00,
    priceType: 'Fixed',
    notes: '',
  },
  {
    name: 'Full Head & Blow Dry (Short)',
    category: 'Highlights',
    targetAudience: 'Ladies',
    durationMinutes: 135,
    basePrice: 124.00,
    priceType: 'Starting',
    notes: 'From',
  },
  {
    name: 'Half Head & Cut',
    category: 'Highlights',
    targetAudience: 'Ladies',
    durationMinutes: 120,
    basePrice: 122.00,
    priceType: 'Fixed',
    notes: '',
  },
  {
    name: 'Half Head & Blow Dry',
    category: 'Highlights',
    targetAudience: 'Ladies',
    durationMinutes: 105,
    basePrice: 108.00,
    priceType: 'Fixed',
    notes: '',
  },
  {
    name: 'T-Bar & Cut',
    category: 'Highlights',
    targetAudience: 'Ladies',
    durationMinutes: 90,
    basePrice: 96.00,
    priceType: 'Fixed',
    notes: '',
  },
  {
    name: 'T-Bar & Blow Dry',
    category: 'Highlights',
    targetAudience: 'Ladies',
    durationMinutes: 75,
    basePrice: 85.00,
    priceType: 'Fixed',
    notes: '',
  },
  {
    name: 'Colour, Highlights & Cut',
    category: 'Highlights',
    targetAudience: 'Ladies',
    durationMinutes: 180,
    basePrice: 100.00,
    priceType: 'Starting',
    notes: 'From',
  },
  {
    name: 'Colour, Highlights & Blow Dry',
    category: 'Highlights',
    targetAudience: 'Ladies',
    durationMinutes: 165,
    basePrice: 90.00,
    priceType: 'Fixed',
    notes: '',
  },
  // Gents
  {
    name: 'Wash & Cut',
    category: 'Gents',
    targetAudience: 'Gents',
    durationMinutes: 30,
    basePrice: 24.00,
    priceType: 'Fixed',
    notes: '',
  },
  // Students
  {
    name: 'Student Cut & Blow Dry',
    category: 'Students',
    targetAudience: 'Students',
    durationMinutes: 45,
    basePrice: 43.00,
    priceType: 'Fixed',
    notes: 'Age 13+',
  },
  {
    name: 'Student Wash & Cut',
    category: 'Students',
    targetAudience: 'Students',
    durationMinutes: 30,
    basePrice: 28.00,
    priceType: 'Fixed',
    notes: 'Age 13+',
  },
  // Children
  {
    name: 'Wash & Cut',
    category: 'Children',
    targetAudience: 'Children',
    durationMinutes: 30,
    basePrice: 26.00,
    priceType: 'Fixed',
    notes: 'Under 13',
  },
  {
    name: 'Cut & Blow Dry',
    category: 'Children',
    targetAudience: 'Children',
    durationMinutes: 45,
    basePrice: 37.00,
    priceType: 'Fixed',
    notes: 'Under 13',
  },
  // OAP (Senior Citizens)
  {
    name: 'Perm',
    category: 'OAP',
    targetAudience: 'OAP',
    durationMinutes: 120,
    basePrice: 92.00,
    priceType: 'Fixed',
    notes: 'Tue & Wed Only',
  },
  {
    name: 'Shampoo & Set',
    category: 'OAP',
    targetAudience: 'OAP',
    durationMinutes: 30,
    basePrice: 26.50,
    priceType: 'Fixed',
    notes: 'Tue & Wed Only',
  },
  {
    name: 'Cut & Set/Blow Dry',
    category: 'OAP',
    targetAudience: 'OAP',
    durationMinutes: 60,
    basePrice: 45.00,
    priceType: 'Fixed',
    notes: 'Tue & Wed Only',
  },
  {
    name: 'Blow Dry',
    category: 'OAP',
    targetAudience: 'OAP',
    durationMinutes: 30,
    basePrice: 26.50,
    priceType: 'Fixed',
    notes: 'Tue & Wed Only',
  },
  {
    name: 'Wash & Cut',
    category: 'OAP',
    targetAudience: 'OAP',
    durationMinutes: 30,
    basePrice: 28.00,
    priceType: 'Fixed',
    notes: 'Tue & Wed Only',
  },
  {
    name: 'Wash & Cut Gent',
    category: 'OAP',
    targetAudience: 'OAP',
    durationMinutes: 25,
    basePrice: 18.00,
    priceType: 'Fixed',
    notes: 'Tue & Wed Only',
  },
];

async function main() {
  console.log('Starting services seed...');

  // Delete existing services
  await prisma.service.deleteMany();

  // Create services
  for (const service of services) {
    await prisma.service.create({
      data: service,
    });
  }

  console.log(`✓ Created ${services.length} services.`);

  // Group by category
  const allServices = await prisma.service.findMany({
    orderBy: [
      { category: 'asc' },
      { name: 'asc' },
    ],
  });

  const grouped = allServices.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, typeof allServices>);

  console.log('\nServices by Category:');
  Object.entries(grouped).forEach(([category, services]) => {
    console.log(`\n${category} (${services.length} services):`);
    services.forEach(s => {
      const priceNote = s.priceType === 'Starting' ? ` (${s.priceType} €${s.notes})` : ` (€${s.basePrice.toFixed(2)})`;
      console.log(`  - ${s.name}${priceNote}`);
    });
  });
}

main()
  .catch((e) => {
    console.error('Error seeding services:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
