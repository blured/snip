import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

// Generate unique invoice number
const generateInvoiceNumber = async (): Promise<string> => {
  const count = await prisma.invoice.count();
  const year = new Date().getFullYear();
  const number = String(count + 1).padStart(6, '0');
  return `INV-${year}-${number}`;
};

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { clientId, status } = req.query;

    const invoices = await prisma.invoice.findMany({
      where: {
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
                email: true,
              },
            },
          },
        },
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
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch invoices' });
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id: id as string },
      include: {
        client: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        appointment: {
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
          },
        },
        items: {
          include: {
            service: true,
          },
        },
        payments: true,
      },
    });

    if (!invoice) {
      res.status(404).json({ error: 'Not Found', message: 'Invoice not found' });
      return;
    }

    res.json(invoice);
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch invoice' });
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { clientId, appointmentId, items, tax, tip, discount, dueDate, notes } = req.body;

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => {
      return sum + (item.unitPrice * item.quantity);
    }, 0);

    const total = subtotal + (tax || 0) + (tip || 0) - (discount || 0);

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        clientId,
        appointmentId: appointmentId || null,
        subtotal,
        tax: tax || 0,
        tip: tip || 0,
        discount: discount || 0,
        total,
        status: 'DRAFT',
        dueDate: dueDate ? new Date(dueDate) : null,
        notes,
        items: {
          create: items.map((item: any) => ({
            serviceId: item.serviceId || null,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.unitPrice * item.quantity,
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
                email: true,
              },
            },
          },
        },
        items: {
          include: {
            service: true,
          },
        },
      },
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to create invoice' });
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { tax, tip, discount, status, dueDate, notes } = req.body;

    // Get current invoice
    const currentInvoice = await prisma.invoice.findUnique({
      where: { id: id as string },
      include: { items: true },
    });

    if (!currentInvoice) {
      res.status(404).json({ error: 'Not Found', message: 'Invoice not found' });
      return;
    }

    // Recalculate total if tax, tip, or discount changed
    const subtotal = currentInvoice.subtotal;
    const newTax = tax !== undefined ? tax : currentInvoice.tax;
    const newTip = tip !== undefined ? tip : currentInvoice.tip;
    const newDiscount = discount !== undefined ? discount : currentInvoice.discount;
    const total = subtotal + newTax + newTip - newDiscount;

    const invoice = await prisma.invoice.update({
      where: { id: id as string },
      data: {
        tax: newTax,
        tip: newTip,
        discount: newDiscount,
        total,
        status,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        notes,
      },
      include: {
        client: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        items: {
          include: {
            service: true,
          },
        },
        payments: true,
      },
    });

    res.json(invoice);
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to update invoice' });
  }
};

export const addPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { amount, method, transactionId, notes } = req.body;

    const payment = await prisma.payment.create({
      data: {
        invoiceId: id as string,
        amount: parseFloat(amount),
        method,
        transactionId,
        notes,
        processedAt: new Date(),
      },
    });

    // Check if invoice is fully paid
    const invoice = await prisma.invoice.findUnique({
      where: { id: id as string },
      include: { payments: true },
    });

    if (invoice) {
      const totalPaid = invoice.payments.reduce((sum: number, p: any) => sum + p.amount, 0);

      if (totalPaid >= invoice.total) {
        await prisma.invoice.update({
          where: { id: id as string },
          data: {
            status: 'PAID',
            paidAt: new Date(),
          },
        });
      }
    }

    res.status(201).json(payment);
  } catch (error) {
    console.error('Add payment error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to add payment' });
  }
};

export const markAsPaid = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const invoice = await prisma.invoice.update({
      where: { id: id as string },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
      include: {
        client: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        items: {
          include: {
            service: true,
          },
        },
        payments: true,
      },
    });

    res.json(invoice);
  } catch (error) {
    console.error('Mark as paid error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to mark invoice as paid' });
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.invoice.delete({
      where: { id: id as string },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to delete invoice' });
  }
};
