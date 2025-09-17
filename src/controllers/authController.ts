import { RequestHandler } from "express";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import prisma from "../../config/db.config";
import { adminUserSchema, loginSchema } from "../schemas/schemas";
import { ZodError } from "zod";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../../config/jwt";
import { JwtPayload } from "../types/auth";

const generateToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

// Signup
export const signUp: RequestHandler = async (req, res) => {
  try {
    const result = adminUserSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: result.email },
    });

    if (existingUser) {
      res.status(422).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(result.password, 12);

    const { firstName, lastName, email, telephone, gender, role, status } =
      result;

    const newUser = await prisma.user.create({
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

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res
        .status(400)
        .json({ message: "Validation error", errors: error.errors });
    } else {
      console.error("Signup Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

// Login
export const logIn: RequestHandler = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = generateToken(payload);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res
        .status(400)
        .json({ message: "Validation error", errors: error.errors });
    } else {
      console.error("Login Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
