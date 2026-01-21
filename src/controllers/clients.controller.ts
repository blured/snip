import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const clients = await prisma.client.findMany({
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
        preferredStylist: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(clients);
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch clients' });
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const client = await prisma.client.findUnique({
      where: { id },
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
        preferredStylist: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        appointments: {
          include: {
            stylist: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
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
          orderBy: { scheduledStart: 'desc' },
        },
      },
    });

    if (!client) {
      res.status(404).json({ error: 'Not Found', message: 'Client not found' });
      return;
    }

    res.json(client);
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch client' });
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { dateOfBirth, preferredStylistId, notes, allergies, preferredProducts } = req.body;

    const client = await prisma.client.update({
      where: { id },
      data: {
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        preferredStylistId: preferredStylistId || null,
        notes,
        allergies,
        preferredProducts,
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

    res.json(client);
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to update client' });
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const client = await prisma.client.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!client) {
      res.status(404).json({ error: 'Not Found', message: 'Client not found' });
      return;
    }

    // Delete user (cascade will delete client)
    await prisma.user.delete({
      where: { id: client.userId },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to delete client' });
  }
};

export const getAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const appointments = await prisma.appointment.findMany({
      where: { clientId: id },
      include: {
        stylist: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
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
      orderBy: { scheduledStart: 'desc' },
    });

    res.json(appointments);
  } catch (error) {
    console.error('Get client appointments error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch appointments' });
  }
};

export const getInvoices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const invoices = await prisma.invoice.findMany({
      where: { clientId: id },
      include: {
        items: {
          include: {
            service: true,
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(invoices);
  } catch (error) {
    console.error('Get client invoices error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch invoices' });
  }
};
