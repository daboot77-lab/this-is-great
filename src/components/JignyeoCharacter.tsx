import React from "react";

interface CharacterProps {
  expression: "sad" | "happy" | "neutral";
  className?: string;
}

export default function JignyeoCharacter({ expression, className = "" }: CharacterProps) {
  // SVG face eyes based on expression
  const renderEyes = () => {
    if (expression === "sad") {
      return (
        <g id="eyes-sad">
          {/* Crying eyes / weeping paths */}
          <path d="M12,20 Q15,17 18,20" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M30,20 Q33,17 36,20" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Tears streaming down */}
          <circle cx="15" cy="23" r="1.5" fill="#38bdf8" className="animate-ping" />
          <path d="M15,22 L15,26" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="33" cy="23" r="1.5" fill="#38bdf8" className="animate-ping" />
          <path d="M33,22 L33,26" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      );
    } else if (expression === "happy") {
      return (
        <g id="eyes-happy">
          {/* Laughing curved eyes */}
          <path d="M12,21 Q15,24 18,21" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M30,21 Q33,24 36,21" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Soft pink blush */}
          <ellipse cx="11" cy="24" rx="3.5" ry="1.8" fill="#ec4899" opacity="0.7" />
          <ellipse cx="37" cy="24" rx="3.5" ry="1.8" fill="#ec4899" opacity="0.7" />
        </g>
      );
    } else {
      return (
        <g id="eyes-neutral">
          <circle cx="15" cy="20" r="1.5" fill="#fbcfe8" />
          <circle cx="33" cy="20" r="1.5" fill="#fbcfe8" />
        </g>
      );
    }
  };

  const renderMouth = () => {
    if (expression === "sad") {
      return <path d="M21,29 Q24,26 27,29" stroke="#f9a8d4" strokeWidth="2" strokeLinecap="round" fill="none" />;
    } else if (expression === "happy") {
      return (
        <g>
          <path d="M20,27 Q24,32 28,27" stroke="#fb7185" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M20,27 L28,27 Q24,31 20,27" fill="#fb7185" />
        </g>
      );
    } else {
      return <path d="M21,28 L27,28" stroke="#f9a8d4" strokeWidth="1.5" strokeLinecap="round" />;
    }
  };

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Floating celestial ribbon animation wrapper */}
      <svg width="72" height="100" viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Floating Celestial Scarf (천의/날개옷) background portion */}
        <path 
          d="M2,38 Q12,18 24,18 Q36,18 46,38" 
          stroke="#e0f2fe" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          fill="none" 
          opacity="0.8" 
          className="animate-pulse" 
        />
        <path 
          d="M5,41 Q14,24 24,24 Q34,24 43,41" 
          stroke="#f472b6" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          fill="none" 
          opacity="0.6" 
        />

        {/* Noble High Bun / Eonjeon-meori (고구려 귀족 얹은머리) */}
        <ellipse cx="24" cy="7" rx="10" ry="5" fill="#111827" />
        <circle cx="16" cy="6" r="3.5" fill="#111827" />
        <circle cx="32" cy="6" r="3.5" fill="#111827" />
        {/* Gold hairpins / Binyeo */}
        <path d="M12,6 L6,9" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
        <circle cx="5" cy="9.5" r="1.5" fill="#fbbf24" />
        <path d="M36,6 L42,9" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
        <circle cx="43" cy="9.5" r="1.5" fill="#fbbf24" />

        {/* Head / Face */}
        <path d="M13,10 Q13,32 24,32 Q35,32 35,10 Z" fill="#fff1f2" />
        <path d="M14,11 C14,11 24,14 34,11 C34,11 34,30 24,30 C14,30 14,11 14,11 Z" fill="#ffe4e6" opacity="0.4" />

        {/* Traditional long side hair */}
        <path d="M13,10 Q15,22 15,26" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M35,10 Q33,22 33,26" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" />

        {/* Dynamic Facial Features */}
        {renderEyes()}
        {renderMouth()}

        {/* Yellow Jeogori (저고리) */}
        <path d="M11,32 L37,32 L40,46 L8,46 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
        {/* Colorful sleeves & cuffs */}
        <path d="M11,32 L6,44 L11,46 L13,36 Z" fill="#ca8a04" />
        <path d="M37,32 L42,44 L37,46 L35,36 Z" fill="#ca8a04" />
        
        {/* Goguryeo noble pleated skirt with vertical stripes (고구려 귀족 주름치마) */}
        {/* We paint beautiful vertical stripes for the pleats */}
        <path d="M10,46 L38,46 L43,64 L5,64 Z" fill="#be185d" />
        {/* Red & Gold Vertical Pleats stripes */}
        <path d="M14,46 L11,64" stroke="#db2777" strokeWidth="2" />
        <path d="M18,46 L16,64" stroke="#f43f5e" strokeWidth="1.5" />
        <path d="M22,46 L21,64" stroke="#fbbf24" strokeWidth="2.5" />
        <path d="M26,46 L27,64" stroke="#fbbf24" strokeWidth="2.5" />
        <path d="M30,46 L32,64" stroke="#f43f5e" strokeWidth="1.5" />
        <path d="M34,46 L37,64" stroke="#db2777" strokeWidth="2" />

        {/* Traditional wide waist band */}
        <rect x="10" y="44" width="28" height="4" fill="#fb7185" />
        {/* Hanging belt ribbons */}
        <path d="M21,48 L19,60 L21,60 Z" fill="#f43f5e" />
        <path d="M24,48 L26,58 L24,58 Z" fill="#fbbf24" />

        {/* Floating scarf foreground loop */}
        <path 
          d="M4,44 Q14,56 24,56 Q34,56 44,44" 
          stroke="#e0f2fe" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          fill="none" 
          opacity="0.9" 
        />
        <path 
          d="M6,46 Q15,53 24,53 Q33,53 42,46" 
          stroke="#f472b6" 
          strokeWidth="1" 
          strokeLinecap="round" 
          fill="none" 
          opacity="0.7" 
        />

        {/* Shoes */}
        <path d="M16,64 L21,64 L19,63" stroke="#fbcfe8" strokeWidth="2" strokeLinecap="round" />
        <path d="M27,64 L32,64 L30,63" stroke="#fbcfe8" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
