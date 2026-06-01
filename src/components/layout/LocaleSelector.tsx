"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useLocaleStore, type Language, type Currency } from "@/store/localeStore";
import { cn } from "@/lib/utils";

const languages: { code: Language; label: string; native: string }[] = [
  { code: "EN", label: "English", native: "EN" },
  { code: "FR", label: "Français", native: "FR" },
];

const currencies: { code: Currency; label: string; symbol: string }[] = [
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "CAD", label: "Canadian Dollar", symbol: "CA$" },
];

export default function LocaleSelector() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { language, currency, setLanguage, setCurrency } = useLocaleStore();

  /* close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] tracking-widest uppercase transition-colors rounded-sm",
          "text-stone-500 hover:text-stone-800 hover:bg-stone-50",
          open && "text-stone-800 bg-stone-50"
        )}
      >
        <Globe size={12} className="text-stone-400" />
        <span className="font-medium">{language}</span>
        <span className="text-stone-300">·</span>
        <span>{currency}</span>
        <ChevronDown size={10} className={cn("text-stone-400 transition-transform", open && "rotate-180")} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-stone-100 shadow-xl z-50 overflow-hidden">

          {/* Language section */}
          <div className="px-4 pt-4 pb-2">
            <p className="text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-2">
              Language
            </p>
            <div className="space-y-0.5">
              {languages.map(({ code, label, native }) => (
                <button
                  key={code}
                  onClick={() => { setLanguage(code); }}
                  className={cn(
                    "w-full flex items-center justify-between px-2 py-2 text-left transition-colors rounded-sm",
                    language === code
                      ? "bg-stone-900 text-white"
                      : "text-stone-600 hover:bg-stone-50"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={cn(
                      "text-[10px] font-semibold tracking-widest w-6",
                      language === code ? "text-white" : "text-stone-400"
                    )}>
                      {native}
                    </span>
                    <span className="text-xs">{label}</span>
                  </div>
                  {language === code && <Check size={11} className="text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="mx-4 border-t border-stone-100" />

          {/* Currency section */}
          <div className="px-4 pt-3 pb-4">
            <p className="text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-2">
              Currency
            </p>
            <div className="space-y-0.5">
              {currencies.map(({ code, label, symbol }) => (
                <button
                  key={code}
                  onClick={() => { setCurrency(code); }}
                  className={cn(
                    "w-full flex items-center justify-between px-2 py-2 text-left transition-colors rounded-sm",
                    currency === code
                      ? "bg-stone-900 text-white"
                      : "text-stone-600 hover:bg-stone-50"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={cn(
                      "text-[10px] font-semibold tracking-widest w-6",
                      currency === code ? "text-white" : "text-stone-400"
                    )}>
                      {symbol}
                    </span>
                    <span className="text-xs">{code} — {label}</span>
                  </div>
                  {currency === code && <Check size={11} className="text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div className="border-t border-stone-100 px-4 py-2.5 bg-stone-50">
            <p className="text-[9px] text-stone-400 leading-relaxed">
              {language === "FR"
                ? "Votre préférence est enregistrée automatiquement."
                : "Your preference is saved automatically."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
