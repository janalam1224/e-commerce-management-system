import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import admin from 'firebase-admin';
import { unifiedUserSchema } from '../schemas/schemas';
import {
  getDocuments,
  postDocument,
  findDocument,
  editDocument,
  deleteDocument,
} from './genericController';

const COLLECTION_NAME = "users";

// GET all users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await getDocuments(req, COLLECTION_NAME);
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// CREATE new user
export const createUser = async (req: Request, res: Response) => {
  try {
    const parsed = unifiedUserSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }

    const baseUserData = parsed.data;

    // Check if user already exists
    const existing = await admin
      .firestore()
      .collection(COLLECTION_NAME)
      .where('email', '==', baseUserData.email.toLowerCase())
      .get();

    if (!existing.empty) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(baseUserData.password, 10);

    const userData = {
      ...baseUserData,
      password: hashedPassword,
      fullName: `${baseUserData.firstName || ''} ${baseUserData.lastName || ''}`.trim(),
      createdAt: new Date(),
    };

    const result = await postDocument(userData, COLLECTION_NAME);

    if ('error' in result && result.error) {
      return res.status(result.status).json({ error: result.error });
    }

    res.status(result.status).json(result);
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to create user', error: err.message });
  }
};

// GET user by ID
export const findUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await findDocument(COLLECTION_NAME, id);

  if (result.status === 200) {
    res.status(200).json(result.data);
  } else {
    res.status(result.status).json({ message: result.message });
  }
};

// EDIT user by ID
export const editUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  const parsed = unifiedUserSchema.partial().safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors });
  }

  const result = await editDocument(COLLECTION_NAME, id, parsed.data);
  res.status(result.status).json({ message: result.message });
};

// DELETE user by ID
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await deleteDocument(COLLECTION_NAME, id);
  res.status(result.status).json({ message: result.message });
};
