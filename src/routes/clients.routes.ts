import { Router } from 'express';
import * as clientsController from '../controllers/clients.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Routes
router.post('/', clientsController.create);
router.get('/', clientsController.getAll);
router.get('/:id', clientsController.getById);
router.put('/:id', clientsController.update);
router.delete('/:id', authorize('ADMIN'), clientsController.remove);
router.get('/:id/appointments', clientsController.getAppointments);
router.get('/:id/invoices', clientsController.getInvoices);

export default router;
