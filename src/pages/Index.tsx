import PortfolioLayout from '../components/portfolio/PortfolioLayout';
import SpaceBackground from '../components/portfolio/SpaceBackground';
import SeoHead from '../components/SeoHead';

const Index = () => {
  return (
    <>
      <SeoHead
        name="Mohanad Ahmed Shehata (مهند أحمد شحاتة)"
        jobTitle="Full Stack Web Developer"
        websiteUrl="https://mohanadportfolio.vercel.app/"
        imageUrl="https://mohanadportfolio.vercel.app/image.png"
      />
      <SpaceBackground />
      <PortfolioLayout />
    </>
  );
};

export default Index;
