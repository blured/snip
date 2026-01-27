import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding Fiona Yeates...');

  // Hash password
  const passwordHash = await bcrypt.hash('password', 10);

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: 'fiona.yeates@salon.com' },
  });

  if (existingUser) {
    console.log('Fiona Yeates already exists - updating photo and info...');

    // Update existing stylist
    const stylist = await prisma.stylist.findFirst({
      where: { userId: existingUser.id },
    });

    if (stylist) {
      await prisma.stylist.update({
        where: { id: stylist.id },
        data: {
          photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
          bio: 'Fiona is a creative stylist with a passion for modern cuts and color techniques. She specializes in dimensional color, lived-in blondes, and textured haircuts.',
          specialties: 'Dimensional color, Lived-in blondes, Textured haircuts, Balayage',
          hourlyRate: 30,
          commissionRate: 0.35,
        },
      });
      console.log('✓ Updated Fiona Yeates');
    }
  } else {
    // Create new user
    const user = await prisma.user.create({
      data: {
        email: 'fiona.yeates@salon.com',
        passwordHash,
        firstName: 'Fiona',
        lastName: 'Yeates',
        phone: '555-0101',
        role: 'STYLIST',
        active: true,
      },
    });

    // Create stylist profile
    const stylist = await prisma.stylist.create({
      data: {
        userId: user.id,
        photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
        bio: 'Fiona is a creative stylist with a passion for modern cuts and color techniques. She specializes in dimensional color, lived-in blondes, and textured haircuts.',
        specialties: 'Dimensional color, Lived-in blondes, Textured haircuts, Balayage',
        hourlyRate: 30,
        commissionRate: 0.35,
        active: true,
      },
    });

    // Get job titles
    const jobTitles = await prisma.jobTitle.findMany();
    const jobTitle = jobTitles.find((jt) => jt.title.toLowerCase() === 'stylist');

    if (jobTitle) {
      await prisma.stylist.update({
        where: { id: stylist.id },
        data: { jobTitleId: jobTitle.id },
      });
    }

    console.log('✓ Created Fiona Yeates');
  }

  console.log('\nDone! Fiona Yeates has been added.');
  console.log('Email: fiona.yeates@salon.com');
  console.log('Password: password');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
