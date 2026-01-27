import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Deleting all appointments...');

  // Delete all appointment services first (junction table)
  await prisma.appointmentService.deleteMany({});

  // Delete all appointments
  const result = await prisma.appointment.deleteMany({});

  console.log(`Deleted ${result.count} appointments`);
  console.log('Done!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
