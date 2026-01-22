import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's appointments
    const todayAppointments = await prisma.appointment.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Active clients
    const activeClients = await prisma.client.count({
      where: { active: true },
    });

    // Active stylists
    const activeStylists = await prisma.stylist.count({
      where: { active: true },
    });

    // Monthly revenue - current month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const paidInvoices = await prisma.invoice.findMany({
      where: {
        status: 'PAID',
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        totalAmount: true,
      },
    });

    const monthlyRevenue = paidInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);

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

export const getUpcomingAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();

    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: now,
        },
      },
      include: {
        client: true,
        stylist: true,
        services: true,
      },
      orderBy: {
        date: 'asc',
      },
      take: 5,
    });

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming appointments' });
  }
};
