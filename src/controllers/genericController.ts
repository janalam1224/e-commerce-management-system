import { Request } from 'express';
import { ZodSchema } from 'zod';
import db from '../config/firebaseAdmin';
import { DocumentData,
   PostDocumentResponse,
   FindDocumentResponse,
   EditDocumentResponse,
   DeleteDocumentResponse
     } from '../types/index';

const getCollectionRef = (collectionName: string) => {
  return db.collection(collectionName);
};

export const getDocuments = async (req: Request, collectionName: string): Promise<DocumentData[]> => {
  try {
    const pageSize = parseInt(req.query.limit as string) || 2;
    const sortField = (req.query.sortField as string) || 'name';
    const sortOrder = req.query.sortOrder === 'desc' ? 'desc' : 'asc';

    const docRef = getCollectionRef(collectionName)
      .orderBy(sortField, sortOrder)
      .limit(pageSize);

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

export const postDocument = async (
  req: Request,
  collectionName: string,
  schema: ZodSchema
): Promise<PostDocumentResponse>=> {
  try {
    const data = schema.safeParse(req.body);

    if (!data.success) {
      return { status: 400, error: data.error.errors };
    }

    const docRef = getCollectionRef(collectionName);
    const existDoc = await docRef.where('name', '==', data.data.name).get();

    if (!existDoc.empty) {
      return { status: 400, message: `${collectionName.slice(0, -1)} already exists` };
    }

    const newDoc = await docRef.add(data.data);
    return { status: 201, message: `${collectionName.slice(0, -1)} added successfully`, id: newDoc.id };
  } catch (error) {
    console.error('Error posting document:', error);
    return { status: 500, error };
  }
};

export const findDocument = async (
  collection: string,
  id: string
): Promise<FindDocumentResponse> => {
  try {
    const docRef = getCollectionRef(collection).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return { status: 404, message: `${collection.slice(0, -1)} not found` };
    }

    return { status: 200, data: { id: doc.id, ...doc.data() } };
  } catch (error) {
    console.error('Error finding document:', error);
    return { status: 500, message: 'Internal server error' };
  }
};

export const editDocument = async (
  collection: string,
  id: string,
  updateData: any
): Promise<EditDocumentResponse> => {
  try {
    const docRef = getCollectionRef(collection).doc(id);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return { status: 404, message: `${collection.slice(0, -1)} not found` };
    }

    await docRef.update(updateData);
    return { status: 200, message: `${collection.slice(0, -1)} updated successfully.` };
  } catch (error) {
    console.error('Error updating document:', error);
    return { status: 500, message: 'Internal server error' };
  }
};

export const deleteDocument = async (
  collection: string,
  id: string
): Promise<DeleteDocumentResponse> => {
  try {
    const docRef = getCollectionRef(collection).doc(id);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return { status: 404, message: `${collection.slice(0, -1)} not found` };
    }

    await docRef.delete();
    return { status: 200, message: `${collection.slice(0, -1)} deleted successfully` };
  } catch (error) {
    console.error('Error deleting document:', error);
    return { status: 500, message: 'Internal server error' };
  }
};