import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash1 = await bcrypt.hash('lucien', 10);
  const passwordHash2 = await bcrypt.hash('orlalaurent', 10);

  // Create first user
  const user1 = await prisma.user.upsert({
    where: { email: 'laurenth@gmail.com' },
    update: {},
    create: {
      email: 'laurenth@gmail.com',
      passwordHash: passwordHash1,
      firstName: 'Laurent',
      lastName: 'H',
      role: 'ADMIN',
      active: true,
    },
  });

  // Create client profile for user1 if it doesn't exist
  await prisma.client.upsert({
    where: { userId: user1.id },
    update: {},
    create: {
      userId: user1.id,
    },
  });

  console.log('Created user:', user1.email);

  // Create second user
  const user2 = await prisma.user.upsert({
    where: { email: 'fiona.yeates@gmail.com' },
    update: {},
    create: {
      email: 'fiona.yeates@gmail.com',
      passwordHash: passwordHash2,
      firstName: 'Fiona',
      lastName: 'Yeates',
      role: 'ADMIN',
      active: true,
    },
  });

  // Create client profile for user2 if it doesn't exist
  await prisma.client.upsert({
    where: { userId: user2.id },
    update: {},
    create: {
      userId: user2.id,
    },
  });

  console.log('Created user:', user2.email);
  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
