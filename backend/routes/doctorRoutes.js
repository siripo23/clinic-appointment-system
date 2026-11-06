import { Router } from 'express';
import {
  listDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from '../controllers/doctorController.js';
import { authRequired, requireRoles } from '../middleware/auth.js';

const router = Router();
router.use(authRequired);
router.get('/', listDoctors);
router.get('/:id', getDoctor);
router.post('/', requireRoles('admin'), createDoctor);
router.put('/:id', requireRoles('admin'), updateDoctor);
router.delete('/:id', requireRoles('admin'), deleteDoctor);
export default router;
