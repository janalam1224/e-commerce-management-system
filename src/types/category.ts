export interface ICategory {
  name: string;
  serviceType: 'retail' | 'rental' | 'repair' | 'subscription';
  createdAt?: string; // ISO Date string
}