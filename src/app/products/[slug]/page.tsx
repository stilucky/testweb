"use client";

import { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, RotateCcw, Shield, ChevronDown, ChevronUp, Play, Film } from "lucide-react";
import { useProductStore } from "@/store/productStore";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";
import { useLocaleStore, formatLocalPrice } from "@/store/localeStore";
import { useTranslations } from "@/lib/i18n";
import ProductCard from "@/components/product/ProductCard";
import SizeChart from "@/components/product/SizeChart";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: Props) {
  const { slug } = use(params);
  const products = useProductStore((s) => s.products);
  const product = products.find((p) => p.slug === slug);

  if (!product) notFound();

  const [selectedImage, setSelectedImage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name ?? "");

  const handleColorChange = (colorName: string) => {
    setSelectedColor(colorName);
    setSelectedImage(0);
    setShowVideo(false);
  };

  const getYouTubeId = (url: string): string | null => {
    const patterns = [
      /youtube\.com\/watch\?v=([^&]+)/,
      /youtu\.be\/([^?/]+)/,
      /youtube\.com\/embed\/([^?]+)/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return null;
  };

  const videoId = product.videoUrl ? getYouTubeId(product.videoUrl) : null;
  const isNativeVideo = !!product.videoUrl && !videoId;

  const activeColor = product.colors.find((c) => c.name === selectedColor);
  const displayImages =
    activeColor?.images?.length ? activeColor.images : product.images;
  const [wishlisted, setWishlisted] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("description");
  const [sizeChartOpen, setSizeChartOpen] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const currency = useLocaleStore((s) => s.currency);
  const language = useLocaleStore((s) => s.language);
  const t = useTranslations(language);

  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      return;
    }
    addItem(product, selectedSize, selectedColor);
  };

  const accordionSections = [
    {
      id: "description",
      label: t("description"),
      content: (language === "FR" && product.descriptionFR) ? product.descriptionFR : product.description,
    },
    {
      id: "details",
      label: t("detailsCare"),
      content: language === "FR"
        ? "Nettoyage à sec recommandé. Conserver dans un endroit frais et sec. Les matières peuvent varier selon la couleur."
        : "Dry clean recommended. Store in a cool, dry place. Material may vary by color.",
    },
    {
      id: "returns",
      label: t("shippingReturns"),
      content: language === "FR"
        ? "Retours gratuits sous 30 jours pour articles non portés avec étiquettes d'origine."
        : "Free returns within 30 days for unworn items with original tags attached.",
    },
  ];

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="text-xs text-stone-400 mb-8 flex gap-2 items-center">
        <Link href="/" className="hover:text-stone-700 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-stone-700 transition-colors">Shop</Link>
        <span>/</span>
        <Link href={`/products?category=${product.category}`} className="hover:text-stone-700 transition-colors capitalize">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-stone-700">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        {/* Gallery */}
        <div className="flex gap-3">
          {/* Thumbnails */}
          <div className="flex flex-col gap-2 w-16 shrink-0">
            {displayImages.map((img, i) => (
              <button
                key={i}
                onClick={() => { setSelectedImage(i); setShowVideo(false); }}
                className={cn(
                  "relative w-16 h-20 overflow-hidden border-2 transition-all",
                  i === selectedImage && !showVideo ? "border-stone-900" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <Image src={img} alt={`${product.name} ${i + 1}`} fill sizes="64px" className="object-cover" />
              </button>
            ))}

            {/* Video thumbnail */}
            {(videoId || isNativeVideo) && (
              <button
                onClick={() => setShowVideo(true)}
                className={cn(
                  "relative w-16 h-20 overflow-hidden border-2 transition-all bg-stone-900 flex items-center justify-center",
                  showVideo ? "border-stone-900" : "border-transparent opacity-60 hover:opacity-100"
                )}
                title="Watch video"
              >
                {videoId ? (
                  <Image
                    src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                    alt="Video preview"
                    fill
                    sizes="64px"
                    className="object-cover opacity-50"
                  />
                ) : (
                  <Film size={18} className="text-white/60" />
                )}
                <Play size={18} className="relative z-10 text-white fill-white" />
              </button>
            )}
          </div>

          {/* Main display: image, YouTube embed, or native video */}
          <div className="flex-1 relative aspect-[3/4] bg-stone-900 overflow-hidden">
            {showVideo && videoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                title={`${product.name} video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            ) : showVideo && isNativeVideo ? (
              <video
                src={product.videoUrl!}
                autoPlay
                controls
                playsInline
                className="absolute inset-0 w-full h-full object-contain bg-black"
              />
            ) : (
              <>
                <Image
                  src={displayImages[selectedImage] ?? displayImages[0]}
                  alt={`${product.name} — ${selectedColor}`}
                  fill
                  priority
                  className="object-cover transition-opacity duration-300"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {product.isNew && (
                  <span className="absolute top-4 left-4 bg-stone-900 text-white text-[10px] tracking-widest uppercase px-2 py-1">
                    New
                  </span>
                )}
                {(videoId || isNativeVideo) && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/60 hover:bg-black/80 text-white text-[10px] tracking-widest uppercase px-3 py-2 transition-colors backdrop-blur-sm"
                  >
                    <Play size={11} className="fill-white" />
                    Watch
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <p className="type-label text-stone-400 mb-2 capitalize">
            {product.category}
          </p>
          <h1
            className="text-2xl md:text-3xl text-stone-900 mb-3"
            style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 400 }}
          >
            {product.name}
          </h1>
          <p className="type-quote text-stone-400 mb-6">
            {(language === "FR" && product.shortDescriptionFR) ? product.shortDescriptionFR : product.shortDescription}
          </p>

          {/* Price */}
          <div className="flex items-center gap-3 mb-8 flex-wrap">
            <span
              className={cn("text-2xl", product.salePrice && "text-red-600")}
              style={{ fontFamily: "var(--font-cormorant), serif" }}
            >
              {formatLocalPrice(
              product.salePrice ?? product.price,
              currency,
              product.salePrice ? product.salePriceCAD : product.priceCAD
            )}
            </span>
            {product.salePrice && (
              <span className="text-stone-400 line-through text-lg" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                {formatLocalPrice(product.price, currency, product.priceCAD)}
              </span>
            )}
            <span className="text-[10px] tracking-widest uppercase text-stone-300 ml-1">
              {currency}
              {currency === "CAD" && <span className="text-stone-300"> · est.</span>}
            </span>
          </div>

          {/* Color selector */}
          <div className="mb-6">
            <p className="text-xs tracking-widest uppercase mb-3 flex justify-between">
              <span>Color</span>
              <span className="text-stone-400 normal-case tracking-normal">{selectedColor}</span>
            </p>
            <div className="flex gap-2">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => handleColorChange(color.name)}
                  title={color.name}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    selectedColor === color.name
                      ? "border-stone-900 scale-110 shadow-sm"
                      : "border-stone-200 hover:border-stone-400"
                  )}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          </div>

          {/* Size selector */}
          <div className="mb-8">
            <p className={cn("text-xs tracking-widest uppercase mb-3", sizeError && "text-red-600")}>
              {sizeError ? t("selectSize") : t("size")}
            </p>
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "w-12 h-12 border text-xs transition-all",
                    selectedSize === size
                      ? "border-stone-900 bg-stone-900 text-white"
                      : sizeError
                      ? "border-red-300 text-stone-600 hover:border-stone-400"
                      : "border-stone-200 text-stone-600 hover:border-stone-400"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
            <button
              onClick={() => setSizeChartOpen(true)}
              className="text-xs text-stone-400 underline hover:text-stone-700 mt-2 inline-block"
            >
              {t("sizeChart")}
            </button>
          </div>

          {/* Scarcity — Jost 11px wt400 italic ls0.02em */}
          {product.stock > 0 && product.stock <= 5 && (
            <p className="type-scarcity text-stone-400 mb-4">
              Only {product.stock} {product.stock === 1 ? "piece" : "pieces"} remaining
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              className="flex-1 py-4 bg-stone-900 text-white text-xs tracking-widest uppercase hover:bg-stone-700 transition-colors font-medium"
            >
              {t("addToBag")}
            </button>
            <button
              onClick={() => setWishlisted(!wishlisted)}
              className={cn(
                "w-14 border flex items-center justify-center transition-all",
                wishlisted
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-200 text-stone-600 hover:border-stone-400"
              )}
              aria-label="Add to wishlist"
            >
              <Heart size={16} fill={wishlisted ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-3 mb-8 py-6 border-y border-stone-100">
            {[
              { icon: RotateCcw, label: "Free Returns", sub: "Within 30 days" },
              { icon: Shield, label: "Authenticity", sub: "Guaranteed" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center text-center gap-1">
                <Icon size={18} className="text-stone-400" />
                <p className="text-xs font-medium">{label}</p>
                <p className="text-[11px] text-stone-400">{sub}</p>
              </div>
            ))}
          </div>

          {/* Accordion */}
          <div className="space-y-0 border-t border-stone-100">
            {accordionSections.map((section) => (
              <div key={section.id} className="border-b border-stone-100">
                <button
                  onClick={() =>
                    setExpandedSection(expandedSection === section.id ? null : section.id)
                  }
                  className="flex items-center justify-between w-full py-4 text-left"
                >
                  <span className="text-xs tracking-widest uppercase">{section.label}</span>
                  {expandedSection === section.id ? (
                    <ChevronUp size={14} className="text-stone-400" />
                  ) : (
                    <ChevronDown size={14} className="text-stone-400" />
                  )}
                </button>
                {expandedSection === section.id && (
                  <p className="pb-5 text-sm text-stone-500 leading-relaxed pr-4">
                    {section.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <SizeChart
        open={sizeChartOpen}
        onClose={() => setSizeChartOpen(false)}
        gender={product.gender}
      />

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-24">
          <div className="text-center mb-10">
            <p className="type-label text-stone-400 mb-3">{t("youMayAlsoLove")}</p>
            <h2
              className="text-3xl md:text-4xl"
              style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
            >
              {t("relatedPieces")}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
