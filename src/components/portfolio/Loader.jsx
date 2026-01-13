import React from 'react';

const Loader = () => {
  return (
    <div className="flex items-center justify-center w-full h-[300px]">
      <div className="relative w-12 h-12">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-[#ffcc33] border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-[#ffcc33] opacity-20 rounded-full"></div>
      </div>
    </div>
  );
};

export default Loader;
