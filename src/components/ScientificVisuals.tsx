import React from "react";

interface VisualsProps {
  step: "ready" | "spring_autumn" | "chilseok" | "bridge" | "wish" | "complete";
}

export default function ScientificVisuals({ step }: VisualsProps) {
  // Determine angle and state values based on step
  let earthAngle = 210; // Spring/Autumn base angle (in degrees)
  let altitude = 15;
  let perceivedDistanceLabel = "극대 (아득한 수만 리)";
  let perceivedDistanceVal = 95;
  let orbitSeason = "봄 / 가을 (관측 고도 낮음)";
  let flatnessFactor = "평평도 인지 왜곡 90%";

  if (step === "ready") {
    earthAngle = 180;
    altitude = 0;
    perceivedDistanceLabel = "관측 전";
    perceivedDistanceVal = 0;
    orbitSeason = "관측 대기 중";
    flatnessFactor = "대기 중";
  } else if (step === "spring_autumn") {
    earthAngle = 210;
    altitude = 15;
    perceivedDistanceLabel = "아득히 멂 (지평선 착시 왜곡 극대)";
    perceivedDistanceVal = 95;
    orbitSeason = "봄 / 가을 (낮은 지평선)";
    flatnessFactor = "평평도 인지 왜곡 극대 (92%)";
  } else {
    // chilseok, bridge, wish, complete are summer/high altitude
    earthAngle = 90; // Summer solstice position
    altitude = 85;
    perceivedDistanceLabel = "매우 가까움 (중천 착시 소멸)";
    perceivedDistanceVal = 25;
    orbitSeason = "여름 칠월칠석 (머리 위 중천)";
    flatnessFactor = "평평도 착시 소멸 (10% 이하)";
  }

  // Calculate Earth's orbit coordinates
  const radius = 22;
  const centerX = 36;
  const centerY = 36;
  const rad = (earthAngle * Math.PI) / 180;
  const earthX = centerX + radius * Math.cos(rad);
  const earthY = centerY + radius * Math.sin(rad);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-xl">
      
      {/* 1. Earth's Orbit Panel */}
      <div className="bg-black/40 border border-white/5 rounded-lg p-3.5 flex flex-col justify-between">
        <div>
          <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block mb-1">
            🔭 천체 물리: 지구 공전 및 실질 관측 고도
          </span>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            지구가 태양 주위를 공전(공전 주기 365일)함에 따라, 한밤중(태양 반대편) 우리가 밤하늘을 바라보는 시선 방향의 은하수 고도가 달라집니다.
          </p>
        </div>

        {/* Orbit SVG Diagram */}
        <div className="relative h-32 flex items-center justify-center my-3 bg-black/60 rounded border border-white/5 overflow-hidden">
          <svg width="100%" height="100%" viewBox="0 0 100 72" className="overflow-visible">
            {/* Background stars */}
            <circle cx="10" cy="15" r="0.5" fill="#fff" opacity="0.5" />
            <circle cx="85" cy="55" r="0.5" fill="#fff" opacity="0.5" />
            <circle cx="90" cy="15" r="0.5" fill="#fff" opacity="0.5" />
            <circle cx="5" cy="50" r="0.5" fill="#fff" opacity="0.5" />

            {/* Sun in Center */}
            <circle cx={centerX} cy={centerY} r="6" fill="url(#sunGlow)" />
            <circle cx={centerX} cy={centerY} r="3" fill="#ff7e00" />

            {/* Earth Orbit circle */}
            <circle cx={centerX} cy={centerY} r={radius} stroke="rgba(255,255,255,0.12)" strokeWidth="0.75" strokeDasharray="2,2" fill="none" />

            {/* Earth position */}
            {step !== "ready" && (
              <g>
                {/* Earth sphere */}
                <circle cx={earthX} cy={earthY} r="3.5" fill="#3b82f6" />
                {/* Earth Atmosphere/Night Side shading */}
                <path 
                  d={`M ${earthX - 3.5} ${earthY} A 3.5 3.5 0 0 1 ${earthX + 3.5} ${earthY} Z`} 
                  fill="#0c1d3a" 
                  transform={`rotate(${earthAngle}, ${earthX}, ${earthY})`} 
                />
                {/* Earth core indicator */}
                <circle cx={earthX} cy={earthY} r="1" fill="#10b981" />

                {/* Night-time Observer Sight Line */}
                <line 
                  x1={earthX} 
                  y1={earthY} 
                  x2={earthX + (earthAngle === 210 ? -25 : 0)} 
                  y2={earthY + (earthAngle === 210 ? -12 : -32)} 
                  stroke="#38bdf8" 
                  strokeWidth="1" 
                  strokeDasharray="1.5,1.5" 
                />
                {/* Horizon plane guide */}
                <line 
                  x1={earthX - 7} 
                  y1={earthY} 
                  x2={earthX + 7} 
                  y2={earthY} 
                  stroke="#ef4444" 
                  strokeWidth="0.5" 
                  opacity="0.7" 
                  transform={`rotate(${earthAngle + 90}, ${earthX}, ${earthY})`}
                />
              </g>
            )}

            {/* Gyeonwoo/Jignyeo distant stars icons */}
            <g transform="translate(10, 10)" opacity={step === "ready" ? 0.2 : 0.8}>
              <polygon points="4,0 5,2 8,2 6,4 7,7 4,5 1,7 2,4 0,2 3,2" fill="#f59e0b" transform="scale(0.8)" />
              <text x="7" y="5" fill="#f59e0b" className="text-[5px] font-mono font-bold">Altair</text>
            </g>
            <g transform="translate(36, 4)" opacity={step === "ready" ? 0.2 : 0.8}>
              <polygon points="4,0 5,2 8,2 6,4 7,7 4,5 1,7 2,4 0,2 3,2" fill="#38bdf8" transform="scale(0.8)" />
              <text x="7" y="5" fill="#38bdf8" className="text-[5px] font-mono font-bold">Vega</text>
            </g>

            {/* Defs for gradients */}
            <defs>
              <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="1" />
                <stop offset="60%" stopColor="#ef4444" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* Dynamic status indicators */}
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-white/5 pt-2 text-gray-400">
          <div>
            <span className="text-gray-500 block">궤도상 시기 (Season)</span>
            <span className="text-yellow-200 font-semibold">{orbitSeason}</span>
          </div>
          <div>
            <span className="text-gray-500 block">관측 지향각 (Altitude)</span>
            <span className="text-sky-300 font-semibold">{altitude}° {altitude === 15 ? "(지평선 접선)" : altitude === 85 ? "(중천 천장)" : ""}</span>
          </div>
        </div>
      </div>

      {/* 2. Sky Dome Flattening Illusion Panel */}
      <div className="bg-black/40 border border-white/5 rounded-lg p-3.5 flex flex-col justify-between">
        <div>
          <span className="text-[11px] font-bold text-pink-400 uppercase tracking-wider block mb-1">
            🧠 시각 인지: 천공 평평화 착시 (Sky Dome Illusion)
          </span>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            인간의 뇌는 밤하늘을 완전한 반구형(원형)이 아닌, **가운데가 납작하게 눌린 타원형 돔**으로 인지합니다. 이로 인해 동일한 각도거리도 지평선 근처에 있을 때 훨씬 멀어 보입니다.
          </p>
        </div>

        {/* Sky Dome Flattening SVG Diagram */}
        <div className="relative h-32 flex items-center justify-center my-3 bg-black/60 rounded border border-white/5 overflow-hidden">
          <svg width="100%" height="100%" viewBox="0 0 100 72" className="overflow-visible">
            {/* Ground Line */}
            <line x1="5" y1="62" x2="95" y2="62" stroke="#475569" strokeWidth="1" />
            
            {/* Observer */}
            <circle cx="50" cy="62" r="2.5" fill="#10b981" />
            <text x="50" y="69" textAnchor="middle" fill="#10b981" className="text-[5px] font-mono">나 (Observer)</text>

            {/* Actual Spherical Dome (True Dome) - Dashed semi-circle */}
            <path d="M 12,62 A 38,38 0 0,1 88,62" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.75" strokeDasharray="2,2" />
            <text x="50" y="21" textAnchor="middle" fill="rgba(255,255,255,0.2)" className="text-[4px] font-mono">실제 둥근 천구 (True Dome)</text>

            {/* Perceived Flattened Sky Dome - Highly elliptical path */}
            <path d="M 12,62 Q 50,22 88,62" fill="none" stroke="#d946ef" strokeWidth="1" opacity="0.6" />
            <text x="50" y="34" textAnchor="middle" fill="#d946ef" className="text-[4px] font-mono" opacity="0.8">뇌가 인지하는 납작한 천공 (Perceived Flat Dome)</text>

            {/* Render stars and distance guides based on step */}
            {step !== "ready" && (
              <g>
                {/* Low altitude stars (Spring/Autumn) */}
                <g opacity={earthAngle === 210 ? 1.0 : 0.15} className="transition-opacity duration-1000">
                  {/* Star A near left horizon */}
                  <circle cx="18" cy="54" r="2" fill="#f59e0b" className="animate-pulse" />
                  <text x="14" y="50" fill="#f59e0b" className="text-[5px] font-bold font-mono">A (15°)</text>
                  
                  {/* Star B near right horizon */}
                  <circle cx="82" cy="54" r="2" fill="#38bdf8" className="animate-pulse" />
                  <text x="82" y="50" fill="#38bdf8" className="text-[5px] font-bold font-mono">V (15°)</text>

                  {/* Gigantic perceived distance line along the flat dome */}
                  <path d="M 18,54 Q 50,25 82,54" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="1.5,1.5" />
                  <text x="50" y="44" textAnchor="middle" fill="#ef4444" className="text-[5px] font-bold font-mono">인지된 시각 거리: 매우 아득함 (거리 왜곡 극대) ↔</text>
                </g>

                {/* High altitude stars (Summer / Chilseok) */}
                <g opacity={earthAngle === 90 ? 1.0 : 0.15} className="transition-opacity duration-1000">
                  {/* Star A near top zenith */}
                  <circle cx="39" cy="31" r="2" fill="#f59e0b" className="animate-pulse" />
                  <text x="35" y="27" fill="#f59e0b" className="text-[5px] font-bold font-mono">A (85°)</text>
                  
                  {/* Star B near top zenith */}
                  <circle cx="61" cy="31" r="2" fill="#38bdf8" className="animate-pulse" />
                  <text x="61" y="27" fill="#38bdf8" className="text-[5px] font-bold font-mono">V (85°)</text>

                  {/* Tiny perceived distance line */}
                  <line x1="39" y1="31" x2="61" y2="31" stroke="#22c55e" strokeWidth="1" />
                  <text x="50" y="27" textAnchor="middle" fill="#22c55e" className="text-[5.5px] font-bold font-mono">인지된 시각 거리: 지척에 밀착 (왜곡 소멸) ⇄</text>
                </g>
              </g>
            )}
          </svg>
        </div>

        {/* Dynamic status indicators */}
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-white/5 pt-2 text-gray-400">
          <div>
            <span className="text-gray-500 block">착시 강도 (Illusion Factor)</span>
            <span className="text-pink-300 font-semibold">{flatnessFactor}</span>
          </div>
          <div>
            <span className="text-gray-500 block">시각 인지 거리 (Perceived Distance)</span>
            <span className="text-green-300 font-semibold text-[9.5px]">{perceivedDistanceLabel}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
