import { useState } from 'react';
import { usePortfolio } from '../../context/DataContext';
import { Eye, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const PortfolioSection = () => {
  const portfolio = usePortfolio();
  const [activeFilter, setActiveFilter] = useState('all');
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  if (!portfolio) return null;

  const categories = portfolio.categories || ['all', 'Frontend Development', 'Backend Development', 'IOT'];
  
 const filteredProjects = activeFilter === 'all' 
  ? portfolio.projects 
  : portfolio.projects?.filter(
      p => p.category.toLowerCase() === activeFilter.toLowerCase()
    );


  const handleFilterChange = (category) => {
    setActiveFilter(category);
    setIsSelectOpen(false);
  };

  return (
    <article className="animate-fade-in">
      {/* Title */}
      <header>
        <h2 className="h2 article-title">Portfolio</h2>
      </header>

      {/* Filter Section */}
      <section className="mb-6">
        {/* Desktop Filter Buttons */}
        <ul className="hidden md:flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <li key={category}>
              <button
                onClick={() => setActiveFilter(category)}
                className={`filter-btn capitalize ${activeFilter === category ? 'active' : ''}`}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>

        {/* Mobile Filter Select */}
        <div className="md:hidden relative mb-6">
          <button 
            onClick={() => setIsSelectOpen(!isSelectOpen)}
            className="bg-card text-light-gray flex justify-between items-center w-full px-4 py-3 border border-border rounded-[14px] text-sm font-light"
          >
            <span className="capitalize">{activeFilter === 'all' ? 'Select category' : activeFilter}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isSelectOpen ? 'rotate-180' : ''}`} />
          </button>

          {isSelectOpen && (
            <ul className="absolute top-full left-0 right-0 mt-[6px] bg-card border border-border rounded-[14px] p-[6px] z-10">
              {categories.map((category) => (
                <li key={category}>
                  <button
                    onClick={() => handleFilterChange(category)}
                    className="bg-card text-light-gray text-sm font-light capitalize w-full text-left px-[10px] py-2 rounded-lg hover:bg-onyx transition-colors"
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Projects Grid */}
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px]">
          {filteredProjects?.map((project) => (
            <li 
              key={project.id} 
              className="animate-scale-up"
              style={{ animationDelay: `${project.id * 50}ms` }}
            >
              <Link to={`/project/${project.id}`} className="block">
                {/* Project Image */}
                <figure className="project-card mb-4 rounded-2xl overflow-hidden h-[200px]">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="project-img w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="overlay">
                    <div className="overlay-icon">
                      <Eye className="w-5 h-5" />
                    </div>
                  </div>
                </figure>

                {/* Project Info */}
                <h3 className="text-white-2 text-[15px] font-normal capitalize leading-tight ml-[10px] mb-1">
                  {project.title}
                </h3>
                <p className="text-light-gray/70 text-sm font-light ml-[10px] capitalize">
                  {project.category}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
};

export default PortfolioSection;
