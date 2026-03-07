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
  const [isDragging, setIsDragging] = useState(false);
  const contentRef = useRef(null);

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

  const handleDragEnd = (event, info) => {
    const swipeThreshold = 50;
    const swipe = info.offset.x;

    if (swipe < -swipeThreshold && pageIndex < pages.length - 1) {
      // Swiped left -> next page
      handlePageChange(pages[pageIndex + 1], 1);
    } else if (swipe > swipeThreshold && pageIndex > 0) {
      // Swiped right -> previous page
      handlePageChange(pages[pageIndex - 1], -1);
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
            ref={contentRef}
            className="flex-1 min-w-0 bg-card border border-border rounded-[20px] p-[15px] md:p-[30px] shadow-portfolio-1 relative overflow-hidden"
          >
            
            {/* Navbar */}
            <Navbar activePage={activePage} onPageChange={handlePageChange} />

            {/* Content Pages with Flexible Drag Animation */}
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
                  drag="x"
                  dragElastic={1}
                  dragMomentum={true}
                  onDragEnd={handleDragEnd}
                  onDragStart={() => setIsDragging(true)}
                  dragConstraints={{ left: 0, right: 0 }}
                  style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
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
