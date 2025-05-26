import { Router } from 'express';
import {
  getProducts,
  createProduct,
  findProduct,
  editProduct,
  deleteProduct,
} from '../controllers/productController';

const router = Router();

router.route('/')
  .get(getProducts)
  .post(createProduct);

router.route('/:id')
  .get(findProduct)
  .put(editProduct)
  .delete(deleteProduct);

export default router;