import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding/updating Fiona and Aoife...\n');

  // Hash password
  const passwordHash = await bcrypt.hash('password', 10);

  // Get job titles
  const jobTitles = await prisma.jobTitle.findMany();

  // 1. Check if Fiona exists with old email and update her
  let fionaUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'fiona.yeates@salon.com' },
        { email: 'fiona.harris@salon.com' },
      ],
    },
  });

  if (fionaUser) {
    console.log('Updating Fiona Yeates → Fiona Harris...');

    // Update user
    await prisma.user.update({
      where: { id: fionaUser.id },
      data: {
        email: 'fiona.harris@salon.com',
        firstName: 'Fiona',
        lastName: 'Harris',
      },
    });

    // Get stylist profile
    const stylist = await prisma.stylist.findFirst({
      where: { userId: fionaUser.id },
    });

    if (stylist) {
      await prisma.stylist.update({
        where: { id: stylist.id },
        data: {
          bio: 'Fiona is the owner and a senior stylist with expertise in cuts, blowdrys, and colour work. She specialises as a colour master and highlighting expert.',
          specialties: 'Cuts, Blowdrys, Colour master, Highlighting',
          hourlyRate: 45,
          commissionRate: 0.50,
        },
      });

      // Update job title to Owner
      const ownerTitle = jobTitles.find((jt) => jt.title.toLowerCase() === 'owner, senior stylist');
      if (ownerTitle) {
        await prisma.stylist.update({
          where: { id: stylist.id },
          data: { jobTitleId: ownerTitle.id },
        });
      }

      console.log('✓ Updated Fiona Harris (Owner, Senior Stylist)');
    }
  } else {
    console.log('Fiona not found - creating new...');

    // Create Fiona Harris
    fionaUser = await prisma.user.create({
      data: {
        email: 'fiona.harris@salon.com',
        passwordHash,
        firstName: 'Fiona',
        lastName: 'Harris',
        phone: '555-0102',
        role: 'STYLIST',
        active: true,
      },
    });

    const stylist = await prisma.stylist.create({
      data: {
        userId: fionaUser.id,
        photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
        bio: 'Fiona is the owner and a senior stylist with expertise in cuts, blowdrys, and colour work. She specialises as a colour master and highlighting expert.',
        specialties: 'Cuts, Blowdrys, Colour master, Highlighting',
        hourlyRate: 45,
        commissionRate: 0.50,
        active: true,
      },
    });

    // Set job title to Owner
    const ownerTitle = jobTitles.find((jt) => jt.title.toLowerCase() === 'owner, senior stylist');
    if (ownerTitle) {
      await prisma.stylist.update({
        where: { id: stylist.id },
        data: { jobTitleId: ownerTitle.id },
      });
    }

    console.log('✓ Created Fiona Harris (Owner, Senior Stylist)');
  }

  // 2. Create Aoife
  let aoifeUser = await prisma.user.findUnique({
    where: { email: 'aoife.hugueniot@salon.com' },
  });

  if (aoifeUser) {
    console.log('Aoife Hugueniot already exists - updating...');
  } else {
    console.log('Creating Aoife Hugueniot...');

    aoifeUser = await prisma.user.create({
      data: {
        email: 'aoife.hugueniot@salon.com',
        passwordHash,
        firstName: 'Aoife',
        lastName: 'Hugueniot',
        phone: '555-0103',
        role: 'STYLIST',
        active: true,
      },
    });

    const stylist = await prisma.stylist.create({
      data: {
        userId: aoifeUser.id,
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
        bio: 'Aoife is our salon apprentice, assisting with daily operations and learning from our senior stylists.',
        specialties: 'Hair washing, Reception, Runner',
        hourlyRate: 15,
        commissionRate: 0.15,
        active: true,
      },
    });

    // Set job title
    const apprenticeTitle = jobTitles.find((jt) => jt.title.toLowerCase() === 'salon apprentice');
    if (apprenticeTitle) {
      await prisma.stylist.update({
        where: { id: stylist.id },
        data: { jobTitleId: apprenticeTitle.id },
      });
    }

    console.log('✓ Created Aoife Hugueniot (Salon Apprentice)');
  }

  console.log('\n✓ Done! All stylists have been updated.');
  console.log('\nLogin credentials:');
  console.log('fiona.harris@salon.com / password');
  console.log('aoife.hugueniot@salon.com / password');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
