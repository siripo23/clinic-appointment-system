import { Router } from 'express';
import {
  listAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment,
} from '../controllers/appointmentController.js';
import { authRequired, requireRoles } from '../middleware/auth.js';

const router = Router();
router.use(authRequired);
router.get('/', listAppointments);
router.get('/:id', getAppointment);
router.post('/', requireRoles('admin', 'receptionist'), createAppointment);
router.put('/:id', requireRoles('admin', 'receptionist'), updateAppointment);
router.patch('/:id/cancel', requireRoles('admin', 'receptionist'), cancelAppointment);
export default router;
