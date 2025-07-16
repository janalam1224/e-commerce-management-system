export interface User {
  firstName?: string;
  lastName?: string;
  email: string;
  telephone?: string;
  gender?: 'male' | 'female' | 'other';
  role: 'admin' | 'seller' | 'customer';
  password: string;
  status?: string;
}