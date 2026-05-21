"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, X, ShoppingBag } from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const addCartItem = useCartStore((s) => s.addItem);

  const handleMoveToCart = (productId: string) => {
    const product = items.find((p) => p.id === productId);
    if (!product) return;
    addCartItem(product, product.sizes[0] ?? "M", product.colors[0]?.name ?? "");
    removeItem(productId);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 text-center">
        <Heart size={64} className="text-stone-200" />
        <div>
          <h1
            className="text-4xl text-stone-400"
            style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
          >
            Your wishlist is empty
          </h1>
          <p className="text-stone-400 mt-2 text-sm">Save pieces you love for later</p>
        </div>
        <Link
          href="/products"
          className="mt-4 inline-block bg-stone-900 text-white text-xs tracking-widest uppercase px-10 py-4 hover:bg-stone-700 transition-colors"
        >
          Discover Pieces
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-12">
      <div className="mb-10">
        <h1
          className="text-4xl md:text-5xl"
          style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
        >
          Wishlist
        </h1>
        <p className="text-stone-400 text-sm mt-2">{items.length} saved piece{items.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((product) => {
          const displayPrice = product.salePrice ?? product.price;
          const hasDiscount = !!product.salePrice;

          return (
            <div key={product.id} className="group relative">
              {/* Remove button */}
              <button
                onClick={() => removeItem(product.id)}
                className="absolute top-3 right-3 z-10 p-1.5 bg-white/90 rounded-full text-stone-500 hover:text-stone-900 hover:bg-white transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                aria-label="Remove from wishlist"
              >
                <X size={14} />
              </button>

              {/* Image */}
              <Link href={`/products/${product.slug}`} className="block relative overflow-hidden bg-stone-50 aspect-[3/4]">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {product.isNew && (
                  <span className="absolute top-3 left-3 bg-stone-900 text-white text-[10px] tracking-widest uppercase px-2 py-1">
                    New
                  </span>
                )}
                {hasDiscount && (
                  <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] tracking-widest uppercase px-2 py-1">
                    Sale
                  </span>
                )}
              </Link>

              {/* Info */}
              <div className="mt-3 space-y-1 px-0.5">
                <Link
                  href={`/products/${product.slug}`}
                  className="block text-sm font-medium leading-tight hover:text-stone-600 transition-colors"
                >
                  {product.name}
                </Link>
                <p className="text-xs text-stone-400">{product.shortDescription}</p>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className={hasDiscount ? "text-sm text-red-600 font-medium" : "text-sm"}>
                    {formatPrice(displayPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs text-stone-400 line-through">{formatPrice(product.price)}</span>
                  )}
                </div>

                {/* Move to cart */}
                <button
                  onClick={() => handleMoveToCart(product.id)}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 border border-stone-900 text-xs tracking-widest uppercase hover:bg-stone-900 hover:text-white transition-colors"
                >
                  <ShoppingBag size={12} />
                  Add to Bag
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Continue shopping */}
      <div className="mt-16 text-center border-t border-stone-100 pt-12">
        <Link
          href="/products"
          className="inline-block text-xs tracking-widest uppercase underline underline-offset-4 hover:text-stone-600 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
