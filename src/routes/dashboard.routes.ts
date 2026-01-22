import { Router } from 'express';
import { getStats, getUpcomingAppointments } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/stats', getStats);
router.get('/upcoming', getUpcomingAppointments);

export default router;
