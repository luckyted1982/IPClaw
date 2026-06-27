import express from 'express';
import { register, login, getProfile, updateProfile, changePassword, loginWithPhone, sendVerificationCode } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/login-phone', loginWithPhone);
router.post('/send-code', sendVerificationCode);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, changePassword);

export default router;
