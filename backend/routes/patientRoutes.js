import { Router } from 'express';
import {
  listPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
} from '../controllers/patientController.js';
import { authRequired, requireRoles } from '../middleware/auth.js';

const router = Router();
router.use(authRequired);
router.get('/', listPatients);
router.get('/:id', getPatient);
router.post('/', requireRoles('admin', 'receptionist'), createPatient);
router.put('/:id', requireRoles('admin', 'receptionist'), updatePatient);
router.delete('/:id', requireRoles('admin'), deletePatient);
export default router;
