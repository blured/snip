import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

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
    const { specialties, bio, hourlyRate, commissionRate, active } = req.body;

    const stylist = await prisma.stylist.update({
      where: { id: id as string },
      data: {
        specialties,
        bio,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        commissionRate: commissionRate ? parseFloat(commissionRate) : undefined,
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
