import { products as fallbackProducts } from "@/lib/data";
import { listShopifyProducts } from "@/lib/shopify-admin";
import ProductsClient from "./ProductsClient";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  let products = fallbackProducts;

  try {
    products = await listShopifyProducts(250);
  } catch (err) {
    console.error("[ProductsPage] Failed to load Shopify products", err);
  }

  return <ProductsClient initialProducts={products} />;
}
