export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: string;
  subcategory?: string;
  gender: "women" | "men" | "unisex";
  sizes: string[];
  colors: Color[];
  description: string;
  shortDescription: string;
  featured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  stock: number;
  tags: string[];
}

export interface Color {
  name: string;
  hex: string;
  images?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export type Category =
  | "all"
  | "dresses"
  | "tops"
  | "bottoms"
  | "outerwear"
  | "accessories";
