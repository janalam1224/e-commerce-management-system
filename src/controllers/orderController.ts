import { Request, Response } from 'express';
import { createOrderSchema } from '../schemas/schemas';
import {
  getDocuments,
  postDocument,
  findDocument,
  editDocument,
  deleteDocument,
} from './genericController';
import db from '../firebaseAdmin';

const COLLECTION_NAME = 'orders';

export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await getDocuments(req, COLLECTION_NAME);
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

//Custom logic for orders
const orderCustomLogic = async (data: any): Promise<{ valid: boolean; message?: string; data?: any }> => {
  try {
    let totalAmount = 0;
    const updatedItems = [];

    for (const item of data.items) {
      const productSnap = await db.collection('products').doc(item.productId).get();
      if (!productSnap.exists) {
        return { valid: false, message: `Product with ID ${item.productId} not found` };
      }

      const product = productSnap.data();
      if (!product || product.stock < item.quantity) {
        return { valid: false, message: `Insufficient stock for product ${product?.name || item.productId}` };
      }

      const price = product.price || 0;
      const subTotal = price * item.quantity;
      totalAmount += subTotal;

      updatedItems.push({ ...item, price, subTotal });

      // Reduce stock
      await db.collection('products').doc(item.productId).update({
        stock: product.stock - item.quantity,
      });
    }

    data.total = totalAmount;
    data.items = updatedItems;
    data.status = 'pending';
    data.createdAt = new Date().toISOString();

    return { valid: true, data };
  } catch (err) {
    console.error('Order logic error:', err);
    return { valid: false, message: 'Failed to process order' };
  }
};

export const createOrder = async (req: Request, res: Response) => {
  const result = await postDocument(req, COLLECTION_NAME, createOrderSchema, orderCustomLogic);

  if ('error' in result && result.error) {
    res.status(result.status).json({ error: result.error });
    return;
  }

  res.status(result.status).json(result);
};

export const findOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await findDocument(COLLECTION_NAME, id);

  if (result.status === 200) {
    res.status(result.status).json(result.data);
  } else {
    res.status(result.status).json({ message: result.message });
  }
};

export const editOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await editDocument(COLLECTION_NAME, id, req.body);
  res.status(result.status).json({ message: result.message });
};

export const deleteOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await deleteDocument(COLLECTION_NAME, id);
  res.status(result.status).json({ message: result.message });
};
