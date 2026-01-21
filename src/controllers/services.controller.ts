import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, active } = req.query;

    const services = await prisma.service.findMany({
      where: {
        ...(category && { category: category as string }),
        ...(active !== undefined && { active: active === 'true' }),
      },
      orderBy: { name: 'asc' },
    });

    res.json(services);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch services' });
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id: id as string },
    });

    if (!service) {
      res.status(404).json({ error: 'Not Found', message: 'Service not found' });
      return;
    }

    res.json(service);
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch service' });
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, category, durationMinutes, basePrice } = req.body;

    const service = await prisma.service.create({
      data: {
        name,
        description,
        category,
        durationMinutes: parseInt(durationMinutes),
        basePrice: parseFloat(basePrice),
        active: true,
      },
    });

    res.status(201).json(service);
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to create service' });
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, category, durationMinutes, basePrice, active } = req.body;

    const service = await prisma.service.update({
      where: { id: id as string },
      data: {
        name,
        description,
        category,
        durationMinutes: durationMinutes ? parseInt(durationMinutes) : undefined,
        basePrice: basePrice ? parseFloat(basePrice) : undefined,
        active,
      },
    });

    res.json(service);
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to update service' });
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Soft delete by marking as inactive
    await prisma.service.update({
      where: { id: id as string },
      data: { active: false },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to delete service' });
  }
};
