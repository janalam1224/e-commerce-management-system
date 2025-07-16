import { RequestHandler } from 'express';
import prisma from '../../config/db.config';
import { createProductSchema } from '../schemas/schemas';
import { uploadImageToCloudinary } from '../utils/uploadImage';
import { deleteImageFromCloudinary } from '../utils/uploadImage';
import upload from '../middlewares/upload';

// Helper
const toOptionalNumber = (val: any): number | null => {
  if (val === null || val === undefined || val === '') return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
};

// GET Products
export const getProducts: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortField = (req.query.sortField as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) === 'desc' ? 'desc' : 'asc';
    const skip = (page - 1) * limit;

    const products = await prisma.product.findMany({
      skip,
      take: limit,
      orderBy: { [sortField]: sortOrder },
      select: {
      id: true,
      name: true,
      reference: true,
      barcode: true,
      discountedPrice: true,
      cost: true,
      price: true,
      salePrice: true,
      tax: true,
      stock: true,
      category: true,
      status: true,
      createdAt: true,
      images: true,
      },
    });

    const total = await prisma.product.count();

    res.status(200).json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create New product
export const createProduct: RequestHandler = async (req, res):Promise<any> => {
  const files = (req.files as Express.Multer.File[]) || [];
  const uploadedImages: { url: string; public_id: string }[] = [];

  try {
    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }

    const {
      name,
      reference,
      barcode,
      discountedPrice,
      cost,
      price,
      salePrice,
      tax,
      stock,
      categoryId,
      status,
    } = parsed.data;

     const userId = Number(req.user?.id);

    //Upload images to Cloudinary
    for (const file of files) {
      const uploaded = await uploadImageToCloudinary(file.path);
      if (uploaded?.secure_url && uploaded?.public_id) {
        uploadedImages.push({ url: uploaded.secure_url, public_id: uploaded.public_id });
      }
    }

    const imageUrls = uploadedImages.map((img) => img.url);

    const product = await prisma.product.create({
  data: {
  name,
  reference,
  barcode: barcode ?? null,
  discountedPrice: discountedPrice ?? null,
  cost,
  price,
  salePrice: salePrice ?? null,
  tax,
  stock,
  categoryId, 
  userId,
  status,
  images: imageUrls,
}
});

    return res.status(201).json({ product });

  } catch (err: any) {
    console.error("Error creating product:", err);

    for (const img of uploadedImages) {
      try {
        await deleteImageFromCloudinary(img.public_id);
        console.log('Cloudinary image deleted:', img.public_id);
      } catch (delErr) {
        console.error(`Failed to delete image ${img.public_id}:`, delErr);
      }
    }

    return res.status(500).json({ error: "Failed to create product",err });
  }
};

// GET Single Product
export const findProduct: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.status(200).json({ product });
  } catch (error) {
    console.error('Error finding product:', error);
    res.status(500).json({ error: 'Failed to find product' });
  }
};

// Edit Product
export const editProduct: RequestHandler = async (req, res):Promise<any> => {
     const { id } = req.params;
  try {
    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors });
      return;
    }

    const {
       name, reference, barcode, discountedPrice, cost, price,
       salePrice, tax, stock, categoryId, status
        } = parsed.data;

    const userId = Number(req.user?.id);

    const existingProduct = await prisma.product.findUnique({
      where:{ id:Number(id)}
    });

    if(!existingProduct){
      return res.status(404).json({ error: 'Product not found' });
    }

       if (existingProduct.images && existingProduct.images.length > 0) {
      for (const imageUrl of existingProduct.images) {
        const parts = imageUrl.split('/');
        const filename = parts[parts.length - 1];
        const publicId = filename.split('.')[0];
        try {
          await deleteImageFromCloudinary(publicId);
        } catch (err) {
          console.error(`Failed to delete Cloudinary image: ${publicId}`, err);
        }
      }
    }

    const files = (req.files as Express.Multer.File[]) || [];
    const imageUrls: string[] = [];

    for (const file of files) {
      const uploaded = await uploadImageToCloudinary(file.path);
      if (uploaded?.secure_url) {
        imageUrls.push(uploaded.secure_url);
      }
    }
    
    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: {
      name,
      reference,
      barcode:toOptionalNumber(barcode),
      discountedPrice: toOptionalNumber(discountedPrice),
      cost: Number(cost),
      price: Number(price),
      salePrice: toOptionalNumber(salePrice),
      tax: Number(tax),
      stock: Number(stock),
      categoryId,
      userId,
      status,
        images: imageUrls.length ? imageUrls : undefined,
      },
    });

    res.status(200).json({ product: updatedProduct });
  } catch (error) {
    console.error('Error editing product:', error);
    res.status(500).json({ error: 'Failed to edit product' });
  }
};

// DELETE Product
export const deleteProduct: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
const product = await prisma.product.delete({
  where: { id: Number(id) },
});

for (const imageUrl of product.images) {
  const parts = imageUrl.split('/');
  const filename = parts[parts.length - 1];
  const publicId = filename.split('.')[0];
  try {
    await deleteImageFromCloudinary(publicId);
  } catch (err) {
    console.error(`Failed to delete Cloudinary image: ${publicId}`, err);
  }
}

res.status(200).json({ message: 'Product and associated images deleted successfully', product });
  }catch(error){
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
}