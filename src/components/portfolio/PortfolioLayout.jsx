import { useState, useEffect } from 'react';
import { DataProvider } from '../../context/DataContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AboutSection from './AboutSection';
import ResumeSection from './ResumeSection';
import PortfolioSection from './PortfolioSection';
import BlogSection from './BlogSection';
import ContactSection from './ContactSection';
import Loader from './Loader';
import LoadingScreen from './LoadingScreen';

const PortfolioLayout = () => {
  const [activePage, setActivePage] = useState('about');
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const handlePageChange = (page) => {
    if (page === activePage) return;
    setIsPageLoading(true);
    setActivePage(page);
  };

  useEffect(() => {
    // Initial loading for refresh or first visit
    const initialTimer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2000); // Show atom loader for 2 seconds on initial load

    return () => clearTimeout(initialTimer);
  }, []);

  useEffect(() => {
    if (isPageLoading) {
      const timer = setTimeout(() => {
        setIsPageLoading(false);
      }, 500); // Show simple circle loader for 0.5s on page change
      return () => clearTimeout(timer);
    }
  }, [isPageLoading]);

  const renderPage = () => {
    if (isPageLoading) return <Loader />;
    
    switch (activePage) {
      case 'about':
        return <AboutSection />;
      case 'resume':
        return <ResumeSection />;
      case 'portfolio':
        return <PortfolioSection />;
      case 'blog':
        return <BlogSection />;
      case 'contact':
        return <ContactSection />;
      default:
        return <AboutSection />;
    }
  };

  if (isInitialLoading) {
    return <LoadingScreen />;
  }

  return (
    <DataProvider>
      <main className="m-[15px_12px_75px] md:my-[60px] md:mb-[100px] min-w-[259px]">
        <div className="max-w-[1200px] mx-auto xl:flex xl:items-stretch xl:gap-[25px]">
          
          {/* Sidebar Area */}
          <div className="xl:w-[275px] xl:min-w-[275px] mb-4 xl:mb-0">
            <Sidebar />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 bg-card border border-border rounded-[20px] p-[15px] md:p-[30px] shadow-portfolio-1 relative">
            
            {/* Navbar */}
            <Navbar activePage={activePage} onPageChange={handlePageChange} />

            {/* Content Pages */}
            <div className="mt-4 md:mt-0">
               {renderPage()}
            </div>
            
          </div>
        </div>
      </main>
    </DataProvider>
  );
};

export default PortfolioLayout;
