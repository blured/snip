import { Response } from 'express';
import prisma from '../utils/prisma';
import { hashPassword } from '../utils/password';
import { AuthRequest } from '../middleware/auth';

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { user, photo, specialties, bio, hourlyRate, commissionRate, active } = req.body;

    // Generate a default password (in production, you'd want to email this to the user)
    const defaultPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await hashPassword(defaultPassword);

    // Create user with STYLIST role
    const newUser = await prisma.user.create({
      data: {
        email: user.email,
        passwordHash,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || null,
        role: 'STYLIST',
        active: active ?? true,
      },
    });

    // Create stylist profile
    const stylist = await prisma.stylist.create({
      data: {
        userId: newUser.id,
        photo: photo || null,
        specialties: specialties || null,
        bio: bio || null,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        commissionRate: commissionRate ? parseFloat(commissionRate) : null,
        active: active ?? true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            active: true,
          },
        },
      },
    });

    // In production, you would email the temporary password to the stylist
    // For now, log it (remove this in production!)
    console.log(`Temporary password for ${user.email}: ${defaultPassword}`);

    res.status(201).json(stylist);
  } catch (error: any) {
    console.error('Create stylist error:', error);

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Bad Request', message: 'Email already exists' });
      return;
    }

    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to create stylist' });
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const stylist = await prisma.stylist.findUnique({
      where: { id: id as string },
      select: { userId: true },
    });

    if (!stylist) {
      res.status(404).json({ error: 'Not Found', message: 'Stylist not found' });
      return;
    }

    // Delete user (cascade will delete stylist)
    await prisma.user.delete({
      where: { id: stylist.userId },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete stylist error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to delete stylist' });
  }
};

export const getAll = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stylists = await prisma.stylist.findMany({
      where: { active: true },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            active: true,
          },
        },
        stylistServices: {
          include: {
            service: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(stylists);
  } catch (error) {
    console.error('Get stylists error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch stylists' });
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { include } = req.query;

    const stylist = await prisma.stylist.findUnique({
      where: { id: id as string },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            active: true,
          },
        },
        stylistServices: {
          include: {
            service: true,
          },
        },
        ...(include === 'appointments' && {
          appointments: {
            include: {
              client: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                      phone: true,
                    },
                  },
                },
              },
              services: {
                include: {
                  service: true,
                },
              },
            },
            orderBy: {
              scheduledStart: 'desc',
            },
          },
        }),
        availability: true,
        timeOff: {
          where: {
            endDate: {
              gte: new Date(),
            },
          },
          orderBy: { startDate: 'asc' },
        },
      },
    });

    if (!stylist) {
      res.status(404).json({ error: 'Not Found', message: 'Stylist not found' });
      return;
    }

    res.json(stylist);
  } catch (error) {
    console.error('Get stylist error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch stylist' });
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { user, photo, specialties, bio, hourlyRate, commissionRate, active } = req.body;

    // First update the user if user data is provided
    if (user) {
      await prisma.user.update({
        where: { id: (await prisma.stylist.findUnique({ where: { id: id as string }, select: { userId: true } }))!.userId },
        data: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone || null,
        },
      });
    }

    // Then update the stylist profile
    const stylist = await prisma.stylist.update({
      where: { id: id as string },
      data: {
        photo: photo !== undefined ? photo : undefined,
        specialties,
        bio,
        hourlyRate: hourlyRate !== undefined ? (hourlyRate ? parseFloat(hourlyRate) : null) : undefined,
        commissionRate: commissionRate !== undefined ? (commissionRate ? parseFloat(commissionRate) : null) : undefined,
        active,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            active: true,
          },
        },
      },
    });

    res.json(stylist);
  } catch (error) {
    console.error('Update stylist error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to update stylist' });
  }
};

export const getAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const availability = await prisma.stylistAvailability.findMany({
      where: { stylistId: id as string, active: true },
      orderBy: { dayOfWeek: 'asc' },
    });

    res.json(availability);
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch availability' });
  }
};

export const setAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const availabilityData = req.body;

    // Delete existing availability
    await prisma.stylistAvailability.deleteMany({
      where: { stylistId: id as string },
    });

    // Create new availability
    await prisma.stylistAvailability.createMany({
      data: availabilityData.map((slot: any) => ({
        stylistId: id as string,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        active: true,
      })),
    });

    const updatedAvailability = await prisma.stylistAvailability.findMany({
      where: { stylistId: id as string },
      orderBy: { dayOfWeek: 'asc' },
    });

    res.json(updatedAvailability);
  } catch (error) {
    console.error('Set availability error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to set availability' });
  }
};

export const getTimeOff = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const timeOff = await prisma.stylistTimeOff.findMany({
      where: { stylistId: id as string },
      orderBy: { startDate: 'desc' },
    });

    res.json(timeOff);
  } catch (error) {
    console.error('Get time off error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch time off' });
  }
};

export const requestTimeOff = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { startDate, endDate, reason } = req.body;

    const timeOff = await prisma.stylistTimeOff.create({
      data: {
        stylistId: id as string,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        approved: false,
      },
    });

    res.status(201).json(timeOff);
  } catch (error) {
    console.error('Request time off error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to request time off' });
  }
};
