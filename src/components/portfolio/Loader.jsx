import LaravelReactLoader from './LaravelReactLoader';

const Loader = () => { 
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#121212] backdrop-blur-md">
      <div className="relative flex flex-col items-center">
        {/* The Hybrid Logo */}
        <LaravelReactLoader size="w-40 h-40" />
        
        {/* Professional Loading Text */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <h2 className="text-[#ffdb70] text-xl font-semibold tracking-[0.2em] uppercase animate-pulse">
            Loading
          </h2>
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-[#ffdb70] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1.5 h-1.5 bg-[#ffdb70] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1.5 h-1.5 bg-[#ffdb70] rounded-full animate-bounce"></span>
          </div>
          <p className="text-light-gray/50 text-xs mt-2 font-medium tracking-widest uppercase">
            Laravel x React
          </p>
        </div>
      </div>
      
      {/* Bottom Decorative Line */}
      <div className="absolute bottom-10 w-32 h-0.5 bg-gradient-to-r from-transparent via-[#ffdb70]/30 to-transparent"></div>
    </div>
  );
};

export default Loader;
