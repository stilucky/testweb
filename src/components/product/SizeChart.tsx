"use client";

import { X, Ruler } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import BodyMeasureDiagram from "./BodyMeasureDiagram";

const womenSizes = [
  { size: "XS", us: "0–2",   bust: '32" / 81cm',  waist: '24" / 61cm',  hip: '34" / 86cm',  height: "5'2\"–5'5\"" },
  { size: "S",  us: "4–6",   bust: '34" / 86cm',  waist: '26" / 66cm',  hip: '36" / 91cm',  height: "5'4\"–5'7\"" },
  { size: "M",  us: "8–10",  bust: '36" / 91cm',  waist: '28" / 71cm',  hip: '38" / 97cm',  height: "5'5\"–5'8\"" },
  { size: "L",  us: "12–14", bust: '38" / 97cm',  waist: '30" / 76cm',  hip: '40" / 102cm', height: "5'6\"–5'9\"" },
  { size: "XL", us: "16–18", bust: '40" / 102cm', waist: '32" / 81cm',  hip: '42" / 107cm', height: "5'7\"–5'10\"" },
];

const menSizes = [
  { size: "XS", us: "34",    chest: '34" / 86cm',  waist: '28" / 71cm',  shoulder: '16" / 41cm', height: "5'6\"–5'8\"" },
  { size: "S",  us: "36",    chest: '36" / 91cm',  waist: '30" / 76cm',  shoulder: '17" / 43cm', height: "5'7\"–5'9\"" },
  { size: "M",  us: "38–40", chest: '38" / 97cm',  waist: '32" / 81cm',  shoulder: '18" / 46cm', height: "5'9\"–5'11\"" },
  { size: "L",  us: "42–44", chest: '42" / 107cm', waist: '35" / 89cm',  shoulder: '19" / 48cm', height: "5'11\"–6'1\"" },
  { size: "XL", us: "46–48", chest: '46" / 117cm', waist: '38" / 97cm',  shoulder: '20" / 51cm', height: "6'0\"–6'2\"" },
];

const howToMeasure = [
  {
    label: "Bust / Chest",
    desc: "Measure around the fullest part of your chest, keeping the tape parallel to the floor.",
  },
  {
    label: "Waist",
    desc: "Measure around your natural waistline, the narrowest part of your torso.",
  },
  {
    label: "Hip",
    desc: "Stand with feet together and measure around the fullest part of your hips.",
  },
  {
    label: "Shoulder",
    desc: "Measure straight across the back from shoulder seam to shoulder seam.",
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
  gender?: "women" | "men" | "unisex";
}

export default function SizeChart({ open, onClose, gender = "women" }: Props) {
  const [unit, setUnit] = useState<"in" | "cm">("in");
  const [tab, setTab] = useState<"chart" | "how">("chart");

  const sizes = gender === "men" ? menSizes : womenSizes;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 z-50 transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-2">
            <Ruler size={15} className="text-stone-400" />
            <h2 className="text-xs tracking-widest uppercase font-medium">Size Chart</h2>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-900 transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-100 shrink-0">
          {(["chart", "how"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 py-3 text-xs tracking-widests uppercase transition-colors",
                tab === t
                  ? "border-b-2 border-stone-900 text-stone-900"
                  : "text-stone-400 hover:text-stone-700"
              )}
            >
              {t === "chart" ? "Size Chart" : "How to Measure"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {tab === "chart" && (
            <div className="p-6">
              {/* Unit toggle */}
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs text-stone-500">
                  {gender === "men" ? "Men" : "Women"} · Regular Fit
                </p>
                <div className="flex border border-stone-200 text-xs">
                  {(["in", "cm"] as const).map((u) => (
                    <button
                      key={u}
                      onClick={() => setUnit(u)}
                      className={cn(
                        "px-3 py-1.5 transition-colors uppercase tracking-wider",
                        unit === u ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-50"
                      )}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table — Women */}
              {gender !== "men" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200">
                        {["Size", "US", "Bust", "Waist", "Hip", "Height"].map((h) => (
                          <th key={h} className="text-left text-[10px] tracking-widests uppercase text-stone-400 font-normal pb-3 pr-4 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {womenSizes.map((row) => (
                        <tr key={row.size} className="hover:bg-stone-50/50 transition-colors">
                          <td className="py-3 pr-4 font-medium text-stone-900">{row.size}</td>
                          <td className="py-3 pr-4 text-stone-500 text-xs">{row.us}</td>
                          <td className="py-3 pr-4 text-stone-700 text-xs whitespace-nowrap">
                            {unit === "in" ? row.bust.split(" / ")[0] : row.bust.split(" / ")[1]}
                          </td>
                          <td className="py-3 pr-4 text-stone-700 text-xs whitespace-nowrap">
                            {unit === "in" ? row.waist.split(" / ")[0] : row.waist.split(" / ")[1]}
                          </td>
                          <td className="py-3 pr-4 text-stone-700 text-xs whitespace-nowrap">
                            {unit === "in" ? row.hip.split(" / ")[0] : row.hip.split(" / ")[1]}
                          </td>
                          <td className="py-3 text-stone-400 text-xs whitespace-nowrap">{row.height}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Table — Men */}
              {gender === "men" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200">
                        {["Size", "US", "Chest", "Waist", "Shoulder", "Height"].map((h) => (
                          <th key={h} className="text-left text-[10px] tracking-widests uppercase text-stone-400 font-normal pb-3 pr-4 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {menSizes.map((row) => (
                        <tr key={row.size} className="hover:bg-stone-50/50 transition-colors">
                          <td className="py-3 pr-4 font-medium text-stone-900">{row.size}</td>
                          <td className="py-3 pr-4 text-stone-500 text-xs">{row.us}</td>
                          <td className="py-3 pr-4 text-stone-700 text-xs whitespace-nowrap">
                            {unit === "in" ? row.chest.split(" / ")[0] : row.chest.split(" / ")[1]}
                          </td>
                          <td className="py-3 pr-4 text-stone-700 text-xs whitespace-nowrap">
                            {unit === "in" ? row.waist.split(" / ")[0] : row.waist.split(" / ")[1]}
                          </td>
                          <td className="py-3 pr-4 text-stone-700 text-xs whitespace-nowrap">
                            {unit === "in" ? row.shoulder.split(" / ")[0] : row.shoulder.split(" / ")[1]}
                          </td>
                          <td className="py-3 text-stone-400 text-xs whitespace-nowrap">{row.height}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <p className="text-[11px] text-stone-400 mt-6 leading-relaxed">
                Measurements are body measurements, not garment measurements. For the best fit, measure yourself and compare to the chart above.
              </p>

              {/* Fit note */}
              <div className="mt-6 border border-stone-100 p-4 space-y-2">
                <p className="text-xs tracking-widests uppercase text-stone-400 mb-3">Fit Notes</p>
                {[
                  { label: "True to size", desc: "This style fits as expected." },
                  { label: "Model info", desc: "Model is 5'10\" and wearing a size S." },
                  { label: "Fabric", desc: "Non-stretch woven fabric — size up if between sizes." },
                ].map(({ label, desc }) => (
                  <div key={label} className="flex gap-2 text-xs">
                    <span className="text-stone-900 font-medium shrink-0">{label} —</span>
                    <span className="text-stone-500">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "how" && (
            <div className="p-6 space-y-6">
              {/* Diagram */}
              <div className="bg-stone-50 rounded p-4">
                <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400 text-center mb-4">
                  Measurement Guide
                </p>
                <BodyMeasureDiagram gender={gender} />
              </div>

              <p className="text-xs text-stone-400 leading-relaxed">
                Dùng thước dây mềm để đo chính xác nhất. Nên nhờ người khác hỗ trợ khi đo vai và chiều cao.
              </p>

              {howToMeasure.map(({ label, desc }) => (
                <div key={label} className="flex gap-4 pb-5 border-b border-stone-100 last:border-0">
                  <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center shrink-0">
                    <Ruler size={13} className="text-stone-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium tracking-wide mb-1">{label}</p>
                    <p className="text-xs text-stone-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
