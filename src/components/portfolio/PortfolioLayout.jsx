import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [direction, setDirection] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const contentRef = useRef(null);

  // Minimum swipe distance (in pixels)
  const minSwipeDistance = 50;

  const pages = ['about', 'resume', 'portfolio', 'blog', 'contact'];
  const pageIndex = pages.indexOf(activePage);

  useEffect(() => {
    if (location.pathname.startsWith('/project/')) {
      setActivePage('project-details');
    }
  }, [location]);

  const handlePageChange = (page, swipeDirection = 0) => {
    if (page === activePage) return;
    
    if (page !== 'project-details' && location.pathname !== '/') {
      navigate('/');
    }

    setDirection(swipeDirection);
    setActivePage(page);
  };

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
      if (isLeftSwipe && pageIndex < pages.length - 1) {
        // Swipe Left -> Next Page
        handlePageChange(pages[pageIndex + 1], 1);
      } else if (isRightSwipe && pageIndex > 0) {
        // Swipe Right -> Previous Page
        handlePageChange(pages[pageIndex - 1], -1);
      }
    }
  };

  const renderPage = () => {
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

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      zIndex: 0,
      x: dir < 0 ? 1000 : -1000,
      opacity: 0,
    }),
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
            ref={contentRef}
            className="flex-1 min-w-0 bg-card border border-border rounded-[20px] p-[15px] md:p-[30px] shadow-portfolio-1 relative overflow-hidden touch-pan-y"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            
            {/* Navbar */}
            <Navbar activePage={activePage} onPageChange={handlePageChange} />

            {/* Content Pages with Smooth Animation */}
            <div className="mt-4 md:mt-0 relative">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={activePage}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                >
                  {renderPage()}
                </motion.div>
              </AnimatePresence>
            </div>
            
          </div>
        </div>
    </main>
  );
};

export default PortfolioLayout;
