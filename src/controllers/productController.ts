import { RequestHandler } from 'express';
import { db } from '../firebaseAdmin';
import admin from 'firebase-admin';
import upload from '../middlewares/upload';
import {
  uploadImageToCloudinary,
  uploadImageToCloudinaryFromUrl,
  deleteCloudinaryImageByUrl
} from '../utils/uploadImage';
import { MulterRequest } from '../types/generic';
import { createProductSchema } from '../schemas/schemas';
import { getDocuments, postDocument } from './genericController';

const COLLECTION_NAME = 'products';

// Get all products
export const getProducts: RequestHandler = async (req, res) => {
  try {
    const products = await getDocuments(req, COLLECTION_NAME);
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// Create product middleware
export const createProductMiddleware: RequestHandler = async (req, res): Promise<any> => {
  const multerReq = req as MulterRequest;

  try {
    let imageUrl: string;

    if (multerReq.file) {
      imageUrl = await uploadImageToCloudinary(multerReq.file);
    } else if (req.body.imageUrl) {
      imageUrl = await uploadImageToCloudinaryFromUrl(req.body.imageUrl);
    } else {
      return res.status(400).json({ status: 400, message: 'No image uploaded or URL provided' });
    }

    const productData = {
      images: [imageUrl],
      name: req.body.name,
      reference: req.body.reference,
      barcode: req.body.barcode ? Number(req.body.barcode) : undefined,
      discountedPrice: req.body.discountedPrice ? Number(req.body.discountedPrice) : undefined,
      cost: Number(req.body.cost),
      price: Number(req.body.price),
      salePrice: Number(req.body.salePrice),
      tax: Number(req.body.tax),
      stock: Number(req.body.stock),
      status: req.body.status || 'active',
      createdAt: new Date().toISOString(),
    };

    const result = await postDocument(productData, COLLECTION_NAME, createProductSchema);

    if ('error' in result && result.error) {
      return res.status(result.status).json({ status: result.status, error: result.error });
    }

    return res.status(result.status).json(result);
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ status: 500, message: 'Internal server error', error });
  }
};

export const createProduct: RequestHandler[] = [upload.single('image'), createProductMiddleware];

// Find product
export const findProduct: RequestHandler = async (req, res): Promise<any> => {
  const { id } = req.params;

  try {
    const doc = await db.collection(COLLECTION_NAME).doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// Edit product
export const editProduct: RequestHandler[] = [
  upload.single('image'),
  async (req, res): Promise<any> => {
    const { id } = req.params;
    const multerReq = req as MulterRequest;

    try {
      const productRef = db.collection(COLLECTION_NAME).doc(id);
      const productSnap = await productRef.get();

      if (!productSnap.exists) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const existing = productSnap.data();
      if (!existing) {
        return res.status(500).json({ message: 'Product data is empty' });
      }

      let newImageUrl = existing.images?.[0];

      // ✅ Upload new file image if present
      if (multerReq.file) {
        console.log('📦 New file uploaded');
        if (newImageUrl) await deleteCloudinaryImageByUrl(newImageUrl);
        newImageUrl = await uploadImageToCloudinary(multerReq.file);
      }

      // ✅ Or handle new image URL from request body
      else if (
        (req.body.images?.[0] && req.body.images[0] !== existing.images?.[0]) ||
        (req.body.imageUrl && req.body.imageUrl !== existing.images?.[0])
      ) {
        console.log('🌐 New image URL provided');
        if (newImageUrl) await deleteCloudinaryImageByUrl(newImageUrl);
        const urlToUpload = req.body.images?.[0] || req.body.imageUrl;
        newImageUrl = await uploadImageToCloudinaryFromUrl(urlToUpload);
      }

      // ✅ Prepare update data
      const updatedData: any = {
        ...existing,
        ...req.body,
        images: newImageUrl ? [newImageUrl] : existing.images,
        updatedAt: new Date().toISOString(),
      };

      // ✅ Prepare Firestore data (remove imageUrl field explicitly)
      const firestoreData = {
        ...updatedData,
        imageUrl: admin.firestore.FieldValue.delete(), // properly delete in Firestore
      };

      // ✅ Update Firestore
      await productRef.update(firestoreData);

      // ✅ Clean up response (remove delete markers)
      const responseData = { ...updatedData };
      delete responseData.imageUrl;

      return res.status(200).json({
        message: 'Product updated successfully',
        updatedData: responseData,
      });

    } catch (error) {
      console.error('❌ Edit product error:', error);
      return res.status(500).json({ message: 'Internal Server Error', error });
    }
  }
];

// Delete product
export const deleteProduct: RequestHandler = async (req, res): Promise<any> => {
  const { id } = req.params;

  try {
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const data = doc.data();
    const imageUrl = data?.images?.[0];

    await docRef.delete();

    if (imageUrl) {
      await deleteCloudinaryImageByUrl(imageUrl);
    }

    return res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error', error });
  }
};
