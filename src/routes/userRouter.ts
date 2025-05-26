import { Router } from 'express';
import {
  fetchUsers,
  postUser,
  findUser,
  editUser,
  deleteUser
} from '../controllers/userController';

const router = Router();

router.route('/')
  .get(fetchUsers)
  .post(postUser);

router.route('/:id')
  .get(findUser)
  .put(editUser)
  .delete(deleteUser);

export default router;