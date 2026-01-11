import LaravelReactLoader from './LaravelReactLoader';

const Loader = () => { 
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] backdrop-blur-xl">
      <div className="relative flex flex-col items-center">
        {/* The Hybrid Logo - Red Laravel x Blue React as in the image */}
        <LaravelReactLoader size="w-64 h-64" />
        
        {/* Professional Loading Text matching the image exactly */}
        <div className="mt-4 flex flex-col items-center gap-4">
          <h2 className="text-[#61DAFB] text-3xl font-black tracking-[0.3em] uppercase drop-shadow-[0_0_15px_rgba(97,218,251,0.4)]">
            Loading
          </h2>
          
          {/* Animated dots */}
          <div className="flex gap-2">
            <span className="w-1.5 h-1.5 bg-[#61DAFB] rounded-full animate-bounce [animation-delay:-0.3s] shadow-[0_0_10px_#61DAFB]"></span>
            <span className="w-1.5 h-1.5 bg-[#61DAFB] rounded-full animate-bounce [animation-delay:-0.15s] shadow-[0_0_10px_#61DAFB]"></span>
            <span className="w-1.5 h-1.5 bg-[#61DAFB] rounded-full animate-bounce shadow-[0_0_10px_#61DAFB]"></span>
          </div>
          
          {/* Colored Text: Laravel (Red) x React (Blue) */}
          <div className="mt-6 flex items-center gap-3 font-bold text-xl tracking-widest uppercase">
            <span className="text-[#FF2D20] drop-shadow-[0_0_8px_rgba(255,45,32,0.5)]">Laravel</span>
            <span className="text-white/20">x</span>
            <span className="text-[#61DAFB] drop-shadow-[0_0_8px_rgba(97,218,251,0.5)]">React</span>
          </div>
        </div>
      </div>
      
      {/* Background Circuit-like Decorative Elements (Subtle) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#61DAFB_1px,transparent_1px)] [background-size:40px_40px]"></div>
      </div>
    </div>
  );
};

export default Loader;
