import React from 'react';

const LaravelReactLoader = ({ size = 'w-32 h-32' }) => {
  return (
    <div className={`relative ${size} flex items-center justify-center`}>
      {/* Outer Glow Effect */}
      <div className="absolute inset-0 bg-[#ffdb70]/5 rounded-full blur-2xl animate-pulse"></div>
      
      {/* Laravel Hexagon Logo (Center) - Matching the new image */}
      <div className="relative z-10 w-1/4 h-1/4 text-[#ffdb70] drop-shadow-[0_0_8px_rgba(255,219,112,0.4)]">
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Hexagon Shape */}
          <path d="M12 2L3.5 7V17L12 22L20.5 17V7L12 2ZM18.5 16.1L12 19.9L5.5 16.1V7.9L12 4.1L18.5 7.9V16.1Z" />
          {/* Inner V-shape/Arrow matching Laravel's modern look in the image */}
          <path d="M12 8.5L8 11L12 13.5L16 11L12 8.5Z" />
        </svg>
      </div>

      {/* React Orbits (Rotating around Laravel) */}
      <div className="absolute inset-0">
        <svg
          className="w-full h-full text-[#ffdb70]/30"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Orbit 1 */}
          <ellipse
            cx="12"
            cy="12"
            rx="9"
            ry="3.5"
            stroke="currentColor"
            strokeWidth="0.4"
            className="animate-[pulse_3s_ease-in-out_infinite]"
          />
          {/* Orbit 2 */}
          <ellipse
            cx="12"
            cy="12"
            rx="9"
            ry="3.5"
            stroke="currentColor"
            strokeWidth="0.4"
            transform="rotate(60 12 12)"
            className="animate-[pulse_4s_ease-in-out_infinite]"
          />
          {/* Orbit 3 */}
          <ellipse
            cx="12"
            cy="12"
            rx="9"
            ry="3.5"
            stroke="currentColor"
            strokeWidth="0.4"
            transform="rotate(120 12 12)"
            className="animate-[pulse_5s_ease-in-out_infinite]"
          />
        </svg>
      </div>

      {/* Rotating Dots (Electrons) - Matching the image's subtle dots */}
      <div className="absolute inset-0 animate-[spin_8s_linear_infinite]">
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#ffdb70] rounded-full shadow-[0_0_8px_#ffdb70]"></div>
      </div>
      <div className="absolute inset-0 animate-[spin_12s_linear_infinite_reverse]">
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#ffdb70] rounded-full shadow-[0_0_8px_#ffdb70]"></div>
      </div>
    </div>
  );
};

export default LaravelReactLoader;
