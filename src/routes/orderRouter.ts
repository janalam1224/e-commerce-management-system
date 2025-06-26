import express from 'express';
import {
  getOrders,
  createOrder,
  findOrder,
  editOrder,
  deleteOrder,
} from '../controllers/orderController';

const router = express.Router();

router.route('/')
.get( getOrders)
.post(createOrder);

router.route('/:id')
.get( findOrder)
.put(editOrder)
.delete(deleteOrder);

export default router;
