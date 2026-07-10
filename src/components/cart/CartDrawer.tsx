"use client";

import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { useLocaleStore, formatLocalPrice, CAD_RATE } from "@/store/localeStore";
import { useTranslations } from "@/lib/i18n";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, itemCount } = useCartStore();
  const currency = useLocaleStore((s) => s.currency);
  const language = useLocaleStore((s) => s.language);
  const t = useTranslations(language);

  return (
    <>
      {isOpen && <button className="fixed inset-0 w-full h-full bg-black/40 z-50 transition-opacity cursor-default" onClick={closeCart} aria-label="Close cart" />}

      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} />
            <span className="text-xs tracking-widest uppercase font-medium">
              {t("yourBag")} ({itemCount()})
            </span>
          </div>
          <button onClick={closeCart} className="p-1 hover:bg-stone-100 rounded transition-colors" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
              <ShoppingBag size={48} className="text-stone-200" />
              <div>
                <p className="text-2xl text-stone-400" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                  {t("emptyBag")}
                </p>
                <p className="text-sm text-stone-400 mt-1">
                  {language === "FR" ? "Découvrez nos dernières pièces" : "Discover our latest pieces"}
                </p>
              </div>
              <Link href="/products" onClick={closeCart}
                className="mt-4 px-8 py-3 bg-stone-900 text-white text-xs tracking-widest uppercase hover:bg-stone-700 transition-colors">
                {language === "FR" ? "Découvrir" : "Shop Now"}
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-4 px-6 py-5">
                  <div className="relative w-20 h-28 bg-stone-50 shrink-0 overflow-hidden">
                    <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" sizes="80px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <Link href={`/products/${item.product.slug}`} onClick={closeCart}
                        className="text-sm font-medium line-clamp-2 hover:underline pr-2">
                        {item.product.name}
                      </Link>
                      <button onClick={() => removeItem(item.product.id, item.selectedSize, item.selectedColor)}
                        className="shrink-0 text-stone-400 hover:text-stone-900 transition-colors" aria-label={t("remove")}>
                        <X size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-stone-400 mt-1">
                      {t("size")}: {item.selectedSize} · {t("color")}: {item.selectedColor}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-stone-200">
                        <button onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                          className="px-2 py-1 hover:bg-stone-50 transition-colors" aria-label="−">
                          <Minus size={12} />
                        </button>
                        <span className="px-3 text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                          className="px-2 py-1 hover:bg-stone-50 transition-colors" aria-label="+">
                          <Plus size={12} />
                        </button>
                      </div>
                      <p className="text-sm font-medium">
                        {formatLocalPrice(
                          (item.product.salePrice ?? item.product.price) * item.quantity,
                          currency,
                          item.product.salePriceCAD
                            ? item.product.salePriceCAD * item.quantity
                            : item.product.priceCAD
                              ? item.product.priceCAD * item.quantity
                              : undefined
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-stone-100 px-6 py-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs tracking-wider uppercase text-stone-500">{t("subtotal")}</span>
              <span className="text-lg font-medium" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                {formatLocalPrice(total() / CAD_RATE, currency, total())}
              </span>
            </div>
            <p className="text-xs text-stone-400">
              {language === "FR" ? "Taxes calculées lors du paiement" : "Taxes calculated at checkout"}
            </p>
            <Link href="/checkout" onClick={closeCart}
              className="block w-full py-4 bg-stone-900 text-white text-xs tracking-widest uppercase text-center hover:bg-stone-700 transition-colors font-medium">
              {t("checkout")}
            </Link>
            <button onClick={closeCart}
              className="block w-full py-3 border border-stone-200 text-xs tracking-widest uppercase text-center hover:bg-stone-50 transition-colors">
              {t("continueShopping")}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
