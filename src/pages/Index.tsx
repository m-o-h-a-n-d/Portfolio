import PortfolioLayout from '../components/portfolio/PortfolioLayout';
import SpaceBackground from '../components/portfolio/SpaceBackground';
import SeoHead from '../components/SeoHead';

const Index = () => {
  return (
    <>
      <SeoHead
        name="Mohanad Ahmed Shehata (مهند أحمد شحاته)"
        jobTitle="Full Stack Web Developer"
        websiteUrl="https://mohanadahmed.me/"
        imageUrl="https://mohanadahmed.me/image.png"
      />
      <SpaceBackground />
      <PortfolioLayout />
    </>
  );
};

export default Index;

