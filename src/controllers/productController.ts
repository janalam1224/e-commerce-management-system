import { RequestHandler } from "express";
import prisma from "../../config/db.config";
import { createProductSchema, updateProductSchema } from "../schemas/schemas";
import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} from "../utils/uploadImage";
import { string } from "zod";

// ============================
// Create Product
export const createProduct: RequestHandler = async (req, res): Promise<any> => {
  try {
    // 🔒 Ensure user is authenticated
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized: user not found" });
    }
    const userId = req.user.id;

    const parsed = createProductSchema.safeParse({
      ...req.body,
      barcode: req.body.barcode ? String(req.body.barcode) : undefined,
      discountedPrice: req.body.discountedPrice
        ? Number(req.body.discountedPrice)
        : undefined,
      cost: req.body.cost ? Number(req.body.cost) : undefined,
      price: req.body.price ? Number(req.body.price) : undefined,
      salePrice: req.body.salePrice ? Number(req.body.salePrice) : undefined,
      tax: req.body.tax ? Number(req.body.tax) : undefined,
      stock: req.body.stock ? Number(req.body.stock) : undefined,
      categoryId: req.body.categoryId ? Number(req.body.categoryId) : undefined,
      status: req.body.status,
      name: req.body.name,
      reference: req.body.reference,
      image: req.body.image,
    });

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }

    const data = parsed.data;

    let uploadedImage: { url: string; public_id?: string } | null = null;

    if (req.file) {
      const uploaded = await uploadImageToCloudinary(req.file.path);
      if (uploaded?.secure_url) {
        uploadedImage = {
          url: uploaded.secure_url,
          public_id: uploaded.public_id,
        };
      }
    } else if (data.image) {
      uploadedImage = { url: data.image };
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        reference: data.reference,
        barcode: data.barcode ?? null,
        discountedPrice: data.discountedPrice ?? null,
        cost: data.cost,
        price: data.price,
        salePrice: data.salePrice ?? null,
        tax: data.tax,
        stock: data.stock,
        categoryId: data.categoryId,
        status: data.status,
        userId,
        image: uploadedImage ? uploadedImage.url : null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ error: "Failed to create product" });
  }
};

// Get All Products
export const getProducts: RequestHandler = async (_req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.status(200).json({ products });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// Get Single Product
export const findProduct: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.status(200).json({ product });
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

// Update Product
export const editProduct: RequestHandler = async (req, res) => {
  const files = (req.files as Express.Multer.File[]) || [];
  let uploadedImage: { url: string; public_id: string } | null = null;

  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const parsed = updateProductSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors });
      return;
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

    if (files[0]) {
      const uploaded = await uploadImageToCloudinary(files[0].path);
      if (uploaded?.secure_url && uploaded?.public_id) {
        uploadedImage = {
          url: uploaded.secure_url,
          public_id: uploaded.public_id,
        };

        // delete old image if exists
        if (existing.image) {
          const parts = existing.image.split("/");
          const filename = parts[parts.length - 1];
          const publicId = filename.split(".")[0];
          try {
            await deleteImageFromCloudinary(publicId);
          } catch (err) {
            console.error("Failed to delete old image:", err);
          }
        }
      }
    }

    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name: name ?? existing.name,
        reference: reference ?? existing.reference,
        barcode: barcode ?? existing.barcode,
        discountedPrice: discountedPrice ?? existing.discountedPrice,
        cost: cost ?? existing.cost,
        price: price ?? existing.price,
        salePrice: salePrice ?? existing.salePrice,
        tax: tax ?? existing.tax,
        stock: stock ?? existing.stock,
        categoryId: categoryId ?? existing.categoryId,
        status: status ?? existing.status,
        image: uploadedImage ? uploadedImage.url : existing.image,
      },
    });

    res.status(200).json({ product: updated });
  } catch (err) {
    console.error("Error updating product:", err);

    if (uploadedImage) {
      try {
        await deleteImageFromCloudinary(uploadedImage.public_id);
        console.log("Rolled back new upload:", uploadedImage.public_id);
      } catch (delErr) {
        console.error("Failed to rollback uploaded image:", delErr);
      }
    }

    res.status(500).json({ error: "Failed to update product" });
  }
};

// Delete Product
export const deleteProduct: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.delete({
      where: { id: Number(id) },
    });

    if (product.image) {
      const parts = product.image.split("/");
      const filename = parts[parts.length - 1];
      const publicId = filename.split(".")[0];

      try {
        await deleteImageFromCloudinary(publicId);
      } catch (err) {
        console.error(`Failed to delete Cloudinary image: ${publicId}`, err);
      }
    }

    res.status(200).json({
      message: "Product and associated image deleted successfully",
      product,
    });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
};
