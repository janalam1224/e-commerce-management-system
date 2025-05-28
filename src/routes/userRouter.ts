import { Router } from 'express';
import {
  getUsers,
  createUser,
  findUser,
  editUser,
  deleteUser
} from '../controllers/userController';

const router = Router();

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .get(findUser)
  .put(editUser)
  .delete(deleteUser);

export default router;