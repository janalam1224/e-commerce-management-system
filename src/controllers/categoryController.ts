import { RequestHandler } from 'express';
import { createCategorySchema } from '../schemas/schemas';
import prisma from '../../config/db.config';
import { number } from 'zod';

// Get all categories
export const getCategories: RequestHandler = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();

    if (!categories.length) {
      res.status(404).json({ message: "Categories not found" });
    }

    res.status(200).json({ categories });
  } catch (error) {
    console.error("Error Fetching Categories", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// Create a category
export const createCategory: RequestHandler = async (req, res) => {
  const { name, serviceType } = req.body;

  try {
    // Optional: prevent duplicates by name + serviceType
    const existing = await prisma.category.findFirst({
      where: {
        name,
        serviceType,
      },
    });

    if (existing) {
      res.status(422).json({ message: "Category already exists" });
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        serviceType,
      },
    });

    res.status(201).json({ category: newCategory });
  } catch (error) {
    console.log("Error Creating Category", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Find single category
export const findCategory: RequestHandler = async (req, res) => {
    const categoryId = Number(req.params.id);
    try {
       const category = await prisma.category.findUnique({
        where:{
          id:categoryId,
        }
       });
       if(!category){
        res.status(404).json({ message: "category not found" });
       }
       res.status(200).json({ category });
    } catch (error) {
      console.log("Error Finding Category");
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

// Edit/update category
export const editCategory: RequestHandler = async (req, res) => {
     const { name, serviceType } = req.body;
     const categoryId = Number(req.params.id);
     try {
       const existing = await prisma.category.findUnique({
        where:{
          id:categoryId,
        }
       });
       if(!existing){
        res.status(404).json({ message:"category not found" });
       }
       const updateCategory = await prisma.category.update({
        where:{
          id:categoryId,
        },
        data:{
          name,
          serviceType,
        }
       });
       res.status(201).json({ updateCategory });
     } catch (error) {
      console.log("Error Updating Category");
      res.status(500).json({ message: "Internal Server Error" });
     }
    }

// Delete category
export const deleteCategory: RequestHandler = async (req, res) => {
  const categoryId = Number(req.params.id);
  try {
      const existing = await prisma.category.findUnique({
    where:{
      id:categoryId,
    }
  });
  if(!existing){
    res.status(404).json({ message:"category not found" });
  }
  const deleteCategory = await prisma.category.delete({
    where:{
      id:categoryId,
    }
  });

  res.status(204).json({ message: "category deleted successfully" });
  } catch (error) {
   console.log("Error Deleting Category");
   res.status(500).json({ message:"Internal Server Error" }); 
  }
};
