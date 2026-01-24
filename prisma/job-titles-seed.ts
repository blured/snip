import { PrismaClient, CareerStage } from '@prisma/client';

const prisma = new PrismaClient();

const jobTitles = [
  // Entry Level
  {
    careerStage: CareerStage.ENTRY_LEVEL,
    title: 'Salon Apprentice',
    primaryFocus: 'Formal training, salon maintenance, and learning.',
  },
  {
    careerStage: CareerStage.ENTRY_LEVEL,
    title: 'Salon Assistant',
    primaryFocus: 'Shampooing, cleaning, and assisting senior staff.',
  },
  {
    careerStage: CareerStage.ENTRY_LEVEL,
    title: 'Shampoo Technician',
    primaryFocus: 'Scalp massage, treatments, and backwash management.',
  },

  // Early Pro
  {
    careerStage: CareerStage.EARLY_PRO,
    title: 'Graduate Stylist',
    primaryFocus: 'Newly licensed; performing basic cuts and colors.',
  },
  {
    careerStage: CareerStage.EARLY_PRO,
    title: 'Junior Stylist',
    primaryFocus: 'Building speed and confidence with a growing client list.',
  },
  {
    careerStage: CareerStage.EARLY_PRO,
    title: 'Junior Colorist',
    primaryFocus: 'Specializing in basic tinting and root touch-ups.',
  },

  // Mid-Level
  {
    careerStage: CareerStage.MID_LEVEL,
    title: 'Hair Stylist',
    primaryFocus: 'Fully qualified; proficient in all standard services.',
  },
  {
    careerStage: CareerStage.MID_LEVEL,
    title: 'Hair Colorist',
    primaryFocus: 'Expert in formulation, foiling, and color theory.',
  },

  // Advanced
  {
    careerStage: CareerStage.ADVANCED,
    title: 'Senior Stylist',
    primaryFocus: 'High-level technical skills and loyal clientele.',
  },
  {
    careerStage: CareerStage.ADVANCED,
    title: 'Senior Color Tech',
    primaryFocus: 'Specialist in color correction and complex trends.',
  },
  {
    careerStage: CareerStage.ADVANCED,
    title: 'Master Stylist',
    primaryFocus: 'Industry veteran; expert in precision and styling.',
  },

  // Leadership
  {
    careerStage: CareerStage.LEADERSHIP,
    title: 'Creative Director',
    primaryFocus: 'Branding, trend-setting, and artistic vision.',
  },
  {
    careerStage: CareerStage.LEADERSHIP,
    title: 'Art Director',
    primaryFocus: 'Training staff and maintaining salon signature looks.',
  },
  {
    careerStage: CareerStage.LEADERSHIP,
    title: 'Salon Manager',
    primaryFocus: 'Business operations, scheduling, and staff management.',
  },

  // Ownership
  {
    careerStage: CareerStage.OWNERSHIP,
    title: 'Principal Stylist',
    primaryFocus: 'The lead professional, often the face of the brand.',
  },
  {
    careerStage: CareerStage.OWNERSHIP,
    title: 'Salon Owner',
    primaryFocus: 'Business strategy, finance, and ultimate accountability.',
  },
];

async function main() {
  console.log('Starting job titles seed...');

  // Delete existing job titles
  await prisma.jobTitle.deleteMany();

  // Create job titles
  for (const jobTitle of jobTitles) {
    await prisma.jobTitle.create({
      data: jobTitle,
    });
  }

  console.log(`Created ${jobTitles.length} job titles.`);

  // List all created job titles
  const allJobTitles = await prisma.jobTitle.findMany({
    orderBy: [
      { careerStage: 'asc' },
      { title: 'asc' },
    ],
  });

  console.log('\nJob Titles:');
  console.log('Career Stage | Title | Primary Focus');
  console.log('-------------|------|--------------');
  for (const jt of allJobTitles) {
    console.log(`${jt.careerStage} | ${jt.title} | ${jt.primaryFocus}`);
  }
}

main()
  .catch((e) => {
    console.error('Error seeding job titles:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
