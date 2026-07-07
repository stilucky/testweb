import { notFound } from "next/navigation";
import { listShopifyProducts } from "@/lib/shopify-admin";
import { products as fallbackProducts } from "@/lib/data";
import ProductDetailClient from "./ProductDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  let products = fallbackProducts;
  try {
    products = await listShopifyProducts(250);
  } catch (err) {
    console.error("[ProductDetailPage] Failed to load Shopify products", err);
  }

  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}
