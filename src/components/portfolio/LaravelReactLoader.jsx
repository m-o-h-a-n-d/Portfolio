import React from 'react';

const LaravelReactLoader = ({ size = 'w-32 h-32' }) => {
  return (
    <div className={`relative ${size} flex items-center justify-center`}>
      {/* Outer Glow Effect */}
      <div className="absolute inset-0 bg-[#ffdb70]/10 rounded-full blur-3xl animate-pulse"></div>
      
      {/* Laravel Logo (Center) */}
      <div className="relative z-10 w-1/3 h-1/3 text-[#ffdb70] drop-shadow-[0_0_15px_rgba(255,219,112,0.5)]">
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path d="M20.042 5.612l-7.012-4.039c-0.627-0.362-1.417-0.362-2.044 0l-7.011 4.039c-0.626 0.361-1.021 1.03-1.021 1.753v8.079c0 0.723 0.395 1.392 1.021 1.753l7.011 4.039c0.627 0.362 1.417 0.362 2.044 0l7.012-4.039c0.626-0.361 1.021-1.03 1.021-1.753v-8.079c0-0.723-0.395-1.392-1.021-1.753zM12 2.5l6.5 3.75v7.5l-6.5 3.75-6.5-3.75v-7.5l6.5-3.75z" />
          <path d="M12 13.5l-3.5-2v-4l3.5 2 3.5-2v4l-3.5 2z" />
        </svg>
      </div>

      {/* React Orbits (Rotating around Laravel) */}
      <div className="absolute inset-0 animate-[spin_10s_linear_infinite]">
        <svg
          className="w-full h-full text-[#ffdb70]/40"
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
            strokeWidth="0.5"
            className="animate-[pulse_3s_ease-in-out_infinite]"
          />
          {/* Orbit 2 */}
          <ellipse
            cx="12"
            cy="12"
            rx="10"
            ry="4"
            stroke="currentColor"
            strokeWidth="0.5"
            transform="rotate(60 12 12)"
            className="animate-[pulse_4s_ease-in-out_infinite]"
          />
          {/* Orbit 3 */}
          <ellipse
            cx="12"
            cy="12"
            rx="10"
            ry="4"
            stroke="currentColor"
            strokeWidth="0.5"
            transform="rotate(120 12 12)"
            className="animate-[pulse_5s_ease-in-out_infinite]"
          />
        </svg>
      </div>

      {/* Rotating Electrons (Dots on orbits) */}
      <div className="absolute inset-0 animate-[spin_4s_linear_infinite]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#ffdb70] rounded-full shadow-[0_0_10px_#ffdb70]"></div>
      </div>
      <div className="absolute inset-0 animate-[spin_6s_linear_infinite_reverse]">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#ffdb70] rounded-full shadow-[0_0_10px_#ffdb70]"></div>
      </div>
    </div>
  );
};

export default LaravelReactLoader;
