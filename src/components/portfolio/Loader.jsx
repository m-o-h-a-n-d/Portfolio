import LaravelReactLoader from './LaravelReactLoader';

const Loader = () => { 
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-bg-gradient-onyx backdrop-blur-sm">
      <div className="relative">
        <LaravelReactLoader size="w-32 h-32" />
        <div className="mt-4 text-primary font-medium animate-pulse text-center">
          Loading...
        </div>
      </div>
    </div>
  );
};

export default Loader;
