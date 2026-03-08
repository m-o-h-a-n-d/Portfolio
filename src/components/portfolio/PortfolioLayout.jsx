import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AboutSection from './AboutSection';
import ResumeSection from './ResumeSection';
import PortfolioSection from './PortfolioSection';
import BlogSection from './BlogSection';
import ContactSection from './ContactSection';
import ProjectDetails from './ProjectDetails';
import CertificatesSection from './CertificatesSection';
import TeamSection from './TeamSection';
import { useLocation, useNavigate } from 'react-router-dom';
import { useIsMobile } from '../../hooks/use-mobile';

const PortfolioLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activePage, setActivePage] = useState('about');
  const [direction, setDirection] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const contentRef = useRef(null);

  const pages = ['about', 'resume', 'portfolio', 'blog', 'contact', 'certificates', 'team'];
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

    if (!isMobile) {
      setIsLoading(true);
      setTimeout(() => {
        setActivePage(page);
        setIsLoading(false);
      }, 300); // Small delay for the loading effect
    } else {
      setDirection(swipeDirection);
      setActivePage(page);
    }
  };

  const renderPage = () => {
    const aboutProps = {
      onShowAllCertificates: () => handlePageChange('certificates'),
      onShowAllTeam: () => handlePageChange('team')
    };

    switch (activePage) {
      case 'about':
        return <AboutSection {...aboutProps} />;
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
      case 'certificates':
        return <CertificatesSection onBack={() => handlePageChange('about')} />;
      case 'team':
        return <TeamSection onBack={() => handlePageChange('about')} />;
      default:
        return <AboutSection {...aboutProps} />;
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
    if (!isMobile) return; // Only allow drag on mobile
    
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

            {/* Content Pages */}
            <div className="mt-4 md:mt-0 relative min-h-[400px]">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center z-50 bg-card/50 backdrop-blur-sm"
                  >
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={activePage}
                    custom={direction}
                    variants={isMobile ? slideVariants : {}}
                    initial={isMobile ? "enter" : { opacity: 0 }}
                    animate={isMobile ? "center" : { opacity: 1 }}
                    exit={isMobile ? "exit" : { opacity: 0 }}
                    transition={isMobile ? {
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    } : { duration: 0.2 }}
                    drag={isMobile ? "x" : false}
                    dragElastic={isMobile ? 1 : 0}
                    dragMomentum={isMobile}
                    onDragEnd={handleDragEnd}
                    onDragStart={() => isMobile && setIsDragging(true)}
                    dragConstraints={isMobile ? { left: 0, right: 0 } : {}}
                    style={{ cursor: isMobile && isDragging ? 'grabbing' : isMobile ? 'grab' : 'default' }}
                  >
                    {renderPage()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
          </div>
        </div>
  </main>
  );
};

export default PortfolioLayout;
