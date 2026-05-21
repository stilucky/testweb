"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, itemCount } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 text-center">
        <ShoppingBag size={64} className="text-stone-200" />
        <div>
          <h1
            className="text-4xl text-stone-400"
            style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
          >
            Your bag is empty
          </h1>
          <p className="text-stone-400 mt-2 text-sm">Discover our latest collections</p>
        </div>
        <Link
          href="/products"
          className="mt-4 inline-block bg-stone-900 text-white text-xs tracking-widest uppercase px-10 py-4 hover:bg-stone-700 transition-colors"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  const shipping = total() >= 200 ? 0 : 15;
  const orderTotal = total() + shipping;

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-12">
      <div className="mb-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-stone-400 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft size={14} /> Continue Shopping
        </Link>
        <h1
          className="text-4xl md:text-5xl mt-4"
          style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
        >
          Shopping Bag ({itemCount()})
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Items */}
        <div className="lg:col-span-2 divide-y divide-stone-100">
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-6 py-6">
              <Link href={`/products/${item.product.slug}`} className="relative w-24 h-32 md:w-32 md:h-44 bg-stone-50 shrink-0 overflow-hidden">
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </Link>
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div>
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="font-medium hover:underline"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-stone-400 mt-1">
                      Size: {item.selectedSize} · Color: {item.selectedColor}
                    </p>
                    <p className="text-xs text-stone-400 capitalize mt-0.5">
                      {item.product.category}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      removeItem(item.product.id, item.selectedSize, item.selectedColor)
                    }
                    className="text-stone-300 hover:text-stone-900 transition-colors h-fit"
                    aria-label="Remove item"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center border border-stone-200">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.product.id,
                          item.selectedSize,
                          item.selectedColor,
                          item.quantity - 1
                        )
                      }
                      className="px-3 py-2 hover:bg-stone-50 transition-colors"
                      aria-label="Decrease"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="px-4 text-sm">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.product.id,
                          item.selectedSize,
                          item.selectedColor,
                          item.quantity + 1
                        )
                      }
                      className="px-3 py-2 hover:bg-stone-50 transition-colors"
                      aria-label="Increase"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatPrice(
                        (item.product.salePrice ?? item.product.price) * item.quantity
                      )}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-stone-400">
                        {formatPrice(item.product.salePrice ?? item.product.price)} each
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-stone-50 p-6 sticky top-24">
            <h2
              className="text-2xl mb-6"
              style={{ fontFamily: "var(--font-cormorant), serif" }}
            >
              Order Summary
            </h2>

            {/* Promo code */}
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="Promo code"
                className="flex-1 px-3 py-2.5 border border-stone-200 text-sm bg-white focus:outline-none focus:border-stone-800 transition-colors"
              />
              <button className="px-4 py-2.5 border border-stone-900 text-xs tracking-widest uppercase hover:bg-stone-900 hover:text-white transition-colors whitespace-nowrap">
                Apply
              </button>
            </div>

            <div className="space-y-3 text-sm border-t border-stone-200 pt-5">
              <div className="flex justify-between">
                <span className="text-stone-500">Subtotal</span>
                <span>{formatPrice(total())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Shipping</span>
                <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-stone-400">
                  Add {formatPrice(200 - total())} more for free shipping
                </p>
              )}
              <div className="flex justify-between font-medium text-base pt-3 border-t border-stone-200">
                <span>Total</span>
                <span
                  style={{ fontFamily: "var(--font-cormorant), serif" }}
                  className="text-xl"
                >
                  {formatPrice(orderTotal)}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full mt-6 py-4 bg-stone-900 text-white text-xs tracking-widest uppercase text-center hover:bg-stone-700 transition-colors font-medium"
            >
              Proceed to Checkout
            </Link>
            <p className="text-xs text-stone-400 text-center mt-3">
              Secure checkout · SSL encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
