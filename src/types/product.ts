// types/product.ts
export interface IProduct {
  images: string[]; // URLs
  name: string;
  reference: string;
  barcode?: number;
  discountedPrice?: number;
  cost: number;
  price: number;
  salePrice: number;
  tax: number;
  stock: number;
  categoryName: string;
  status: 'active' | 'inactive';
  createdAt: string; // ISO Date string
}