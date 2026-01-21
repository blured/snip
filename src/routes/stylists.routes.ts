import { Router } from 'express';
import * as stylistsController from '../controllers/stylists.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/', stylistsController.getAll);
router.get('/:id', stylistsController.getById);
router.put('/:id', authorize('ADMIN', 'STYLIST'), stylistsController.update);
router.get('/:id/availability', stylistsController.getAvailability);
router.post('/:id/availability', authorize('ADMIN', 'STYLIST'), stylistsController.setAvailability);
router.get('/:id/timeoff', stylistsController.getTimeOff);
router.post('/:id/timeoff', authorize('ADMIN', 'STYLIST'), stylistsController.requestTimeOff);

export default router;
