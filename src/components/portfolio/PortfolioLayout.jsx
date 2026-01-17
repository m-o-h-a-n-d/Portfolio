



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
  );
};

export default PortfolioLayout;






