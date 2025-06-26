import { Router } from 'express';
import {
  postLogin,
  postSignup,
  googleAuth,
  resetPassword,
  getSetPassword,
  postSetPassword
} from '../controllers/authController';
import { requireAuth, requireRole } from '../middlewares/authMiddleware';

const router = Router();

// Public auth routes
router.post('/login', postLogin);
router.post('/signup', postSignup);
router.post('/auth/google', googleAuth);
router.post('/reset-password', resetPassword);
router.route('/set-password')
  .get(getSetPassword)
  .post(postSetPassword);

// Role-based protected routes
router.get('/admin', requireAuth, requireRole('admin'), (req, res) => {
  res.json({ message: "Welcome Admin" });
});

router.get('/seller', requireAuth, requireRole('seller'), (req, res) => {
  res.json({ message: "Welcome Seller" });
});

router.get('/customer', requireAuth, requireRole('customer'), (req, res) => {
  res.json({ message: "Welcome Customer" });
});

export default router;
