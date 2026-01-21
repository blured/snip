import { Router } from 'express';
import { body } from 'express-validator';
import * as appointmentsController from '../controllers/appointments.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

const createValidation = [
  body('clientId').notEmpty().withMessage('Client ID is required'),
  body('stylistId').notEmpty().withMessage('Stylist ID is required'),
  body('scheduledStart').isISO8601().withMessage('Valid scheduled start date is required'),
  body('scheduledEnd').isISO8601().withMessage('Valid scheduled end date is required'),
  body('serviceIds').isArray({ min: 1 }).withMessage('At least one service is required'),
];

// Routes
router.get('/', appointmentsController.getAll);
router.get('/:id', appointmentsController.getById);
router.post('/', validate(createValidation), appointmentsController.create);
router.put('/:id', appointmentsController.update);
router.patch('/:id/cancel', appointmentsController.cancel);
router.delete('/:id', authorize('ADMIN'), appointmentsController.remove);

export default router;
