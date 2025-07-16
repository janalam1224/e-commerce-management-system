import { Router } from 'express';
import {
  logIn,
  signUp,
  googleAuth,
  resetPassword,
  getSetPassword,
  postSetPassword
} from '../controllers/authController';

const router = Router();

router.post('/login', logIn);
router.post('/signup', signUp);
router.post('/auth/google', googleAuth);
router.post('/reset-password', resetPassword);
router.route('/set-password')
  .get(getSetPassword)
  .post(postSetPassword);
import { requireAuth, requireRole } from '../middlewares/authMiddleware';

// Role-based access routes
router.get('/admin', requireAuth, requireRole('admin'), (req, res) => {
  res.json({ message: 'Welcome Admin' });
});

router.get('/seller', requireAuth, requireRole('seller'), (req, res) => {
  res.json({ message: 'Welcome Seller' });
});

router.get('/customer', requireAuth, requireRole('customer'), (req, res) => {
  res.json({ message: 'Welcome Customer' });
});

export default router;
