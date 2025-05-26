import { Router } from 'express';
import { postLogin, postSignup } from '../controllers/authController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

router.route('/login').post(postLogin);
router.route('/signup').post(postSignup);


router.get('/admin', requireAuth, (req, res) => {
  res.json({ message: "Welcome Admin" });
});

router.get('/editor', requireAuth, (req, res) => {
  res.json({ message: "Welcome Editor" });
});

router.get('/user', requireAuth, (req, res) => {
  res.json({ message: "Welcome User" });
});

export default router;