import { Request, Response } from 'express';
import { createCategorySchema } from '../schemas/schemas';
import {
  getDocuments,
  postDocument,
  findDocument,
  editDocument,
  deleteDocument,
} from './genericController';
import { DocumentData, PostDocumentResponse } from '../types';
import { db } from '../firebaseAdmin';

const COLLECTION_NAME = 'categories';

export const getCategories = async(req:Request,res:Response):Promise<any> => {
try {
  const categories = await getDocuments(req, COLLECTION_NAME);
  return res.status(200).json({ categories });
} catch (error) {
  console.log("Error fetching Categories");
  res.status(500).json({ message: "Internal Server Error" });
}
}

// Create New Category
export const createCategory = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    // ✅ Validate request
    const parsed = createCategorySchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(422).json({ message: "Validation failed", errors: parsed.error.format() });
    }

    const { name, serviceType } = parsed.data;

    // ✅ Check for existing category
    const existCat = await db
      .collection(COLLECTION_NAME)
      .where('name', '==', name)
      .limit(1)
      .get();

    if (!existCat.empty) {
      return res.status(409).json({ message: "Category already exists" });
    }

    // ✅ Create category
    const newCategory = {
      name,
      serviceType,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection(COLLECTION_NAME).add(newCategory);

    return res.status(201).json({
      message: "Category created successfully",
      id: docRef.id,
      data: newCategory,
    });

  } catch (error) {
    console.error("Error creating category:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const findCategory = async (req:Request, res:Response) => {
  const { id } = req.params;
  const result = await findDocument(COLLECTION_NAME, id);

  if (result.status === 200) {
    res.status(result.status).json(result.data);
  } else {
    res.status(result.status).json({ message: result.message });
  }
};

export const editCategory = async (req:Request, res:Response) => {
  const { id } = req.params;
  const result = await editDocument(COLLECTION_NAME, id, req.body);
  res.status(result.status).json({ message: result.message });
};

export const deleteCategory = async (req:Request, res:Response) => {
  const { id } = req.params;
  const result = await deleteDocument(COLLECTION_NAME, id);
  res.status(result.status).json({ message: result.message });
};
