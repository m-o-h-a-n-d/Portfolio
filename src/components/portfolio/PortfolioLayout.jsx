



import { useState, useEffect } from 'react';
// Removed redundant DataProvider import
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AboutSection from './AboutSection';
import ResumeSection from './ResumeSection';
import PortfolioSection from './PortfolioSection';
import BlogSection from './BlogSection';
import ContactSection from './ContactSection';
import LoadingScreen from './LoadingScreen';
import ProjectDetails from './ProjectDetails';
import { useLocation, useNavigate } from 'react-router-dom';

const PortfolioLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('about');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Minimum swipe distance (in pixels)
  const minSwipeDistance = 50;

  const pages = ['about', 'resume', 'portfolio', 'blog', 'contact'];

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      const currentIndex = pages.indexOf(activePage);
      if (currentIndex === -1) return;

      if (isLeftSwipe && currentIndex < pages.length - 1) {
        // Swipe Left -> Next Page
        handlePageChange(pages[currentIndex + 1]);
      } else if (isRightSwipe && currentIndex > 0) {
        // Swipe Right -> Previous Page
        handlePageChange(pages[currentIndex - 1]);
      }
    }
  };

  useEffect(() => {
    if (location.pathname.startsWith('/project/')) {
      setActivePage('project-details');
    }
  }, [location]);

  const handlePageChange = (page) => {
    if (page === activePage) return;
    
    if (page !== 'project-details' && location.pathname !== '/') {
      navigate('/');
    }

    setIsTransitioning(true);
    
    // Simulate a short loading time for the transition effect
    setTimeout(() => {
      setActivePage(page);
      setIsTransitioning(false);
    }, 400);
  };

  const renderPage = () => {
    if (isTransitioning) {
      return (
        <div className="flex items-center justify-center w-full h-[400px]">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

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
      case 'project-details':
        return <ProjectDetails />;
      default:
        return <AboutSection />;
    }
  };

  return (
    <main className="m-[15px_12px_75px] md:my-[60px] md:mb-[100px] min-w-[259px]">
        <div className="max-w-[1200px] mx-auto xl:flex xl:items-stretch xl:gap-[25px]">
          
          {/* Sidebar Area */}
          <div className="xl:w-[275px] xl:min-w-[275px] mb-4 xl:mb-0">
            <Sidebar />
          </div>

          {/* Main Content Area */}
          <div 
            className="flex-1 min-w-0 bg-card border border-border rounded-[20px] p-[15px] md:p-[30px] shadow-portfolio-1 relative touch-pan-y"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            
            {/* Navbar */}
            <Navbar activePage={activePage} onPageChange={handlePageChange} />

            {/* Content Pages */}
            <div className="mt-4 md:mt-0">
               {renderPage()}
            </div>
            
          </div>
        </div>
    </main>
  );
};

export default PortfolioLayout;






