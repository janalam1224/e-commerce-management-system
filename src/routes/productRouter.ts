import { Router } from 'express';
import {
  getProducts,
  findProduct,
  editProduct,
  deleteProduct,
  createProduct,
} from '../controllers/productController';
import { requireAuth, requireRole } from '../middlewares/authMiddleware';

const router = Router();

router.route('/')
  .get(getProducts)
  .post(...createProduct); // createProduct is an array of middleware

router.route('/:id')
  .get(findProduct)
  .put(editProduct)
  .delete(deleteProduct);

export default router;
