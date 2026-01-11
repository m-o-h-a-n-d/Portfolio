import React from 'react';

const LaravelReactLoader = ({ size = 'w-32 h-32' }) => {
  return (
    <div className={`relative ${size} flex items-center justify-center`}>
      {/* Outer Glow Effect */}
      <div className="absolute inset-0 bg-[#ffdb70]/10 rounded-full blur-3xl animate-pulse"></div>
      
      {/* Laravel Isometric Logo (Center) - Matching the 3D angle in the image */}
      <div className="relative z-10 w-1/2 h-1/2 text-[#ffdb70] drop-shadow-[0_0_15px_rgba(255,219,112,0.6)]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Isometric Laravel Logo Path */}
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

      {/* React Orbits (Rotating around Laravel) - More visible and clear */}
      <div className="absolute inset-0">
        <svg
          className="w-full h-full text-[#ffdb70]/50"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Orbit 1 */}
          <ellipse
            cx="12"
            cy="12"
            rx="11"
            ry="4.5"
            stroke="currentColor"
            strokeWidth="0.6"
            className="opacity-60"
          />
          {/* Orbit 2 */}
          <ellipse
            cx="12"
            cy="12"
            rx="11"
            ry="4.5"
            stroke="currentColor"
            strokeWidth="0.6"
            transform="rotate(60 12 12)"
            className="opacity-60"
          />
          {/* Orbit 3 */}
          <ellipse
            cx="12"
            cy="12"
            rx="11"
            ry="4.5"
            stroke="currentColor"
            strokeWidth="0.6"
            transform="rotate(120 12 12)"
            className="opacity-60"
          />
        </svg>
      </div>

      {/* Rotating Electrons (Dots on orbits) - Very clear and glowing */}
      <div className="absolute inset-0 animate-[spin_3s_linear_infinite]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#ffdb70] rounded-full shadow-[0_0_15px_#ffdb70,0_0_5px_white]"></div>
      </div>
      <div className="absolute inset-0 animate-[spin_5s_linear_infinite_reverse]">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#ffdb70] rounded-full shadow-[0_0_15px_#ffdb70,0_0_5px_white]"></div>
      </div>
      <div className="absolute inset-0 animate-[spin_4s_linear_infinite]" style={{ transform: 'rotate(60deg)' }}>
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#ffdb70] rounded-full shadow-[0_0_15px_#ffdb70,0_0_5px_white]"></div>
      </div>
    </div>
  );
};

export default LaravelReactLoader;
