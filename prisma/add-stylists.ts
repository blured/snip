import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const stylistsToAdd = [
  {
    firstName: 'Barbara',
    lastName: 'Dargan',
    email: 'barbara.dargan@salon.com',
    jobTitle: 'Senior Stylist',
    photo: 'https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?w=400&h=400&fit=crop&crop=face',
    bio: 'Barbara is a senior stylist with over 15 years of experience in precision cutting, coloring, and styling. She specializes in balayage, color correction, and modern cutting techniques.',
    specialties: 'Precision cutting, Balayage, Color correction, Modern styling',
    commissionRate: 0.40,
    hourlyRate: 35,
  },
  {
    firstName: 'Sandy',
    lastName: 'Vaickauska',
    email: 'sandy.vaickauska@salon.com',
    jobTitle: 'Junior Stylist',
    photo: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=400&fit=crop&crop=face',
    bio: 'Sandy is a talented junior stylist with a passion for creative color and contemporary cuts. She brings fresh energy and stays current with the latest trends.',
    specialties: 'Creative color, Contemporary cuts, Trending styles',
    commissionRate: 0.30,
    hourlyRate: 25,
  },
  {
    firstName: 'Anne',
    lastName: 'Yeates',
    email: 'anne.yeates@salon.com',
    jobTitle: 'Owner, Senior Stylist',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    bio: 'Anne is the salon owner and a senior stylist with 20+ years of experience. She is an expert in all aspects of hair care, from precision cuts to advanced color techniques and bridal styling.',
    specialties: 'All aspects of hair care, Precision cuts, Advanced color, Bridal styling',
    commissionRate: 0.50,
    hourlyRate: 45,
  },
  {
    firstName: 'Sharon',
    lastName: "O'Connor",
    email: 'sharon.oconnor@salon.com',
    jobTitle: 'Senior Stylist',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
    bio: 'Sharon is a senior stylist known for her expertise in hair transformations and color work. She has a loyal clientele and specializes in making clients look and feel their best.',
    specialties: 'Hair transformations, Color specialist, Highlights, Lowlights',
    commissionRate: 0.40,
    hourlyRate: 35,
  },
];

async function main() {
  console.log('Adding new stylists...');

  // Hash password for all users
  const passwordHash = await bcrypt.hash('password', 10);

  // Get job titles to find IDs
  const jobTitles = await prisma.jobTitle.findMany();

  for (const stylistData of stylistsToAdd) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: stylistData.email },
      });

      if (existingUser) {
        console.log(`Skipping ${stylistData.email} - already exists`);
        continue;
      }

      // Create user
      const user = await prisma.user.create({
        data: {
          email: stylistData.email,
          passwordHash,
          firstName: stylistData.firstName,
          lastName: stylistData.lastName,
          phone: '555-0100',
          role: 'STYLIST',
          active: true,
        },
      });

      // Create stylist profile
      const stylist = await prisma.stylist.create({
        data: {
          userId: user.id,
          photo: stylistData.photo,
          bio: stylistData.bio,
          specialties: stylistData.specialties,
          hourlyRate: stylistData.hourlyRate,
          commissionRate: stylistData.commissionRate,
          active: true,
        },
      });

      // Find and assign job title
      const jobTitle = jobTitles.find(
        (jt) => jt.title.toLowerCase() === stylistData.jobTitle.toLowerCase()
      );

      if (jobTitle) {
        await prisma.stylist.update({
          where: { id: stylist.id },
          data: { jobTitleId: jobTitle.id },
        });
      }

      console.log(`✓ Created stylist: ${stylistData.firstName} ${stylistData.lastName} (${stylistData.jobTitle})`);
    } catch (error) {
      console.error(`✗ Failed to create ${stylistData.firstName} ${stylistData.lastName}:`, error);
    }
  }

  console.log('\nDone! New stylists have been added.');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
