"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Product } from "@/types";
import { cn } from "@/lib/utils";
import { useWishlistStore } from "@/store/wishlistStore";
import { useLocaleStore, formatLocalPrice } from "@/store/localeStore";
import { useTranslations } from "@/lib/i18n";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { toggleItem, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(product.id);
  const currency = useLocaleStore((s) => s.currency);
  const language = useLocaleStore((s) => s.language);
  const t = useTranslations(language);

  const displayPrice = product.salePrice ?? product.price;
  const hasDiscount = product.salePrice !== undefined;

  return (
    <div className="group relative">
      {/* Image container */}
      <Link href={`/products/${product.slug}`} className="block relative overflow-hidden bg-stone-50 aspect-[3/4]">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          priority={priority}
          className={cn(
            "object-cover transition-all duration-700",
            product.images[1] && "md:group-hover:opacity-0"
          )}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {product.images[1] && (
          <Image
            src={product.images[1]}
            alt={product.name}
            fill
            className={cn(
              "object-cover transition-all duration-700",
              "opacity-0 md:group-hover:opacity-100"
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.isNew && (
            <span className="bg-stone-900 text-white text-[10px] tracking-widest uppercase px-2 py-1">
              {t("new")}
            </span>
          )}
          {hasDiscount && (
            <span className="bg-red-600 text-white text-[10px] tracking-widest uppercase px-2 py-1">
              Sale
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleItem(product);
          }}
          className={cn(
            "absolute top-3 right-3 p-2 bg-white/90 rounded-full transition-all duration-200",
            "opacity-0 group-hover:opacity-100",
            wishlisted ? "text-red-500" : "text-stone-600 hover:text-stone-900"
          )}
          aria-label="Add to wishlist"
        >
          <Heart size={14} fill={wishlisted ? "currentColor" : "none"} />
        </button>

        {/* Quick add (desktop) */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 bg-white/95 py-3 text-center text-xs tracking-widest uppercase transition-all duration-300",
          "hidden md:block",
          "translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
        )}>
          <span className="hover:text-stone-500 transition-colors">
            {t("addToBag")}
          </span>
        </div>
      </Link>

      {/* Info */}
      <div className="mt-3 space-y-1 px-0.5">
        {/* H4 Product name: Jost 14px wt 400 ls 0.04em */}
        <Link
          href={`/products/${product.slug}`}
          className="block leading-tight hover:text-stone-600 transition-colors line-clamp-1 type-product-name"
        >
          {product.name}
        </Link>
        <p className="text-xs text-stone-400 line-clamp-1" style={{ letterSpacing: "0.01em", fontWeight: 300 }}>
          {product.shortDescription}
        </p>
        <div className="flex items-center gap-2 pt-0.5">
          {/* Price: Jost 13px wt 400 ls 0.04em */}
          <span className={cn("type-price", hasDiscount && "text-red-600")}>
            {formatLocalPrice(
              displayPrice,
              currency,
              hasDiscount ? product.salePriceCAD : product.priceCAD
            )}
          </span>
          {hasDiscount && (
            <span className="text-xs text-stone-400 line-through">
              {formatLocalPrice(product.price, currency, product.priceCAD)}
            </span>
          )}
        </div>

        {/* Color dots */}
        {product.colors.length > 1 && (
          <div className="flex gap-1.5 pt-1">
            {product.colors.map((color) => (
              <div
                key={color.name}
                title={color.name}
                className="w-3 h-3 rounded-full border border-stone-200 cursor-pointer hover:scale-125 transition-transform"
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
