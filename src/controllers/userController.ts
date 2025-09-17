import { RequestHandler } from "express";
import prisma from "../../config/db.config";
import bcrypt from "bcrypt";
import { adminUserSchema } from "../schemas/schemas";
import { ZodError } from "zod";

// Fetch all users
export const fetchUsers: RequestHandler = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    if (!users.length) {
      res.status(404).json({ message: "Users Not Found" });
    } else {
      res.status(200).json({ users });
    }
  } catch (error) {
    console.error("Error Fetching Users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Create new user
export const createUser: RequestHandler = async (req, res) => {
  try {
    const result = adminUserSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: result.email },
    });

    if (existingUser) {
      res.status(422).json({ message: "User already exists" });
      return;
    }
    const {
      firstName,
      lastName,
      email,
      telephone,
      gender,
      role,
      password,
      status,
    } = result;
    const hashedPassword = await bcrypt.hash(result.password, 10);

    await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        telephone,
        gender,
        role,
        status,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: "User Created Successfully" });
  } catch (error) {
    if (error instanceof ZodError) {
      res
        .status(400)
        .json({ message: "Validation Error", errors: error.errors });
    } else {
      console.error("Error Creating User:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

// Find a single user
export const findUser: RequestHandler = async (req, res) => {
  const userId = Number(req.params.id);

  if (isNaN(userId)) {
    res.status(400).json({ message: "Invalid user ID" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ message: "User Not Found" });
    } else {
      res.status(200).json({ user });
    }
  } catch (error) {
    console.error("Error Finding User:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Edit/update a user
export const editUser: RequestHandler = async (req, res) => {
  const userId = Number(req.params.id);

  if (isNaN(userId)) {
    res.status(400).json({ message: "Invalid user ID" });
    return;
  }

  try {
    const parsedData = adminUserSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: parsedData.email },
    });

    if (existingUser && existingUser.id !== userId) {
      res.status(422).json({ message: "Email already in use by another user" });
      return;
    }

    const hashedPassword = await bcrypt.hash(parsedData.password, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        ...parsedData,
        password: hashedPassword,
      },
    });

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    if (error instanceof ZodError) {
      res
        .status(400)
        .json({ message: "Validation Error", errors: error.errors });
    } else {
      console.error("Error Editing User:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

// Delete a user
export const deleteUser: RequestHandler = async (req, res) => {
  const userId = Number(req.params.id);
  console.log("Deleting user with ID:", userId);

  if (isNaN(userId)) {
    res.status(400).json({ message: "Invalid user ID" });
    return;
  }

  try {
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
    });

    res.status(200).json({
      message: "User deleted successfully",
      user: deletedUser,
    });
  } catch (err: any) {
    if (err.code === "P2025") {
      // Prisma error: record not found
      res.status(404).json({ message: "User not found" });
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};
