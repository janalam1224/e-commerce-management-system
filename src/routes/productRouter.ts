import { Router } from 'express';
import upload from '../middlewares/upload';
import {
  getProducts,
  findProduct,
  editProduct,
  deleteProduct,
  createProduct,
} from '../controllers/productController';

import { requireAuth } from '../middlewares/authMiddleware'; // ✅ import it

const router = Router();

router.route('/')
  .get(requireAuth, getProducts) // ✅ protect as needed
  .post(
    requireAuth,                // ✅ protect route
    upload.array('images', 5),
    createProduct
  );

router.route('/:id')
  .get(requireAuth, findProduct) // ✅ protect as needed
  .put(
    requireAuth,
    upload.array('images', 5),
    editProduct
  )
  .delete(requireAuth, deleteProduct); // ✅

export default router;
