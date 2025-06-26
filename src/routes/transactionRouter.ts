import { Router } from 'express';
import {
  getTransactions,
  createTransaction,
  findTransaction,
  editTransaction,
  deleteTransaction,
} from '../controllers/transactionController';

import { requireAuth, requireRole } from '../middlewares/authMiddleware';

const router = Router();

router.use(requireAuth);

router.route('/')
  .get(getTransactions)
  .post(createTransaction);

router.route('/:id')
  .get(findTransaction)
  .put(editTransaction)
  .delete(requireRole('admin'), deleteTransaction);

export default router;
