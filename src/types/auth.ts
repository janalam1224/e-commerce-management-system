import { Request } from 'express';
import { JwtPayload as DefaultJwtPayload } from 'jsonwebtoken';
import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: Pick<User, 'id' | 'email' | 'role'>;
    }
  }
}

// Used with jwt.verify
export interface JwtPayload extends DefaultJwtPayload {
  id: number;
  email: string;
  role: 'admin' | 'seller' | 'customer';
}

// ✅ Add this type if you want a typed Request with guaranteed user
export interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    role: 'admin' | 'seller' | 'customer';
    password:string
  };
}
