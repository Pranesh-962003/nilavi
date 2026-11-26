import express from 'express';
import { LoginLimiter, protectAdmin } from '../middleware/auth.js';
import { GetUser, Login, logoutAdmin, register } from '../controller/auth.js';

const router = express.Router();

router.post('/register', LoginLimiter, register);
router.post('/login', LoginLimiter, Login);
router.get('/verify', protectAdmin, GetUser);
router.get('/get-user', protectAdmin, GetUser);
router.post('/logout', logoutAdmin);

export default router;
