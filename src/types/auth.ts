import { Request } from 'express';
export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  telephone?: string;
  gender?: "male" | "female" | "other";
  role: "admin" | "seller" | "customer";
  status?: string;
}
export interface JwtPayload {
  uid: string;
  email: string;
  role: "admin" | "seller" | "customer";
}
export interface AuthenticatedRequest extends Request {
  user?: User;
}
