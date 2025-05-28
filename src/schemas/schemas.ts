import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().trim(),
  email: z.string().trim().email(),
  password: z.string().trim().min(5).max(20),
  userType: z.string().trim(),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().trim().min(5).max(20),
});

export const createProdSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be a positive number"),
  category: z.string().min(1, "Category is required"),
  stock: z.number().int().nonnegative("Stock must be a non-negative integer"),
  rating: z.number().min(0).max(5).optional(), // Rating is usually 0-5
  image: z.string().url("Image must be a valid URL")
});

export const createUserSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(5, "Password must be at least 5 characters"),
  userType: z.enum(["admin", "editor", "user"]),
});