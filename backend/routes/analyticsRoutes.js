import { Router } from 'express';
import {
  appointmentsByStatus,
  appointmentsByDoctor,
  dailyTrends,
  averageWaitingTime,
} from '../controllers/analyticsController.js';
import { authRequired, requireRoles } from '../middleware/auth.js';

const router = Router();
router.use(authRequired, requireRoles('admin'));
router.get('/appointments-by-status', appointmentsByStatus);
router.get('/appointments-by-doctor', appointmentsByDoctor);
router.get('/daily-trends', dailyTrends);
router.get('/waiting-time', averageWaitingTime);
export default router;
