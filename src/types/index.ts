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
  descriptionFR?: string;
  detailsCare?: string;
  detailsCareFR?: string;
  returnPolicy?: string;
  returnPolicyFR?: string;
  shortDescription: string;
  shortDescriptionFR?: string;
  fitNote?: string;
  fitNoteFR?: string;
  sizeChart?: string;
  sizeChartFR?: string;
  featured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  stock: number;
  inventoryBySize?: Record<string, number>;
  inventoryByColorSize?: Record<string, Record<string, number>>;
  tags: string[];
  videoUrl?: string;
  videoThumbnailUrl?: string;
  priceCAD?: number;
  salePriceCAD?: number;
  createdAt?: string;
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

export interface NavChild {
  label: string;
  href: string;
}

export interface NavGroup {
  title?: string;
  items: NavChild[];
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
  groups?: NavGroup[];
}

export type Category =
  | "all"
  | "dresses"
  | "tops"
  | "bottoms"
  | "sets"
  | "outerwear"
  | "accessories";
