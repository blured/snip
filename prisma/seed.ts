import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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

  // Create demo client user
  const client = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      passwordHash,
      firstName: 'Jane',
      lastName: 'Client',
      role: 'CLIENT',
      active: true,
      client: {
        create: {},
      },
    },
  });

  console.log('Created client user:', client.email);

  // Hash custom password for Laurent
  const laurentPasswordHash = await bcrypt.hash('lucien', 10);

  // Create Laurent user
  const laurent = await prisma.user.upsert({
    where: { email: 'laurent@salon.com' },
    update: {},
    create: {
      email: 'laurent@salon.com',
      passwordHash: laurentPasswordHash,
      firstName: 'Laurent',
      lastName: 'User',
      role: 'CLIENT',
      active: true,
      client: {
        create: {},
      },
    },
  });

  console.log('Created laurent user:', laurent.email);

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
