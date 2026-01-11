import LaravelReactLoader from './LaravelReactLoader';

const Loader = () => { 
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0a] backdrop-blur-lg">
      <div className="relative flex flex-col items-center">
        {/* The Hybrid Logo - 3D Isometric Laravel with Clear React Orbits */}
        <LaravelReactLoader size="w-56 h-56" />
        
        {/* Professional Loading Text with enhanced visibility */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <h2 className="text-[#ffdb70] text-2xl font-black tracking-[0.4em] uppercase drop-shadow-[0_0_10px_rgba(255,219,112,0.3)]">
            Loading
          </h2>
          
          {/* Animated dots matching the premium feel */}
          <div className="flex gap-3">
            <span className="w-2 h-2 bg-[#ffdb70] rounded-full animate-bounce [animation-delay:-0.3s] shadow-[0_0_8px_#ffdb70]"></span>
            <span className="w-2 h-2 bg-[#ffdb70] rounded-full animate-bounce [animation-delay:-0.15s] shadow-[0_0_8px_#ffdb70]"></span>
            <span className="w-2 h-2 bg-[#ffdb70] rounded-full animate-bounce shadow-[0_0_8px_#ffdb70]"></span>
          </div>
          
          <p className="text-light-gray/30 text-xs mt-6 font-bold tracking-[0.5em] uppercase border-t border-[#ffdb70]/10 pt-4">
            Laravel x React
          </p>
        </div>
      </div>
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#ffdb70]/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#ffdb70]/5 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
};

export default Loader;
