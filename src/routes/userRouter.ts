import { Router } from 'express';
import {
  fetchUsers,
  createUser,
  findUser,
  editUser,
  deleteUser
} from '../controllers/userController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

router.route('/')
  .get(requireAuth, fetchUsers)
  .post(createUser);

router.route('/:id')
  .get(findUser)
  .put(editUser)
  .delete(deleteUser);

export default router;
