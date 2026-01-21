import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { start, end, stylistId, clientId, status } = req.query;

    const appointments = await prisma.appointment.findMany({
      where: {
        ...(start && end && {
          scheduledStart: {
            gte: new Date(start as string),
            lte: new Date(end as string),
          },
        }),
        ...(stylistId && { stylistId: stylistId as string }),
        ...(clientId && { clientId: clientId as string }),
        ...(status && { status: status as any }),
      },
      include: {
        client: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
          },
        },
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
      orderBy: { scheduledStart: 'asc' },
    });

    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch appointments' });
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        client: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
          },
        },
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
        invoice: true,
      },
    });

    if (!appointment) {
      res.status(404).json({ error: 'Not Found', message: 'Appointment not found' });
      return;
    }

    res.json(appointment);
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch appointment' });
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { clientId, stylistId, scheduledStart, scheduledEnd, serviceIds, notes } = req.body;

    const start = new Date(scheduledStart);
    const end = new Date(scheduledEnd);

    // Check for scheduling conflicts
    const conflict = await prisma.appointment.findFirst({
      where: {
        stylistId,
        status: {
          notIn: ['CANCELLED', 'NO_SHOW'],
        },
        OR: [
          {
            AND: [
              { scheduledStart: { lte: start } },
              { scheduledEnd: { gt: start } },
            ],
          },
          {
            AND: [
              { scheduledStart: { lt: end } },
              { scheduledEnd: { gte: end } },
            ],
          },
          {
            AND: [
              { scheduledStart: { gte: start } },
              { scheduledEnd: { lte: end } },
            ],
          },
        ],
      },
    });

    if (conflict) {
      res.status(409).json({
        error: 'Conflict',
        message: 'This time slot is already booked for the selected stylist',
      });
      return;
    }

    // Get services to calculate prices
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
    });

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        clientId,
        stylistId,
        scheduledStart: start,
        scheduledEnd: end,
        status: 'SCHEDULED',
        notes,
        services: {
          create: services.map((service: any) => ({
            serviceId: service.id,
            price: service.basePrice,
          })),
        },
      },
      include: {
        client: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
          },
        },
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
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to create appointment' });
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { scheduledStart, scheduledEnd, status, notes, actualStart, actualEnd } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        scheduledStart: scheduledStart ? new Date(scheduledStart) : undefined,
        scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : undefined,
        actualStart: actualStart ? new Date(actualStart) : undefined,
        actualEnd: actualEnd ? new Date(actualEnd) : undefined,
        status,
        notes,
      },
      include: {
        client: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
          },
        },
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
    });

    res.json(appointment);
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to update appointment' });
  }
};

export const cancel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason,
      },
      include: {
        client: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
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
      },
    });

    res.json(appointment);
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to cancel appointment' });
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.appointment.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to delete appointment' });
  }
};
