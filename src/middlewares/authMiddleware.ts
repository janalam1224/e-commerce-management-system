import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/jwt";
import { AuthenticatedRequest, JwtPayload } from "../types/auth";

// ✅ Middleware to verify JWT and attach user to the request
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Attach user to the request after casting
    (req as AuthenticatedRequest).user = {
      id: decoded.uid,
      email: decoded.email,
      role: decoded.role,
      password: "", // not needed, but added to match User interface
    };

    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Middleware to restrict access based on user role
export const requireRole = (
  role: "admin" | "seller" | "customer"
): RequestHandler => {
  return (req, res, next) => {
    const user = (req as AuthenticatedRequest).user;

    if (!user || user.role !== role) {
      res.status(403).json({ message: "Access denied: insufficient permissions" });
      return;
    }

    next();
  };
};
