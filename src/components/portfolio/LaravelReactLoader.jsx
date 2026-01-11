import React from 'react';

const LaravelReactLoader = ({ size = 'w-48 h-48' }) => {
  return (
    <div className={`relative ${size} flex items-center justify-center`}>
      {/* Background Glows matching the image colors */}
      <div className="absolute w-full h-full bg-[#61DAFB]/5 rounded-full blur-[60px] animate-pulse"></div>
      <div className="absolute w-1/2 h-1/2 bg-[#FF2D20]/10 rounded-full blur-[40px] animate-pulse"></div>
      
      {/* Laravel 3D Logo (Center) - Red as in the image */}
      <div className="relative z-20 w-1/3 h-1/3 text-[#FF2D20] drop-shadow-[0_0_15px_rgba(255,45,32,0.8)]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Precise 3D Isometric Laravel Path */}
          <path d="M7 21L7 13L2 10L2 2L7 5L12 2L17 5L22 2L22 10L17 13L17 21L12 24L7 21Z" />
          <path d="M12 24L12 16L7 13" />
          <path d="M12 16L17 13" />
          <path d="M7 5L12 8L17 5" />
          <path d="M12 8L12 16" />
          <path d="M2 2L7 5" />
          <path d="M22 2L17 5" />
          <path d="M2 10L7 13" />
          <path d="M22 10L17 13" />
        </svg>
      </div>

      {/* React Orbits (Rotating around Laravel) - Glowing Blue as in the image */}
      <div className="absolute inset-0 z-10">
        <svg
          className="w-full h-full text-[#61DAFB]"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Orbit 1 */}
          <ellipse
            cx="12"
            cy="12"
            rx="10"
            ry="4"
            stroke="currentColor"
            strokeWidth="0.4"
            className="opacity-80 drop-shadow-[0_0_5px_#61DAFB]"
          />
          {/* Orbit 2 */}
          <ellipse
            cx="12"
            cy="12"
            rx="10"
            ry="4"
            stroke="currentColor"
            strokeWidth="0.4"
            transform="rotate(60 12 12)"
            className="opacity-80 drop-shadow-[0_0_5px_#61DAFB]"
          />
          {/* Orbit 3 */}
          <ellipse
            cx="12"
            cy="12"
            rx="10"
            ry="4"
            stroke="currentColor"
            strokeWidth="0.4"
            transform="rotate(120 12 12)"
            className="opacity-80 drop-shadow-[0_0_5px_#61DAFB]"
          />
        </svg>
      </div>

      {/* Rotating Electrons (Glowing Blue Dots) - High visibility */}
      <div className="absolute inset-0 z-30 animate-[spin_4s_linear_infinite]">
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#61DAFB] rounded-full shadow-[0_0_12px_#61DAFB,0_0_4px_white]"></div>
      </div>
      <div className="absolute inset-0 z-30 animate-[spin_6s_linear_infinite_reverse]">
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#61DAFB] rounded-full shadow-[0_0_12px_#61DAFB,0_0_4px_white]"></div>
      </div>
      <div className="absolute inset-0 z-30 animate-[spin_5s_linear_infinite]" style={{ transform: 'rotate(60deg)' }}>
         <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#61DAFB] rounded-full shadow-[0_0_12px_#61DAFB,0_0_4px_white]"></div>
      </div>

      {/* Horizontal Glowing Ring (The one with arrows in the image) */}
      <div className="absolute inset-0 z-0 animate-[spin_15s_linear_infinite]">
        <svg className="w-full h-full text-[#61DAFB]/20" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="11.5" fill="none" stroke="currentColor" strokeWidth="0.1" strokeDasharray="1 2" />
        </svg>
      </div>
    </div>
  );
};

export default LaravelReactLoader;
