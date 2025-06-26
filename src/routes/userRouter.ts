import { Router } from 'express';
import {
  getUsers,
  createUser,
  findUser,
  editUser,
  deleteUser
} from '../controllers/userController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

router.route('/')
  .get(requireAuth, getUsers)
  .post(createUser); // 🔓 Allow unauthenticated user registration for now

router.route('/:id')
  .get(findUser)
  .put(editUser)
  .delete(deleteUser);

export default router;
