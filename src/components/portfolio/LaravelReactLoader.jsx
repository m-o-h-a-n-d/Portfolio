import React from 'react';

const LaravelReactLoader = ({ size = 'w-24 h-24' }) => {
  return (
    <div className={`relative ${size} flex items-center justify-center`}>
      {/* Laravel Logo (Background/Pulsing) */}
      <svg
        className="absolute w-full h-full animate-pulse text-[#FF2D20]"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M20.042 5.612l-7.012-4.039c-0.627-0.362-1.417-0.362-2.044 0l-7.011 4.039c-0.626 0.361-1.021 1.03-1.021 1.753v8.079c0 0.723 0.395 1.392 1.021 1.753l7.011 4.039c0.627 0.362 1.417 0.362 2.044 0l7.012-4.039c0.626-0.361 1.021-1.03 1.021-1.753v-8.079c0-0.723-0.395-1.392-1.021-1.753zM12 2.5l6.5 3.75v7.5l-6.5 3.75-6.5-3.75v-7.5l6.5-3.75z" />
        <path d="M12 13.5l-3.5-2v-4l3.5 2 3.5-2v4l-3.5 2z" />
      </svg>

      {/* React Logo (Foreground/Spinning) */}
      <svg
        className="w-3/4 h-3/4 animate-spin text-[#61DAFB]"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ animationDuration: '5s' }}
      >
        <circle cx="12" cy="12" r="2" fill="currentColor" />
        <ellipse cx="12" cy="12" rx="8" ry="3" stroke="currentColor" strokeWidth="1" />
        <ellipse cx="12" cy="12" rx="8" ry="3" stroke="currentColor" strokeWidth="1" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="8" ry="3" stroke="currentColor" strokeWidth="1" transform="rotate(120 12 12)" />
      </svg>
    </div>
  );
};

export default LaravelReactLoader;
