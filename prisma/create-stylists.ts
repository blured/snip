import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

const stylists = [
  {
    user: {
      email: 'sarah.johnson@salon.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '(555) 123-4501',
    },
    photo: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=400&fit=crop',
    jobTitle: 'Salon Owner',
    specialties: 'Precision cutting, color correction, bridal styling',
    bio: 'With 20 years of experience, Sarah founded our salon with a vision of creating a welcoming space where clients can transform their look and feel their best.',
    hourlyRate: 150,
    commissionRate: 0,
  },
  {
    user: {
      email: 'michael.chen@salon.com',
      firstName: 'Michael',
      lastName: 'Chen',
      phone: '(555) 123-4502',
    },
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    jobTitle: 'Creative Director',
    specialties: 'Avant-garde color techniques, editorial styling, trend forecasting',
    bio: 'Michael brings cutting-edge creativity from his work in fashion magazines and runway shows. His artistic vision shapes our salon\'s signature looks.',
    hourlyRate: 125,
    commissionRate: 0,
  },
  {
    user: {
      email: 'emily.rodriguez@salon.com',
      firstName: 'Emily',
      lastName: 'Rodriguez',
      phone: '(555) 123-4503',
    },
    photo: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=400&fit=crop',
    jobTitle: 'Master Stylist',
    specialties: 'Balayage, dimensional color, hair extensions',
    bio: 'Emily is an industry veteran known for her stunning color work and expertise in hair extensions. Her loyal clientele trusts her implicitly with their transformations.',
    hourlyRate: 100,
    commissionRate: 50,
  },
  {
    user: {
      email: 'david.kim@salon.com',
      firstName: 'David',
      lastName: 'Kim',
      phone: '(555) 123-4504',
    },
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    jobTitle: 'Senior Color Tech',
    specialties: 'Color correction, vivids, color melting',
    bio: 'David specializes in fixing color disasters and creating vibrant, fashion-forward colors. His patience and expertise ensure perfect results every time.',
    hourlyRate: 95,
    commissionRate: 45,
  },
  {
    user: {
      email: 'jessica.williams@salon.com',
      firstName: 'Jessica',
      lastName: 'Williams',
      phone: '(555) 123-4505',
    },
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    jobTitle: 'Senior Stylist',
    specialties: 'Textured hair, natural hair care, protective styles',
    bio: 'Jessica specializes in working with all hair textures and is passionate about helping clients embrace their natural beauty while achieving their style goals.',
    hourlyRate: 85,
    commissionRate: 45,
  },
  {
    user: {
      email: 'rachel.miller@salon.com',
      firstName: 'Rachel',
      lastName: 'Miller',
      phone: '(555) 123-4506',
    },
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    jobTitle: 'Hair Stylist',
    specialties: 'Women\'s cuts, blowouts, updos',
    bio: 'Rachel has a keen eye for what works best for each face shape and lifestyle. She specializes in creating versatile, easy-to-maintain styles.',
    hourlyRate: 75,
    commissionRate: 40,
  },
  {
    user: {
      email: 'james.thompson@salon.com',
      firstName: 'James',
      lastName: 'Thompson',
      phone: '(555) 123-4507',
    },
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
    jobTitle: 'Hair Colorist',
    specialties: 'Highlights, lowlights, single-process color',
    bio: 'James is a color specialist who creates beautiful, natural-looking blondes and rich, dimensional brunettes. His attention to detail is unmatched.',
    hourlyRate: 75,
    commissionRate: 40,
  },
  {
    user: {
      email: 'amanda.garcia@salon.com',
      firstName: 'Amanda',
      lastName: 'Garcia',
      phone: '(555) 123-4508',
    },
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
    jobTitle: 'Graduate Stylist',
      specialties: 'Trendy cuts, basic coloring, treatments',
    bio: 'A recently licensed stylist with a fresh perspective on current trends. Amanda brings enthusiasm and creativity to every appointment.',
    hourlyRate: 60,
    commissionRate: 35,
  },
  {
    user: {
      email: 'christopher.lee@salon.com',
      firstName: 'Christopher',
      lastName: 'Lee',
      phone: '(555) 123-4509',
    },
    photo: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop',
    jobTitle: 'Junior Stylist',
    specialties: 'Men\'s cuts, beard trims, classic styles',
    bio: 'Christopher excels at creating sharp, modern looks for men. He\'s building his skills and quickly becoming known for his impeccable fades.',
    hourlyRate: 55,
    commissionRate: 35,
  },
  {
    user: {
      email: 'sophia.martinez@salon.com',
      firstName: 'Sophia',
      lastName: 'Martinez',
      phone: '(555) 123-4510',
    },
    photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop',
    jobTitle: 'Junior Stylist',
    specialties: 'Blowouts, deep conditioning, basic cuts',
    bio: 'Sophia has a passion for healthy hair and specializes in treatments that restore and maintain shine and manageability.',
    hourlyRate: 55,
    commissionRate: 35,
  },
  {
    user: {
      email: 'olivia.brown@salon.com',
      firstName: 'Olivia',
      lastName: 'Brown',
      phone: '(555) 123-4511',
    },
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
    jobTitle: 'Junior Colorist',
    specialties: 'Root touch-ups, glossing treatments, single-process color',
    bio: 'Olivia is developing her color skills under the mentorship of our senior colorists. She has a great eye for complementary tones.',
    hourlyRate: 50,
    commissionRate: 30,
  },
  {
    user: {
      email: 'daniel.wilson@salon.com',
      firstName: 'Daniel',
      lastName: 'Wilson',
      phone: '(555) 123-4512',
    },
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    jobTitle: 'Salon Apprentice',
    specialties: 'Shampooing, sweeping, assisting senior stylists',
    bio: 'Daniel is currently in training and learning from our experienced team. He assists with various services to ensure a smooth client experience.',
    hourlyRate: 25,
    commissionRate: 20,
  },
];

async function main() {
  console.log('Creating 12 stylists...');

  // Get job titles to map to IDs
  const jobTitles = await prisma.jobTitle.findMany();
  const jobTitleMap = Object.fromEntries(jobTitles.map(jt => [jt.title, jt.id]));

  for (const stylist of stylists) {
    const defaultPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await hashPassword(defaultPassword);

    const user = await prisma.user.create({
      data: {
        email: stylist.user.email,
        passwordHash,
        firstName: stylist.user.firstName,
        lastName: stylist.user.lastName,
        phone: stylist.user.phone,
        role: 'STYLIST',
        active: true,
      },
    });

    const jobTitleId = jobTitleMap[stylist.jobTitle] || null;

    await prisma.stylist.create({
      data: {
        userId: user.id,
        photo: stylist.photo,
        jobTitleId,
        specialties: stylist.specialties,
        bio: stylist.bio,
        hourlyRate: stylist.hourlyRate,
        commissionRate: stylist.commissionRate,
        active: true,
      },
    });

    console.log(`✓ Created ${stylist.user.firstName} ${stylist.user.lastName} - ${stylist.jobTitle}`);
    console.log(`  Password: ${defaultPassword}`);
  }

  console.log('\n✓ Successfully created 12 stylists!');
}

main()
  .catch((e) => {
    console.error('Error creating stylists:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
