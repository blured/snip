import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function main() {
  console.log('Adding users...');

  // Create Laurent (Admin)
  const laurentPassword = await hashPassword('laurent');
  const laurent = await prisma.user.upsert({
    where: { email: 'laurenth@gmail.com' },
    update: {},
    create: {
      email: 'laurenth@gmail.com',
      passwordHash: laurentPassword,
      firstName: 'Laurent',
      lastName: 'H',
      role: 'ADMIN',
      active: true,
    },
  });
  console.log('✓ Created/updated admin user:', laurent.email);

  // Create Fiona (Client)
  const fionaPassword = await hashPassword('orlalaurent');
  const fiona = await prisma.user.upsert({
    where: { email: 'fiona.yeates@gmail.com' },
    update: {},
    create: {
      email: 'fiona.yeates@gmail.com',
      passwordHash: fionaPassword,
      firstName: 'Fiona',
      lastName: 'Yeates',
      role: 'CLIENT',
      active: true,
      client: {
        create: {},
      },
    },
  });
  console.log('✓ Created/updated client user:', fiona.email);

  // Create Stylist
  const stylistPassword = await hashPassword('stylist');
  const stylist = await prisma.user.upsert({
    where: { email: 'stylist@artistvan.com' },
    update: {},
    create: {
      email: 'stylist@artistvan.com',
      passwordHash: stylistPassword,
      firstName: 'Stylist',
      lastName: 'Artist',
      role: 'STYLIST',
      active: true,
      stylist: {
        create: {},
      },
    },
  });
  console.log('✓ Created/updated stylist user:', stylist.email);

  console.log('\n✅ All users added successfully!');
  console.log('\nLogin credentials:');
  console.log('1. Admin:    laurenth@gmail.com / laurent');
  console.log('2. Client:   fiona.yeates@gmail.com / orlalaurent');
  console.log('3. Stylist:  stylist@artistvan.com / stylist');
}

main()
  .catch((e) => {
    console.error('Error adding users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
