// src/middleware/authMiddleware.ts

import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config/jwt';
import { JwtPayload } from '../types/auth';
import prisma from '../../config/db.config';

// Middleware to verify JWT and attach user to request
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('JWT auth error:', err);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to enforce role-based access
export const requireRole = (
  role: 'admin' | 'seller' | 'customer'
): RequestHandler => {
  return (req, res, next): void => {
    if (!req.user || req.user.role !== role) {
      res.status(403).json({ message: 'Access denied: insufficient permissions' });
      return;
    }

    next();
  };
};
