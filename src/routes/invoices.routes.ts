import { Router } from 'express';
import { body } from 'express-validator';
import * as invoicesController from '../controllers/invoices.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

const createValidation = [
  body('clientId').notEmpty().withMessage('Client ID is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
];

const paymentValidation = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('method').isIn(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'DIGITAL_WALLET', 'OTHER']),
];

// Routes
router.get('/', invoicesController.getAll);
router.get('/:id', invoicesController.getById);
router.post('/', authorize('ADMIN', 'RECEPTIONIST'), validate(createValidation), invoicesController.create);
router.put('/:id', authorize('ADMIN', 'RECEPTIONIST'), invoicesController.update);
router.post('/:id/payments', authorize('ADMIN', 'RECEPTIONIST'), validate(paymentValidation), invoicesController.addPayment);
router.patch('/:id/paid', authorize('ADMIN', 'RECEPTIONIST'), invoicesController.markAsPaid);
router.delete('/:id', authorize('ADMIN'), invoicesController.remove);

export default router;
