import { Request, Response } from 'express';
import { createBillSchema } from '../schemas/schemas';
import db from '../firebaseAdmin';
import {
  getDocuments,
  postDocument,
  findDocument,
  editDocument,
  deleteDocument
} from './genericController';

const COLLECTION_NAME = 'bills';

//Utility:Check if user is a customer
const isCustomer = async (userId: string): Promise<boolean> => {
  try {
    const userSnap = await db.collection('users').doc(userId).get();
    const userData = userSnap.data();
    return userSnap.exists && userData?.role === 'customer';
  } catch (err) {
    console.error('Error checking user role:', err);
    return false;
  }
};

// === Custom Logic for Bill Creation ===
const billCustomLogic = async (data: any) => {
  try {
    
    const validCustomer = await isCustomer(data.userId);
    if (!validCustomer) {
      return { valid: false, message: 'Invalid user: Only customers can be billed' };
    }

    const orderSnap = await db.collection('orders').doc(data.orderId).get();
    if (!orderSnap.exists) {
      return { valid: false, message: 'Associated order not found' };
    }

    const orderData = orderSnap.data();
    const subtotal = orderData?.total || 0;
    const taxRate = 0.05;
    const tax = subtotal * taxRate;
    const discount = data.discount || 0;
    const total = subtotal + tax - discount;

    return {
      valid: true,
      data: {
        ...data,
        subtotal,
        tax,
        discount,
        total,
        createdAt: new Date().toISOString()
      }
    };
  } catch (err) {
    console.error('Error in bill custom logic:', err);
    return { valid: false, message: 'Error processing bill logic' };
  }
};

//Endpoints
export const getBills = async (req: Request, res: Response) => {
  try {
    const bills = await getDocuments(req, COLLECTION_NAME);
    res.status(200).json({ bills });
  } catch (error) {
    console.error('Error getting bills:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

export const createBill = async (req: Request, res: Response) => {
  const result = await postDocument(req, COLLECTION_NAME, createBillSchema, billCustomLogic);

  if ('error' in result && result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.status(result.status).json(result);
};

export const findBill = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await findDocument(COLLECTION_NAME, id);
  res.status(result.status).json(
    result.status === 200 ? result.data : { message: result.message }
  );
};

export const editBill = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await editDocument(COLLECTION_NAME, id, req.body);
  res.status(result.status).json({ message: result.message });
};

export const deleteBill = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await deleteDocument(COLLECTION_NAME, id);
  res.status(result.status).json({ message: result.message });
};
