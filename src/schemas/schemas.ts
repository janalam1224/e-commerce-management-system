import { z } from 'zod';

export const unifiedUserSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").optional().or(z.literal('')),
  lastName: z.string().trim().min(1, "Last name is required").optional().or(z.literal('')),
  email: z.string().trim().email("Invalid email"),
  telephone: z.string().trim().regex(/^\d{11}$/, "Telephone must be an 11-digit number").optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  role: z.enum(["admin", "seller", "customer"]),
  password: z.coerce.string().trim().min(5, "Password must be at least 5 characters").max(20, "Password must be at most 20 characters"),
  status: z.string().trim().min(1).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
password: z.coerce.string().trim().min(5, "Password must be at least 5 characters").max(20, "Password must be at most 20 characters")
});

export const createProductSchema = z.object({
  images: z.array(z.string().url()).optional(),
  name: z.string(),
  reference: z.string(),
  barcode: z.coerce.number().nullable().optional(),
  discountedPrice: z.coerce.number().nullable().optional(),
  cost: z.coerce.number(),
  price: z.coerce.number(),
  salePrice: z.coerce.number().nullable().optional(),
  tax: z.coerce.number(),
  stock: z.coerce.number(),
  categoryId: z.coerce.number(),
  status: z.enum(['active', 'inactive']),
  createdAt: z.string().datetime().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required"),
  serviceType: z.enum(["retail", "rental", "repair", "subscription"]),
  createdAt: z.string().datetime().optional(),
});

export const createAddressSchema = z.object({
  userId: z.string(),
  type: z.enum(['shipping', 'billing']),
  street: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  phone: z.string(),
});

export const createOrderSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  orderNumber: z.string().min(1, 'Order number is required'),
  status: z.string().min(1, 'Order status is required'),
  totalAmount: z.number().min(0, 'Total amount must be a non-negative number'),

  shippingAddress: z.object({
    type: z.literal("shipping"),
    fullName: z.string().min(1, 'Full name is required'),
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
  }),
  items: z.array(
    z.object({
      productId: z.string().min(1, 'Product ID is required'),
      name: z.string().min(1, 'Product name is required'),
      price: z.number().min(0, 'Price must be a non-negative number'),
      quantity: z.number().int().min(1, 'Quantity must be at least 1'),
    })
  ).min(1, 'At least one item is required'),
});

export const createCartItemSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});


