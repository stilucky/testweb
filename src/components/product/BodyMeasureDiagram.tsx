interface Props {
  gender?: "women" | "men" | "unisex";
}

export default function BodyMeasureDiagram({ gender = "women" }: Props) {
  const isMen = gender === "men";

  return (
    <div className="w-full flex flex-col items-center gap-6 py-2">
      <svg
        viewBox="0 0 360 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[320px]"
        aria-label="Hướng dẫn cách đo áo"
      >
        {/* ── subtle background ── */}
        <rect x="55" y="50" width="250" height="310" rx="2" fill="#f5f0eb" opacity="0.5" />

        {/* ════════════════════════════════
            SHIRT / GARMENT OUTLINE
        ════════════════════════════════ */}

        {/* main garment shape */}
        <path
          d={isMen
            ? /* Men: broader shoulder, less taper */
              `M 130,74 L 88,62 L 18,92 L 16,148 L 88,128 L 82,318 L 278,318 L 272,128 L 344,148 L 342,92 L 272,62 L 230,74 Q 180,108 130,74 Z`
            : /* Women: narrower shoulder, slight waist taper */
              `M 132,74 L 92,62 L 22,92 L 20,148 L 92,128 L 88,318 L 272,318 L 268,128 L 340,148 L 338,92 L 268,62 L 228,74 Q 180,108 132,74 Z`
          }
          stroke="#8c7b6e"
          strokeWidth="1.8"
          strokeLinejoin="round"
          fill="#faf8f5"
        />

        {/* collar inner curve (V-neck detail) */}
        <path
          d={isMen ? "M 130,74 Q 180,106 230,74" : "M 132,74 Q 180,110 228,74"}
          stroke="#b5a99e"
          strokeWidth="1"
          fill="none"
        />

        {/* centre-front button placket line */}
        <line x1="180" y1="110" x2="180" y2="318" stroke="#ddd5cc" strokeWidth="0.9" strokeDasharray="4 3" />

        {/* subtle sleeve fold lines */}
        <line x1="42"  y1="98"  x2="60"  y2="106" stroke="#ddd5cc" strokeWidth="1" />
        <line x1="318" y1="98"  x2="300" y2="106" stroke="#ddd5cc" strokeWidth="1" />

        {/* hem stitch */}
        <line
          x1={isMen ? "82" : "88"} y1="318"
          x2={isMen ? "278" : "272"} y2="318"
          stroke="#c9bdb5" strokeWidth="0.9" strokeDasharray="5 3"
        />

        {/* ════════════════════════════════
            A ─ VAI  (Shoulder Width)
        ════════════════════════════════ */}

        {/* drop lines from shirt shoulders up to measure line */}
        <line x1={isMen ? "88" : "92"}  y1="38" x2={isMen ? "88" : "92"}  y2="62" stroke="#b5a99e" strokeWidth="0.8" strokeDasharray="2 2" />
        <line x1={isMen ? "272" : "268"} y1="38" x2={isMen ? "272" : "268"} y2="62" stroke="#b5a99e" strokeWidth="0.8" strokeDasharray="2 2" />

        {/* measure bar */}
        <line x1={isMen ? "88" : "92"} y1="38" x2={isMen ? "272" : "268"} y2="38" stroke="#44403c" strokeWidth="1.2" />

        {/* end ticks */}
        <line x1={isMen ? "88" : "92"}  y1="32" x2={isMen ? "88" : "92"}  y2="44" stroke="#44403c" strokeWidth="1.5" />
        <line x1={isMen ? "272" : "268"} y1="32" x2={isMen ? "272" : "268"} y2="44" stroke="#44403c" strokeWidth="1.5" />

        {/* A label */}
        <circle cx="180" cy="38" r="10" fill="#44403c" />
        <text x="180" y="42" textAnchor="middle" fontSize="11" fill="white"
          fontFamily="Georgia,serif" fontStyle="italic" fontWeight="600">A</text>

        {/* "Vai" label */}
        <text x="180" y="22" textAnchor="middle" fontSize="9" fill="#78716c"
          fontFamily="system-ui,sans-serif" letterSpacing="0.08em">VAI · SHOULDER</text>


        {/* ════════════════════════════════
            B ─ DÀI TAY  (Sleeve Length)
        ════════════════════════════════ */}

        {/* line from shoulder seam → cuff (along top sleeve edge) */}
        <line
          x1={isMen ? "88" : "92"} y1="62"
          x2="20" y2="148"
          stroke="#44403c" strokeWidth="1.2"
        />

        {/* endpoint dots */}
        <circle cx={isMen ? "88" : "92"} cy="62"  r="3" fill="#44403c" />
        <circle cx="20"                   cy="148" r="3" fill="#44403c" />

        {/* cuff end tick (perpendicular to sleeve angle) */}
        {/* sleeve angle ≈ atan((148-62)/(88-20)) = atan(86/68) ≈ 51.6° */}
        {/* perpendicular direction: (86/√(86²+68²), -68/√(86²+68²)) = (0.784, -0.621) */}
        <line x1="15" y1="144" x2="26" y2="152" stroke="#44403c" strokeWidth="1.5" />

        {/* B label bubble, placed mid-sleeve offset */}
        <circle cx="42" cy="96" r="10" fill="#44403c" />
        <text x="42" y="100" textAnchor="middle" fontSize="11" fill="white"
          fontFamily="Georgia,serif" fontStyle="italic" fontWeight="600">B</text>

        {/* "Dài tay" label */}
        <text x="42" y="116" textAnchor="middle" fontSize="8.5" fill="#78716c"
          fontFamily="system-ui,sans-serif" letterSpacing="0.05em">DÀI TAY</text>
        <text x="42" y="128" textAnchor="middle" fontSize="8.5" fill="#b5a99e"
          fontFamily="system-ui,sans-serif">SLEEVE</text>


        {/* ════════════════════════════════
            C ─ DÀI ÁO  (Body Length)
        ════════════════════════════════ */}

        {/* drop lines from shirt to measure bar */}
        <line x1={isMen ? "272" : "268"} y1="62"  x2="330" y2="62"  stroke="#b5a99e" strokeWidth="0.8" strokeDasharray="2 2" />
        <line x1={isMen ? "278" : "272"} y1="318" x2="330" y2="318" stroke="#b5a99e" strokeWidth="0.8" strokeDasharray="2 2" />

        {/* measure bar */}
        <line x1="330" y1="62" x2="330" y2="318" stroke="#44403c" strokeWidth="1.2" />

        {/* end ticks */}
        <line x1="324" y1="62"  x2="336" y2="62"  stroke="#44403c" strokeWidth="1.5" />
        <line x1="324" y1="318" x2="336" y2="318" stroke="#44403c" strokeWidth="1.5" />

        {/* C label bubble */}
        <circle cx="330" cy="190" r="10" fill="#44403c" />
        <text x="330" y="194" textAnchor="middle" fontSize="11" fill="white"
          fontFamily="Georgia,serif" fontStyle="italic" fontWeight="600">C</text>

        {/* "Dài áo" label rotated */}
        <text
          x="347" y="190" textAnchor="middle" fontSize="8.5" fill="#78716c"
          fontFamily="system-ui,sans-serif" letterSpacing="0.05em"
          transform="rotate(90,347,190)"
        >DÀI ÁO · LENGTH</text>

      </svg>

      {/* ── Legend ── */}
      <div className="w-full max-w-[300px] divide-y divide-stone-100 border border-stone-100">
        {[
          {
            letter: "A",
            vi: "Vai",
            en: "Shoulder Width",
            desc: "Đo ngang từ đường may vai trái sang vai phải.",
          },
          {
            letter: "B",
            vi: "Dài tay",
            en: "Sleeve Length",
            desc: "Đo từ điểm vai theo mép trên tay xuống đến cổ tay.",
          },
          {
            letter: "C",
            vi: "Dài áo",
            en: "Body Length",
            desc: "Đo từ điểm vai sau thẳng xuống đến gấu áo.",
          },
        ].map(({ letter, vi, en, desc }) => (
          <div key={letter} className="flex items-start gap-3 px-4 py-3">
            <span className="w-6 h-6 shrink-0 rounded-full bg-stone-800 text-white flex items-center justify-center text-[11px] mt-0.5"
              style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}>
              {letter}
            </span>
            <div>
              <p className="text-[11px] font-semibold text-stone-700">
                {vi} <span className="font-normal text-stone-400">· {en}</span>
              </p>
              <p className="text-[10px] text-stone-400 mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
