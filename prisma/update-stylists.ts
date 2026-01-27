import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const stylistsToUpdate = [
  {
    firstName: 'Fiona',
    lastName: 'Harris',
    email: 'fiona.yeates@salon.com',
    newEmail: 'fiona.harris@salon.com',
    jobTitle: 'Owner, Senior Stylist',
    bio: 'Fiona is the owner and a senior stylist with expertise in cuts, blowdrys, and colour work. She specialises as a colour master and highlighting expert.',
    specialties: 'Cuts, Blowdrys, Colour master, Highlighting',
  },
  {
    firstName: 'Aoife',
    lastName: 'Hugueniot',
    email: 'aoife.hugueniot@salon.com',
    jobTitle: 'Salon Apprentice',
    bio: 'Aoife is our salon apprentice, assisting with daily operations and learning from our senior stylists.',
    specialties: 'Hair washing, Reception, Runner',
    hourlyRate: 15,
    commissionRate: 0.15,
  },
  {
    firstName: 'Barbara',
    lastName: 'Dargan',
    email: 'barbara.dargan@salon.com',
    jobTitle: 'Senior Stylist',
    bio: 'Barbara is a senior stylist specialising in cut & blowdry, colour work, and highlighting. She also does gents cuts and is an expert in up styles and hair extensions.',
    specialties: 'Cut & blowdry, Colour technician, Highlighting, Gents cuts, Up styles, Hair extensions',
  },
  {
    firstName: 'Sandy',
    lastName: 'Vaickauska',
    email: 'sandy.vaickauska@salon.com',
    jobTitle: 'Junior Stylist',
    bio: 'Sandy is a junior stylist skilled in blow drying, colour, and highlighting. She specialises in creating beautiful up styles for any occasion.',
    specialties: 'Blow drying, Colour, Highlighting, Up styles',
  },
  {
    firstName: 'Anne',
    lastName: 'Yeates',
    email: 'anne.yeates@salon.com',
    jobTitle: 'Owner, Senior Stylist',
    bio: 'Anne is the owner and a senior stylist with expertise in cuts, blowdrys, colour, and perming. She specialises in creating stunning up styles for any occasion.',
    specialties: 'Cuts, Blowdrys, Colour, Perming, Up styles',
  },
  {
    firstName: 'Sharon',
    lastName: "O'Connor",
    email: 'sharon.oconnor@salon.com',
    jobTitle: 'Senior Stylist',
    bio: 'Sharon is a senior stylist with years of experience in all aspects of hair care, from cuts and colour to styling and treatments.',
    specialties: 'Cuts, Blowdrys, Colour, Styling, Treatments',
  },
];

async function main() {
  console.log('Updating stylists...\n');

  // Get all job titles
  const jobTitles = await prisma.jobTitle.findMany();

  for (const stylistData of stylistsToUpdate) {
    try {
      // Find user by email (or new email if updating)
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: stylistData.email },
            ...(stylistData.newEmail ? [{ email: stylistData.newEmail }] : []),
          ],
        },
      });

      if (!user) {
        console.log(`✗ ${stylistData.firstName} ${stylistData.lastName} not found (email: ${stylistData.email})`);
        continue;
      }

      // Find stylist profile
      const stylist = await prisma.stylist.findFirst({
        where: { userId: user.id },
        include: { user: true },
      });

      if (!stylist) {
        console.log(`✗ No stylist profile found for ${stylistData.firstName} ${stylistData.lastName}`);
        continue;
      }

      // Update user if changing name/email
      await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(stylistData.newEmail && { email: stylistData.newEmail }),
          firstName: stylistData.firstName,
          lastName: stylistData.lastName,
        },
      });

      // Update stylist profile
      await prisma.stylist.update({
        where: { id: stylist.id },
        data: {
          bio: stylistData.bio,
          specialties: stylistData.specialties,
          ...(stylistData.hourlyRate && { hourlyRate: stylistData.hourlyRate }),
          ...(stylistData.commissionRate && { commissionRate: stylistData.commissionRate }),
        },
      });

      // Update job title if needed
      const jobTitle = jobTitles.find(
        (jt) => jt.title.toLowerCase() === stylistData.jobTitle.toLowerCase()
      );

      if (jobTitle) {
        await prisma.stylist.update({
          where: { id: stylist.id },
          data: { jobTitleId: jobTitle.id },
        });
      }

      const oldName = `${stylist.user.firstName} ${stylist.user.lastName}`;
      const newName = `${stylistData.firstName} ${stylistData.lastName}`;
      console.log(`✓ Updated: ${oldName} → ${newName} (${stylistData.jobTitle})`);
    } catch (error) {
      console.error(`✗ Failed to update ${stylistData.firstName} ${stylistData.lastName}:`, error);
    }
  }

  console.log('\nDone! Stylists have been updated.');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
