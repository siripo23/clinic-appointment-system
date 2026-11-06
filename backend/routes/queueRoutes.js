import { Router } from 'express';
import {
  getTodayQueue,
  getDoctorQueue,
  checkIn,
  callPatient,
  startConsultation,
  completeConsultation,
  markNoShow,
  callNext,
} from '../controllers/queueController.js';
import { authRequired, requireRoles } from '../middleware/auth.js';

const router = Router();
router.use(authRequired);
router.get('/today', requireRoles('admin', 'receptionist'), getTodayQueue);
router.get('/doctor/:doctorId', requireRoles('admin', 'receptionist'), getDoctorQueue);
router.post('/check-in', requireRoles('admin', 'receptionist'), checkIn);
router.post('/call-next', requireRoles('admin', 'receptionist'), callNext);
router.patch('/:id/call', requireRoles('admin', 'receptionist'), callPatient);
router.patch('/:id/start-consultation', requireRoles('admin', 'receptionist'), startConsultation);
router.patch('/:id/complete', requireRoles('admin', 'receptionist'), completeConsultation);
router.patch('/:id/no-show', requireRoles('admin', 'receptionist'), markNoShow);
export default router;
