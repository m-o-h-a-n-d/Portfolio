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

  const handlePageChange = (page) => {
    if (page === activePage) return;
    setIsPageLoading(true);
    setActivePage(page);
  };

  useEffect(() => {
    if (isPageLoading) {
      const timer = setTimeout(() => {
        setIsPageLoading(false);
      }, 500); // Simulate loading time like in Dashboard
      return () => clearTimeout(timer);
    }
  }, [isPageLoading]);

  const renderPage = () => {
    if (isPageLoading) return <LoadingScreen />;
    
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

  return (
    <DataProvider>
      <main className="m-[15px_12px_75px] md:my-[60px] md:mb-[100px] min-w-[259px]">
        {/* تم استخدام lg:flex لتطابق نقطة التوقف 1250px في الـ CSS الأصلي 
           تقريباً (xl في tailwind)
        */}
        <div className="max-w-[1200px] mx-auto xl:flex xl:items-stretch xl:gap-[25px]">
          
          {/* Sidebar Area */}
          <div className="xl:w-[275px] xl:min-w-[275px] mb-4 xl:mb-0">
            <Sidebar />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 bg-card border border-border rounded-[20px] p-[15px] md:p-[30px] shadow-portfolio-1 relative">
            
            {/* Navbar أصبح الآن داخل الكارد ليكون فوقه مباشرة */}
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