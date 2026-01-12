import React from 'react';

const LaravelReactLoader = ({ size = 'w-48 h-48' }) => {
  return (
    <div className={`relative ${size} flex items-center justify-center`}>
      {/* Background Glows */}
      <div className="absolute w-full h-full bg-[#61DAFB]/10 rounded-full blur-[80px] animate-pulse"></div>
      
      {/* Laravel 3D Logo (Center) - Using a more accurate SVG path for the 3D look */}
      <div className="relative z-20 w-1/2 h-1/2 drop-shadow-[0_0_20px_rgba(255,45,32,0.9)]">
        <svg
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Laravel Official Logo Path (Red) */}
          <path
            fill="#FF2D20"
            d="M21.5 5.612l-7.012-4.039c-0.627-0.362-1.417-0.362-2.044 0l-7.011 4.039c-0.626 0.361-1.021 1.03-1.021 1.753v8.079c0 0.723 0.395 1.392 1.021 1.753l7.011 4.039c0.627 0.362 1.417 0.362 2.044 0l7.012-4.039c0.626-0.361 1.021-1.03 1.021-1.753v-8.079c0-0.723-0.395-1.392-1.021-1.753zM12 2.5l6.5 3.75v7.5l-6.5 3.75-6.5-3.75v-7.5l6.5-3.75z"
          />
          <path
            fill="#FF2D20"
            d="M12 13.5l-3.5-2v-4l3.5 2 3.5-2v4l-3.5 2z"
          />
        </svg>
      </div>

      {/* React Orbits (Rotating around Laravel) - Glowing Blue */}
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
            rx="11"
            ry="4.5"
            stroke="currentColor"
            strokeWidth="0.5"
            className="opacity-70 drop-shadow-[0_0_8px_#61DAFB]"
          />
          {/* Orbit 2 */}
          <ellipse
            cx="12"
            cy="12"
            rx="11"
            ry="4.5"
            stroke="currentColor"
            strokeWidth="0.5"
            transform="rotate(60 12 12)"
            className="opacity-70 drop-shadow-[0_0_8px_#61DAFB]"
          />
          {/* Orbit 3 */}
          <ellipse
            cx="12"
            cy="12"
            rx="11"
            ry="4.5"
            stroke="currentColor"
            strokeWidth="0.5"
            transform="rotate(120 12 12)"
            className="opacity-70 drop-shadow-[0_0_8px_#61DAFB]"
          />
        </svg>
      </div>

      {/* Rotating Electrons (Glowing Blue Dots) */}
      <div className="absolute inset-0 z-30 animate-[spin_4s_linear_infinite]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#61DAFB] rounded-full shadow-[0_0_15px_#61DAFB,0_0_5px_white]"></div>
      </div>
      <div className="absolute inset-0 z-30 animate-[spin_6s_linear_infinite_reverse]">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#61DAFB] rounded-full shadow-[0_0_15px_#61DAFB,0_0_5px_white]"></div>
      </div>
      <div className="absolute inset-0 z-30 animate-[spin_5s_linear_infinite]" style={{ transform: 'rotate(60deg)' }}>
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#61DAFB] rounded-full shadow-[0_0_15px_#61DAFB,0_0_5px_white]"></div>
      </div>
    </div>
  );
};

export default LaravelReactLoader;
