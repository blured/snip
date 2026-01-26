import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's appointments
    const todayAppointments = await prisma.appointment.count({
      where: {
        scheduledStart: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Active clients - count all clients (users with a Client profile)
    const activeClients = await prisma.client.count();

    // Active stylists
    const activeStylists = await prisma.stylist.count({
      where: { active: true },
    });

    // Monthly revenue - current month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    const paidInvoices = await prisma.invoice.findMany({
      where: {
        status: 'PAID',
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        total: true,
      },
    });

    const monthlyRevenue = paidInvoices.reduce(
      (sum: number, invoice: { total: number }) => sum + invoice.total,
      0
    );

    res.json({
      todayAppointments,
      activeClients,
      activeStylists,
      monthlyRevenue,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

export const getUpcomingAppointments = async (_req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();

    const appointments = await prisma.appointment.findMany({
      where: {
        scheduledStart: {
          gte: now,
        },
      },
      include: {
        client: {
          include: {
            user: true,
          },
        },
        stylist: {
          include: {
            user: true,
          },
        },
        services: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        scheduledStart: 'asc',
      },
      take: 5,
    });

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming appointments' });
  }
};
