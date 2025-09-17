import { PaymentMethod } from "@prisma/client";
import { z } from "zod";

export const adminUserSchema = z.object({
  firstName: z.string().trim(),
  lastName: z.string().trim().optional(),
  email: z.string().trim().email("Invalid email"),
  telephone: z
    .string()
    .trim()
    .regex(/^\d{11}$/, "Telephone must be an 11-digit number")
    .optional(),
  gender: z.enum(["male", "female", "other"]).default("male"),
  role: z.enum(["admin", "manager", "staff"]).default("staff"),
  password: z.string().trim().min(5).max(20),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z
    .string()
    .trim()
    .min(5, "Password must be at least 5 characters")
    .max(20, "Password must be at most 20 characters"),
});

export const createProductSchema = z.object({
  image: z.string().url().optional(),
  name: z.string().trim().min(1),
  reference: z.string().trim().min(1),
  barcode: z.string().nullable().optional(),
  discountedPrice: z.number().nullable().optional(),
  cost: z.number().nonnegative(),
  price: z.number().nonnegative(),
  salePrice: z.number().nullable().optional(),
  tax: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative(),
  status: z.enum(["active", "inactive"]),
  categoryId: z.number().int().positive(),
});

export const updateProductSchema = z.object({
  // ✅ id is NOT needed here, you already get it from req.params
  name: z.string().trim().min(1).optional(),
  reference: z.string().trim().min(1).optional(),
  barcode: z.string().nullable().optional(),

  discountedPrice: z.coerce.number().nullable().optional(),
  cost: z.coerce.number().nonnegative().optional(),
  price: z.coerce.number().nonnegative().optional(),
  salePrice: z.coerce.number().nullable().optional(),
  tax: z.coerce.number().int().nonnegative().optional(),
  stock: z.coerce.number().int().nonnegative().optional(),

  status: z.enum(["active", "inactive"]).optional(),

  categoryId: z.coerce.number().int().positive().optional().nullable(),

  image: z.string().url().optional().or(z.literal("")).nullable(),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required"),
  createdAt: z.string().datetime(),
});

export const orderItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  price: z.number().nonnegative(),
});

export const createOrderSchema = z.object({
  orderNumber: z.string().min(1, "Order number is required"),
  totalAmount: z.number().nonnegative(),
  userId: z.number().int().positive(),
  items: z.array(orderItemSchema).min(1),
});

export const createCartItemSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
});

export const createTransactionSchema = z.object({
  transactionId: z.string().min(1, "Transaction ID is required"),
  paymentMethod: z.enum(["cash"]).default("cash"),
  amount: z.number().nonnegative(),
  discount: z.number().nonnegative().optional(),
  userId: z.number().int(),
  orderId: z.number().int(),
});
