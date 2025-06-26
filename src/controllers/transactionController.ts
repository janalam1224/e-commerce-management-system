import { Request, Response } from 'express';
import { createTransactionSchema } from '../schemas/schemas';
import {
  getDocuments,
  postDocument,
  findDocument,
  editDocument,
  deleteDocument,
} from './genericController';

const COLLECTION_NAME = 'transactions';

// Fetch all transactions
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await getDocuments(req, COLLECTION_NAME);
    res.status(200).json({ transactions });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// Create a new transaction
export const createTransaction = async (req: Request, res: Response) => {
  const result = await postDocument(req, COLLECTION_NAME, createTransactionSchema);

  if ('error' in result && result.error) {
    res.status(result.status).json({ error: result.error });
    return;
  }

  res.status(result.status).json(result);
};

// Find a transaction by ID
export const findTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await findDocument(COLLECTION_NAME, id);

  if (result.status === 200) {
    res.status(result.status).json(result.data);
  } else {
    res.status(result.status).json({ message: result.message });
  }
};

// Edit an existing transaction by ID
export const editTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await editDocument(COLLECTION_NAME, id, req.body);
  res.status(result.status).json({ message: result.message });
};

// Delete a transaction by ID
export const deleteTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await deleteDocument(COLLECTION_NAME, id);
  res.status(result.status).json({ message: result.message });
};
