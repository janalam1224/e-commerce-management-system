import { Router } from 'express';
import {
  fetchOrders,
  createOrder,
  findOrder,
  editOrder,
  cancelOrder,
} from '../controllers/orderController';

import { requireAuth, requireRole } from '../middlewares/authMiddleware';

const router = Router();

router.route('/')
  .get(fetchOrders)
  .post(createOrder);

router.route('/:id')
  .get(findOrder)
  .put(editOrder)
  .delete(requireRole('admin'), cancelOrder);

export default router;
