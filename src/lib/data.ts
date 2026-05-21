import { Product } from "@/types";

export const products: Product[] = [
  {
    id: "1",
    name: "Celestine Lace Dress",
    slug: "celestine-lace-dress",
    price: 285,
    images: [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80",
      "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80",
    ],
    category: "dresses",
    gender: "women",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Ivory", hex: "#FFFFF0" },
      { name: "Blush", hex: "#FFB6C1" },
    ],
    description:
      "A breathtaking lace dress that exudes femininity and grace. Crafted from delicate French lace with a fitted bodice and flowing skirt, perfect for special occasions.",
    shortDescription: "Delicate French lace with flowing silhouette",
    featured: true,
    isNew: true,
    isBestSeller: false,
    stock: 12,
    tags: ["lace", "occasion", "dress", "formal"],
  },
  {
    id: "2",
    name: "Margot Slip Dress",
    slug: "margot-slip-dress",
    price: 195,
    salePrice: 155,
    images: [
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80",
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80",
    ],
    category: "dresses",
    gender: "women",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Champagne", hex: "#F7E7CE" },
      { name: "Black", hex: "#000000" },
      { name: "Sage", hex: "#B2AC88" },
    ],
    description:
      "The quintessential slip dress reimagined. Fluid satin fabric drapes beautifully against the body, creating an effortlessly elegant look for any occasion.",
    shortDescription: "Fluid satin with timeless silhouette",
    featured: true,
    isNew: false,
    isBestSeller: true,
    stock: 8,
    tags: ["satin", "slip", "dress", "versatile"],
  },
  {
    id: "3",
    name: "Aurelie Maxi Dress",
    slug: "aurelie-maxi-dress",
    price: 320,
    images: [
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80",
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&q=80",
    ],
    category: "dresses",
    gender: "women",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Cream", hex: "#FFFDD0" },
      { name: "Navy", hex: "#000080" },
    ],
    description:
      "A stunning maxi dress with intricate embroidery and a graceful train. The flowing chiffon fabric moves beautifully, making it ideal for galas and formal events.",
    shortDescription: "Embroidered chiffon with elegant train",
    featured: false,
    isNew: true,
    isBestSeller: false,
    stock: 5,
    tags: ["maxi", "embroidery", "formal", "gala"],
  },
  {
    id: "4",
    name: "Vivienne Blazer",
    slug: "vivienne-blazer",
    price: 245,
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
      "https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?w=800&q=80",
    ],
    category: "outerwear",
    gender: "women",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Camel", hex: "#C19A6B" },
      { name: "Ivory", hex: "#FFFFF0" },
      { name: "Black", hex: "#000000" },
    ],
    description:
      "A structured blazer with a contemporary edge. The tailored fit and premium fabric make this a wardrobe essential that transitions effortlessly from day to evening.",
    shortDescription: "Tailored structure with contemporary edge",
    featured: true,
    isNew: false,
    isBestSeller: true,
    stock: 15,
    tags: ["blazer", "tailored", "work", "versatile"],
  },
  {
    id: "5",
    name: "Elara Wrap Top",
    slug: "elara-wrap-top",
    price: 145,
    images: [
      "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800&q=80",
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80",
    ],
    category: "tops",
    gender: "women",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Terracotta", hex: "#E2725B" },
      { name: "Stone", hex: "#928E85" },
    ],
    description:
      "An elegant wrap top that flatters every figure. The adjustable tie-front creates a customized fit while the soft fabric drapes beautifully.",
    shortDescription: "Adjustable wrap silhouette in soft fabric",
    featured: false,
    isNew: true,
    isBestSeller: false,
    stock: 20,
    tags: ["wrap", "top", "flattering", "everyday"],
  },
  {
    id: "6",
    name: "Solène Palazzo Pants",
    slug: "solene-palazzo-pants",
    price: 175,
    images: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80",
      "https://images.unsplash.com/photo-1506809211073-d0785aaad75e?w=800&q=80",
    ],
    category: "bottoms",
    gender: "women",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Ecru", hex: "#F5F0E8" },
      { name: "Charcoal", hex: "#36454F" },
    ],
    description:
      "Wide-leg palazzo pants with a high-rise waist. The fluid fabric creates an effortlessly chic look that works for both casual and formal occasions.",
    shortDescription: "Wide-leg silhouette in fluid fabric",
    featured: false,
    isNew: false,
    isBestSeller: true,
    stock: 18,
    tags: ["palazzo", "wide-leg", "pants", "chic"],
  },
  {
    id: "7",
    name: "Isabelle Cocktail Dress",
    slug: "isabelle-cocktail-dress",
    price: 265,
    images: [
      "https://images.unsplash.com/photo-1519657337289-077653f724ed?w=800&q=80",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
    ],
    category: "dresses",
    subcategory: "cocktail",
    gender: "women",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Midnight", hex: "#191970" },
      { name: "Wine", hex: "#722F37" },
    ],
    description:
      "A sophisticated cocktail dress with a modern cut. The structured bodice and A-line skirt create a flattering silhouette perfect for evening events.",
    shortDescription: "Structured bodice with A-line silhouette",
    featured: true,
    isNew: false,
    isBestSeller: false,
    stock: 7,
    tags: ["cocktail", "evening", "formal", "dress"],
  },
  {
    id: "8",
    name: "Celeste Resort Set",
    slug: "celeste-resort-set",
    price: 220,
    images: [
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80",
      "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800&q=80",
    ],
    category: "tops",
    subcategory: "resort",
    gender: "women",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Aqua", hex: "#00FFFF" },
      { name: "Coral", hex: "#FF7F50" },
    ],
    description:
      "A luxurious resort co-ord set featuring a cropped top and matching wide-leg pants. Perfect for tropical getaways and warm evenings.",
    shortDescription: "Luxurious co-ord for tropical occasions",
    featured: false,
    isNew: true,
    isBestSeller: false,
    stock: 10,
    tags: ["resort", "co-ord", "vacation", "summer"],
  },
];

export const categories = [
  {
    id: "new-in",
    label: "New In",
    href: "/products?filter=new",
    image:
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80",
  },
  {
    id: "dresses",
    label: "Dresses",
    href: "/products?category=dresses",
    image:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80",
  },
  {
    id: "occasions",
    label: "Occasions",
    href: "/products?filter=occasion",
    image:
      "https://images.unsplash.com/photo-1519657337289-077653f724ed?w=600&q=80",
  },
  {
    id: "resort",
    label: "Resort",
    href: "/products?subcategory=resort",
    image:
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80",
  },
];

export const navItems = [
  {
    label: "New In",
    href: "/products?filter=new",
    children: [],
  },
  {
    label: "Occasions",
    href: "/products?filter=occasion",
    children: [
      { label: "Pre-Wedding", href: "/products?occasion=pre-wedding" },
      { label: "Cocktail", href: "/products?occasion=cocktail" },
      { label: "Event & Gala", href: "/products?occasion=gala" },
      { label: "Resort", href: "/products?occasion=resort" },
    ],
  },
  {
    label: "Shop",
    href: "/products",
    children: [
      { label: "All", href: "/products" },
      { label: "Dresses", href: "/products?category=dresses" },
      { label: "Tops", href: "/products?category=tops" },
      { label: "Bottoms", href: "/products?category=bottoms" },
      { label: "Outerwear", href: "/products?category=outerwear" },
    ],
  },
  {
    label: "Best Sellers",
    href: "/products?filter=bestseller",
    children: [],
  },
  {
    label: "About",
    href: "/about",
    children: [],
  },
];
