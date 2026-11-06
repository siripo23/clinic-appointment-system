import { Router } from 'express';
import { login, me } from '../controllers/authController.js';
import { authRequired, loadUser } from '../middleware/auth.js';

const router = Router();
router.post('/login', login);
router.get('/me', authRequired, loadUser, me);
export default router;
