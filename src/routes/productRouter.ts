import { Router } from 'express';
import {
  getProducts,
  createProduct,
  findProduct,
  editProduct,
  deleteProduct,
} from '../controllers/productController';

import { requireAuth, requireRole } from '../middlewares/authMiddleware';

const router = Router();

router.use(requireAuth);

router.route('/')
  .get(getProducts)
  .post(createProduct);

router.route('/:id')
  .get(findProduct)
  .put(editProduct)
  .delete(requireRole('admin'), deleteProduct);

export default router;

