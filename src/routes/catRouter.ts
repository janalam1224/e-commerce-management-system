import { Router } from 'express';
import {
  getCategories,
  createCategory,
  findCategory,
  editCategory,
  deleteCategory,
} from '../controllers/catController';

import { requireAuth, requireRole } from '../middlewares/authMiddleware';

const router = Router();

router.use(requireAuth);

router.route('/')
  .get(getCategories)
  .post(createCategory);

router.route('/:id')
  .get(findCategory)
  .put(editCategory)
  .delete(requireRole('admin'), deleteCategory);

export default router;
