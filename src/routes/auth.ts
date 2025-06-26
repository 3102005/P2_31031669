import express from 'express';
import AuthController from '../controllers/AuthController';
import { requireAdmin, redirectIfAuthenticated } from '../middleware/auth';

const router = express.Router();
const authController = new AuthController();

// Login routes
router.get('/login', redirectIfAuthenticated, authController.renderLogin);
router.post('/login', authController.validateLogin, authController.login);

// Logout route
router.post('/logout', authController.logout);
router.get('/logout', authController.logout);

// Register routes (admin only)
router.get('/register', requireAdmin, authController.renderRegister);
router.post('/register', requireAdmin, authController.validateRegister, authController.register);

// Google OAuth routes
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google', authController.googleAuth);
  router.get('/google/callback', authController.googleCallback);
  // Alternative callback endpoint for production compatibility
  router.get('/callback', authController.googleCallback);
}

export default router;
