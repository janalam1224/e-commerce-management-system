
import { Request } from 'express';
import usersJson from '../data/user.json';

export interface User {
  id: number;
  name: string;
  email: string;
  password:string;
  userType: string;
}
const users: User[] = usersJson;

export interface AuthenticatedRequest extends Request {
  user?: User;
}

