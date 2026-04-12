import { Router } from 'express';
import {
  login, register, logout, refreshAccessToken, getCurrentUser,
} from '../controllers/auth';
import authMiddleware from '../middlewares/auth';
import { validateLoginBody, validateRegisterBody } from '../middlewares/validation';

const router = Router();

router.post('/login', validateLoginBody, login);
router.post('/register', validateRegisterBody, register);
router.get('/token', refreshAccessToken);
router.get('/logout', logout);
router.get('/user', authMiddleware, getCurrentUser);

export default router;
