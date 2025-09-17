import { Request } from "express";
import { JwtPayload as DefaultJwtPayload } from "jsonwebtoken";
import { User } from "@prisma/client";

/**
 * Extend Express Request to include optional `user`
 * populated by authentication middleware
 */
declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      role: Role;
    }

    interface Request {
      user?: User;
    }
  }
}

/**
 * JWT payload interface used with `jwt.verify`
 */
export interface JwtPayload extends DefaultJwtPayload {
  id: number;
  email: string;
  role: Role;
}

/**
 * Request type for authenticated routes
 * Guarantees `req.user` exists
 */
export interface AuthenticatedRequest extends Request {
  user: Pick<User, "id" | "email" | "password">;
}
