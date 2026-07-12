import React from "react";

interface CharacterProps {
  expression: "sad" | "happy" | "neutral";
  className?: string;
}

export default function GyeonwooCharacter({ expression, className = "" }: CharacterProps) {
  // SVG face eyes based on expression
  const renderEyes = () => {
    if (expression === "sad") {
      return (
        <g id="eyes-sad">
          {/* Crying eyes / weeping paths */}
          <path d="M12,19 Q15,16 18,19" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M30,19 Q33,16 36,19" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Tears */}
          <circle cx="14" cy="22" r="1.5" fill="#60a5fa" className="animate-ping" />
          <path d="M14,21 L14,24" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="32" cy="22" r="1.5" fill="#60a5fa" className="animate-ping" />
          <path d="M32,21 L32,24" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      );
    } else if (expression === "happy") {
      return (
        <g id="eyes-happy">
          {/* Laughing curved eyes */}
          <path d="M12,20 Q15,23 18,20" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M30,20 Q33,23 36,20" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Soft blush */}
          <ellipse cx="11" cy="23" rx="3" ry="1.5" fill="#f43f5e" opacity="0.6" />
          <ellipse cx="37" cy="23" rx="3" ry="1.5" fill="#f43f5e" opacity="0.6" />
        </g>
      );
    } else {
      return (
        <g id="eyes-neutral">
          <circle cx="15" cy="19" r="1.5" fill="#e2e8f0" />
          <circle cx="33" cy="19" r="1.5" fill="#e2e8f0" />
        </g>
      );
    }
  };

  const renderMouth = () => {
    if (expression === "sad") {
      return <path d="M21,28 Q24,25 27,28" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" fill="none" />;
    } else if (expression === "happy") {
      return (
        <g>
          <path d="M20,26 Q24,31 28,26" stroke="#f87171" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M20,26 L28,26 Q24,30 20,26" fill="#f87171" />
        </g>
      );
    } else {
      return <path d="M21,27 L27,27" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />;
    }
  };

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <svg width="72" height="100" viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Goguryeo Topknot / Sangtu and Hair Ribbon */}
        <circle cx="24" cy="5" r="4" fill="#1e293b" />
        <path d="M21,5 L18,1 L20,1 Z" fill="#38bdf8" />
        <path d="M27,5 L30,1 L28,1 Z" fill="#38bdf8" />
        
        {/* Headband / Gwan */}
        <rect x="14" y="6" width="20" height="3" rx="1" fill="#38bdf8" />

        {/* Head / Face */}
        <path d="M12,9 Q12,32 24,32 Q36,32 36,9 Z" fill="#fbcfe8" opacity="0.9" />
        {/* Soft skin shading */}
        <path d="M14,10 C14,10 24,15 34,10 C34,10 34,30 24,30 C14,30 14,10 14,10 Z" fill="#fce7f3" opacity="0.3" />

        {/* Hair side strands */}
        <path d="M12,9 Q15,18 15,22" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
        <path d="M36,9 Q33,18 33,22" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />

        {/* Dynamic Facial Features */}
        {renderEyes()}
        {renderMouth()}

        {/* Goguryeo Baji-Jeogori Tunic (바지저고리) */}
        {/* Collar & Robe base */}
        <path d="M10,32 L38,32 L44,60 L4,60 Z" fill="#1e3a8a" stroke="#172554" strokeWidth="1" />
        {/* Contrasting dark cuffs & neck trim (고구려 복식 특유의 깃, 섶, 선 장식) */}
        <path d="M20,32 L24,44 L28,32" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M18,32 L24,42 L30,32" stroke="#451a03" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* Waist Sash (허리띠) */}
        <rect x="9" y="44" width="30" height="4" rx="1" fill="#f59e0b" />
        {/* Sash ribbon ends */}
        <path d="M22,48 L20,58 L18,58 Z" fill="#d97706" />
        <path d="M25,48 L27,56 L29,55 Z" fill="#d97706" />

        {/* Baggy Pants (바지) bound at the bottoms */}
        <path d="M12,48 L17,64 L22,64 L20,48 Z" fill="#2563eb" />
        <path d="M26,48 L28,64 L33,64 L31,48 Z" fill="#2563eb" />
        
        {/* Ankle ties (대님) */}
        <rect x="16" y="61" width="6" height="2.5" fill="#f59e0b" />
        <rect x="27" y="61" width="6" height="2.5" fill="#f59e0b" />

        {/* Shoes */}
        <path d="M14,64 L19,64 L18,63 L15,63 Z" fill="#1e293b" />
        <path d="M29,64 L34,64 L33,63 L30,63 Z" fill="#1e293b" />
      </svg>
    </div>
  );
}
