"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown, Lock } from "lucide-react";
import Link from "next/link";
import { useProductStore } from "@/store/productStore";
import { useCollectionStore } from "@/store/collectionStore";
import { useAuthStore } from "@/store/authStore";
import ProductCard from "@/components/product/ProductCard";
import { cn } from "@/lib/utils";
import { useLocaleStore } from "@/store/localeStore";
import { useTranslations } from "@/lib/i18n";


const sizes = ["XS", "S", "M", "L", "XL"];
const priceRanges = [
  { labelEN: "Under $150",   labelFR: "Moins de 150$",  min: 0,   max: 150 },
  { labelEN: "$150 – $250",  labelFR: "150$ – 250$",    min: 150, max: 250 },
  { labelEN: "$250 – $350",  labelFR: "250$ – 350$",    min: 250, max: 350 },
  { labelEN: "Over $350",    labelFR: "Plus de 350$",   min: 350, max: Infinity },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const filterParam      = searchParams.get("filter");
  const categoryParam    = searchParams.get("category") ?? "all";
  const collectionParam  = searchParams.get("collection");

  const products       = useProductStore((s) => s.products);
  const { collections } = useCollectionStore();
  const currentUser    = useAuthStore((s) => s.currentUser);
  const language       = useLocaleStore((s) => s.language);
  const t              = useTranslations(language);

  const sortOptions = [
    { label: t("newest"),      value: "newest" },
    { label: t("priceLowHigh"),value: "price-asc" },
    { label: t("priceHighLow"),value: "price-desc" },
    { label: t("bestSellersHeading"), value: "bestseller" },
  ];
  const categoryOptions = [
    { label: t("allCategories"), value: "all" },
    { label: t("dresses"),       value: "dresses" },
    { label: t("tops"),          value: "tops" },
    { label: t("bottoms"),       value: "bottoms" },
    { label: t("outerwear"),     value: "outerwear" },
  ];

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);

  // Sync category khi URL thay đổi
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const activeCollection = collectionParam
    ? collections.find((c) => c.slug === collectionParam && c.status === "active")
    : null;
  const isMembersOnlyCollection =
    collectionParam === "pre-fall-2026" || activeCollection?.membersOnly === true;
  const membersOnlyProductIds = useMemo(() => new Set(
    collections
      .filter((c) => c.membersOnly || c.slug === "pre-fall-2026")
      .flatMap((c) => c.productIds)
  ), [collections]);

  const filtered = useMemo(() => {
    let list = [...products];

    // Collection filter takes priority over other filter params
    if (collectionParam) {
      const col = collections.find((c) => c.slug === collectionParam && c.status === "active");
      if (col) {
        list = list.filter((p) => col.productIds.includes(p.id));
      }
    } else if (filterParam === "new") {
      list = list.filter((p) => p.isNew);
    } else if (filterParam === "bestseller") {
      list = list.filter((p) => p.isBestSeller);
    } else if (filterParam === "occasion") {
      list = list.filter((p) =>
        p.tags.includes("occasion") || p.tags.includes("formal") || p.tags.includes("cocktail")
      );
    }

    if (!currentUser && !isMembersOnlyCollection) {
      list = list.filter((p) => !membersOnlyProductIds.has(p.id));
    }

    if (selectedCategory !== "all") {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (selectedSizes.length > 0) {
      list = list.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
    }

    if (selectedPrice !== null) {
      const range = priceRanges[selectedPrice];
      list = list.filter((p) => {
        const price = p.salePrice ?? p.price;
        return price >= range.min && price < range.max;
      });
    }

    if (sortBy === "price-asc")
      list.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    else if (sortBy === "price-desc")
      list.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
    else if (sortBy === "bestseller")
      list.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));

    return list;
  }, [products, collections, collectionParam, filterParam, currentUser, isMembersOnlyCollection, membersOnlyProductIds, selectedCategory, selectedSizes, selectedPrice, sortBy]);

  const pageTitle =
    activeCollection
      ? activeCollection.name
      : filterParam === "new"
        ? t("newInHeading")
        : filterParam === "bestseller"
          ? t("bestSellersHeading")
          : filterParam === "occasion"
            ? t("occasionWear")
            : selectedCategory !== "all"
              ? categoryOptions.find((c) => c.value === selectedCategory)?.label ?? t("allCategories")
              : t("shopAll");

  const hasFilters =
    selectedCategory !== "all" || selectedSizes.length > 0 || selectedPrice !== null;

  // Members-only gate
  if (isMembersOnlyCollection && !currentUser) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/60 px-4 py-24 text-center backdrop-blur-sm">
        <Link
          href="/products"
          aria-label="Close members only notice"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center bg-white/90 text-stone-600 shadow-sm transition-colors hover:bg-white hover:text-stone-900"
        >
          <X size={16} />
        </Link>
        <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mb-6">
          <Lock size={22} className="text-stone-400" />
        </div>
        <p className="text-[10px] tracking-[0.25em] uppercase text-white/55 mb-3">Members Only</p>
        <h1
          className="text-3xl md:text-4xl font-light mb-4 text-white"
          style={{ fontFamily: "var(--font-cormorant), serif" }}
        >
          {activeCollection?.name ?? "Pre-Fall 2026"}
        </h1>
        <p className="text-sm text-white/70 max-w-sm mb-8 leading-relaxed">
          This collection is exclusively available to Lunelle members. Sign in or create a free account to unlock access.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/auth?tab=register"
            className="px-8 py-3.5 bg-white text-stone-900 text-[10px] tracking-[0.2em] uppercase hover:bg-stone-100 transition-colors"
          >
            Create Account — Free
          </Link>
          <Link
            href="/auth"
            className="px-8 py-3.5 border border-white/40 text-white text-[10px] tracking-[0.2em] uppercase hover:bg-white hover:text-stone-900 transition-colors"
          >
            Sign In
          </Link>
        </div>
        <p className="text-xs text-white/45 mt-6">Members receive a 10% welcome discount on their first order.</p>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-12">
      {/* Page header */}
      <div className="text-center mb-10">
        <h1
          className="text-2xl md:text-3xl text-stone-900"
          style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
        >
          {pageTitle}
        </h1>
        <p className="text-sm text-stone-400 mt-2">{filtered.length} {t("pieces")}</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between border-y border-stone-100 py-4 mb-8">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center gap-2 text-xs tracking-widest uppercase hover:text-stone-600 transition-colors"
        >
          <SlidersHorizontal size={14} />
          {t("filters")}
          {hasFilters && (
            <span className="bg-stone-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {[selectedCategory !== "all", selectedSizes.length > 0, selectedPrice !== null].filter(Boolean).length}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-2 text-xs tracking-widest uppercase hover:text-stone-600 transition-colors"
          >
            {t("sortBy")}: {sortOptions.find((s) => s.value === sortBy)?.label}
            <ChevronDown size={14} className={cn("transition-transform", sortOpen && "rotate-180")} />
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full mt-2 bg-white border border-stone-100 shadow-lg min-w-48 z-20 py-2">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                  className={cn(
                    "block w-full text-left px-4 py-2.5 text-xs tracking-wide hover:bg-stone-50 transition-colors",
                    sortBy === opt.value && "font-medium"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filters sidebar */}
        {filtersOpen && (
          <div className="w-56 shrink-0 space-y-8">
            {/* Category */}
            <div>
              <p className="text-xs tracking-widest uppercase mb-4 font-medium">{t("categoryLabel")}</p>
              <div className="space-y-2">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={cn(
                      "block text-sm transition-colors hover:text-stone-900",
                      selectedCategory === cat.value ? "text-stone-900 font-medium" : "text-stone-400"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <p className="text-xs tracking-widest uppercase mb-4 font-medium">{t("sizeLabel")}</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={cn(
                      "w-10 h-10 border text-xs transition-all",
                      selectedSizes.includes(size)
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-200 text-stone-600 hover:border-stone-400"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <p className="text-xs tracking-widest uppercase mb-4 font-medium">{t("priceLabel")}</p>
              <div className="space-y-2">
                {priceRanges.map((range, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedPrice(selectedPrice === i ? null : i)}
                    className={cn(
                      "block text-sm transition-colors hover:text-stone-900",
                      selectedPrice === i ? "text-stone-900 font-medium" : "text-stone-400"
                    )}
                  >
                    {language === "FR" ? range.labelFR : range.labelEN}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear */}
            {hasFilters && (
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedSizes([]);
                  setSelectedPrice(null);
                }}
                className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-900 transition-colors"
              >
                <X size={12} /> {t("clearFilters")}
              </button>
            )}
          </div>
        )}

        {/* Product grid */}
        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <p
                className="text-2xl text-stone-300 mb-4"
                style={{ fontFamily: "var(--font-cormorant), serif" }}
              >
                {t("noResults")}
              </p>
              <p className="text-sm text-stone-400">{t("noResultsSub")}</p>
            </div>
          ) : (
            <div
              className={cn(
                "grid gap-4 md:gap-6",
                filtersOpen
                  ? "grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              )}
            >
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 4} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-12">
        <div className="text-center mb-10">
          <div className="h-12 w-48 bg-stone-100 rounded mx-auto mb-3 animate-pulse" />
          <div className="h-4 w-24 bg-stone-100 rounded mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[3/4] bg-stone-100 animate-pulse" />
              <div className="h-4 bg-stone-100 rounded animate-pulse" />
              <div className="h-3 w-2/3 bg-stone-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
