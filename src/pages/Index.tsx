import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PortfolioLayout from '../components/portfolio/PortfolioLayout';
import SpaceBackground from '../components/portfolio/SpaceBackground';
import Navbar from '../components/portfolio/Navbar';
import SeoHead from '../components/SeoHead';

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('about');

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
    setActivePage(page);
  };

  return (
    <>
      <SeoHead
        name="Mohanad Ahmed Shehata (مهند أحمد شحاتة)"
        jobTitle="Full Stack Web Developer"
        websiteUrl="https://mohanadportfolio.vercel.app/"
        imageUrl="https://mohanadportfolio.vercel.app/image.png"
      />
      <SpaceBackground />
      <PortfolioLayout activePage={activePage} handlePageChange={handlePageChange} />
      <Navbar activePage={activePage} onPageChange={handlePageChange} />
    </>
  );
};

export default Index;
