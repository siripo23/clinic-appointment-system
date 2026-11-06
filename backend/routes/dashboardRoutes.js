import { Router } from 'express';
import { getStats } from '../controllers/dashboardController.js';
import { authRequired, requireRoles } from '../middleware/auth.js';

const router = Router();
router.get('/stats', authRequired, requireRoles('admin', 'receptionist'), getStats);
export default router;
