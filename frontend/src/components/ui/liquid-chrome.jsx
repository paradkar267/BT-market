import React from 'react';

export default function LiquidChrome({ baseColor = [0,0,0], speed = 1 }) {
  const r = Math.round(baseColor[0] * 255);
  const g = Math.round(baseColor[1] * 255);
  const b = Math.round(baseColor[2] * 255);
  
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-black rounded-full pointer-events-none">
      <div 
        className="absolute -inset-[100%] opacity-80"
        style={{
          background: `conic-gradient(from 0deg at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.8) 25%, rgba(${r},${g},${b},0.9) 50%, rgba(255,255,255,0.8) 75%, rgba(255,255,255,0.1) 100%)`,
          animation: `spin-chrome ${5 / speed}s linear infinite`
        }}
      />
      <style>{`
        @keyframes spin-chrome {
          from { transform: rotate(0deg) scale(2); }
          to { transform: rotate(360deg) scale(2); }
        }
      `}</style>
    </div>
  );
}
