import { Request, Response } from 'express';
import { createCategorySchema } from '../schemas/schemas';
import {
  getDocuments,
  postDocument,
  findDocument,
  editDocument,
  deleteDocument,
} from './genericController';

const COLLECTION_NAME = 'categories';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await getDocuments(req, COLLECTION_NAME);
    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  const result = await postDocument(req, COLLECTION_NAME, createCategorySchema);

  if ('error' in result && result.error) {
    res.status(result.status).json({ error: result.error });
    return;
  }

  res.status(result.status).json(result);
};

export const findCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await findDocument(COLLECTION_NAME, id);

  if (result.status === 200) {
    res.status(result.status).json(result.data);
  } else {
    res.status(result.status).json({ message: result.message });
  }
};

export const editCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await editDocument(COLLECTION_NAME, id, req.body);
  res.status(result.status).json({ message: result.message });
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await deleteDocument(COLLECTION_NAME, id);
  res.status(result.status).json({ message: result.message });
};
