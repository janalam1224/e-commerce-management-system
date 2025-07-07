import { Request } from 'express';
import { ZodSchema } from 'zod';
import slugify from 'slugify';
import admin from 'firebase-admin';
import { db } from '../firebaseAdmin';

import {
  DocumentData,
  PostDocumentResponse,
  FindDocumentResponse,
  EditDocumentResponse,
  DeleteDocumentResponse,
} from '../types/index';

const getCollectionRef = (collectionName: string) => db.collection(collectionName);

// FETCH ALL DOCUMENTS
export const getDocuments = async (
  req: Request,
  collectionName: string
): Promise<DocumentData[]> => {
    const pageSize = parseInt(req.query.limit as string) || 5;
    const sortField = (req.query.sortField as string) || 'name';
    const sortOrder = req.query.sortOrder === 'asc'? 'asc': 'desc';
    const searchQuery = (req.query.searchQuery as string) || '';
  try {
    let docRef: FirebaseFirestore.Query<admin.firestore.DocumentData> = getCollectionRef(collectionName);


    if (searchQuery) {
      docRef = docRef
        .orderBy('name') // Only works if name exists
        .startAt(searchQuery)
        .endAt(searchQuery + '\uf8ff');
    } else {
      docRef = docRef.orderBy(sortField, sortOrder);
    }

    docRef = docRef.limit(pageSize);

    const snapshot = await docRef.get();
    const documents: DocumentData[] = [];

    snapshot.forEach(doc => {
      documents.push({ id: doc.id, data: doc.data() });
    });

    return documents;
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
};

// CREATE NEW DOCUMENT
export const postDocument = async (
  data: any,
  collectionName: string,
  schema?: ZodSchema,
  customLogic?: (data: any) => Promise<{ valid: boolean; message?: string; data?: any }>
): Promise<PostDocumentResponse> => {
  try {
    if (schema) {
      const parsed = schema.safeParse(data);
      if (!parsed.success) {
        return { status: 400, error: parsed.error.errors };
      }
      data = parsed.data;
    }

    if (customLogic) {
      const result = await customLogic(data);
      if (!result.valid) {
        return { status: 400, message: result.message };
      }
      data = result.data || data;
    }

    const docRef = admin.firestore().collection(collectionName);
    const newDoc = await docRef.add(data);

    return {
      status: 201,
      message: `${collectionName.slice(0, -1)} added successfully`,
      id: newDoc.id,
    };
  } catch (error) {
    console.error('Error posting document:', error);
    return { status: 500, error };
  }
};

// FIND DOCUMENT BY ID
export const findDocument = async (
  collection: string,
  id: string
): Promise<FindDocumentResponse> => {
  try {
    const docRef = getCollectionRef(collection).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return {
        status: 404,
        message: `${collection.slice(0, -1)} not found`,
      };
    }

    return {
      status: 200,
      data: { id: doc.id, ...doc.data() },
    };
  } catch (error) {
    console.error('Error finding document:', error);
    return { status: 500, message: 'Internal server error' };
  }
};

// EDIT DOCUMENT
export const editDocument = async (
  collection: string,
  id: string,
  updateData: any
): Promise<EditDocumentResponse> => {
  try {
    const docRef = getCollectionRef(collection).doc(id);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return {
        status: 404,
        message: `${collection.slice(0, -1)} not found`,
      };
    }

    await docRef.update(updateData);

    return {
      status: 200,
      message: `${collection.slice(0, -1)} updated successfully.`,
    };
  } catch (error) {
    console.error('Error updating document:', error);
    return { status: 500, message: 'Internal server error' };
  }
};

// DELETE DOCUMENT
export const deleteDocument = async (
  collection: string,
  id: string
): Promise<DeleteDocumentResponse> => {
  try {
    const docRef = getCollectionRef(collection).doc(id);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return {
        status: 404,
        message: `${collection.slice(0, -1)} not found`,
      };
    }

    await docRef.delete();

    return {
      status: 200,
      message: `${collection.slice(0, -1)} deleted successfully`,
    };
  } catch (error) {
    console.error('Error deleting document:', error);
    return { status: 500, message: 'Internal server error' };
  }
};
