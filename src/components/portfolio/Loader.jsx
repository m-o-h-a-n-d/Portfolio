import LaravelReactLoader from './LaravelReactLoader';

const Loader = () => { 
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0d0d0d] backdrop-blur-sm">
      <div className="relative flex flex-col items-center">
        {/* The Hybrid Logo - Centered and matching the new image style */}
        <LaravelReactLoader size="w-48 h-48" />
        
        {/* Minimalist Loading Text matching the image */}
        <div className="mt-4 flex flex-col items-center gap-3">
          <h2 className="text-[#ffdb70] text-lg font-bold tracking-[0.3em] uppercase">
            Loading
          </h2>
          
          {/* Three dots matching the image */}
          <div className="flex gap-2">
            <span className="w-1 h-1 bg-[#ffdb70] rounded-full animate-pulse [animation-delay:-0.4s]"></span>
            <span className="w-1 h-1 bg-[#ffdb70] rounded-full animate-pulse [animation-delay:-0.2s]"></span>
            <span className="w-1 h-1 bg-[#ffdb70] rounded-full animate-pulse"></span>
          </div>
          
          <p className="text-light-gray/40 text-[10px] mt-4 font-medium tracking-[0.4em] uppercase">
            Laravel x React
          </p>
        </div>
      </div>
    </div>
  );
};

export default Loader;
