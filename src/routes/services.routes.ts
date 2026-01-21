import { Router } from 'express';
import { body } from 'express-validator';
import * as servicesController from '../controllers/services.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

const createValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('durationMinutes').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  body('basePrice').isFloat({ min: 0 }).withMessage('Base price must be a positive number'),
];

// Routes
router.get('/', servicesController.getAll);
router.get('/:id', servicesController.getById);
router.post('/', authorize('ADMIN'), validate(createValidation), servicesController.create);
router.put('/:id', authorize('ADMIN'), servicesController.update);
router.delete('/:id', authorize('ADMIN'), servicesController.remove);

export default router;
