import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePortfolio, useTeam } from '../../context/DataContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { ExternalLink, Github, ArrowLeft, Share2, Users, Code } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const portfolio = usePortfolio();
  const teamData = useTeam();

  if (!portfolio) return null;

  const project = portfolio.projects.find(p => p.id === parseInt(id));

  if (!project) {
    return (
      <div className="text-center py-20">
        <h2 className="text-white-2 text-2xl mb-4">Project not found</h2>
        <button onClick={() => navigate('/')} className="form-btn w-auto px-6 mx-auto">
          Back to Portfolio
        </button>
      </div>
    );
  }

  // Get related projects (same category, excluding current, latest 3)
  const relatedProjects = portfolio.projects
    .filter(p => p.category === project.category && p.id !== project.id)
    .sort((a, b) => b.id - a.id)
    .slice(0, 3);

  // Get team members for this project
  const projectTeam = teamData?.team?.filter(member => 
    project.team_members?.includes(member.id)
  ) || [];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: project.title,
        text: project.description,
        url: window.location.href,
      });
    } else {
      alert('Sharing is not supported on this browser. Copy the URL to share!');
    }
  };

  return (
    <article className="animate-fade-in">
      <header className="flex justify-between items-center mb-8">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-light-gray hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <h2 className="h2 article-title !mb-0">{project.title}</h2>
        <button 
          onClick={handleShare}
          className="icon-box !w-10 !h-10 hover:bg-primary hover:text-black transition-all"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </header>

      {/* Image Slider */}
      <section className="mb-10 rounded-2xl overflow-hidden border border-border shadow-2">
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={0}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          className="project-swiper h-[300px] md:h-[500px]"
        >
          {(project.images || [project.image]).map((img, index) => (
            <SwiperSlide key={index}>
              <img 
                src={img} 
                alt={`${project.title} - ${index + 1}`} 
                className="w-full h-full object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Project Info */}
        <div className="lg:col-span-2">
          <section className="mb-8">
            <h3 className="h3 mb-4">About Project</h3>
            <p className="text-light-gray leading-relaxed font-light">
              {project.full_description || project.description}
            </p>
          </section>

          {/* Technologies */}
          {project.technologies && (
            <section className="mb-8">
              <h3 className="h3 mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" />
                Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, index) => (
                  <span 
                    key={index}
                    className="px-4 py-1.5 bg-onyx border border-border rounded-full text-xs text-light-gray"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Team Members */}
          {projectTeam.length > 0 && (
            <section className="mb-8">
              <h3 className="h3 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Team Work
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projectTeam.map((member) => (
                  <a 
                    key={member.id}
                    href={member.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="service-item !p-4 hover:border-primary transition-colors group"
                  >
                    <div className="icon-box !w-12 !h-12 !rounded-full overflow-hidden">
                      <img src={member.logo} alt={member.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="h4 !text-sm group-hover:text-primary transition-colors">{member.name}</h4>
                      <p className="text-xs text-light-gray/70">{member.track}</p>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Actions */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-4">
            {project.link && (
              <a 
                href={project.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="form-btn flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                Live Project
              </a>
            )}
            {project.github && (
              <a 
                href={project.github} 
                target="_blank" 
                rel="noopener noreferrer"
                className="form-btn !bg-transparent border border-border hover:!bg-onyx flex items-center justify-center gap-2"
              >
                <Github className="w-5 h-5" />
                View Code
              </a>
            )}

            <div className="bg-card border border-border rounded-2xl p-6 mt-8">
              <h4 className="h4 mb-4 text-sm uppercase tracking-wider text-light-gray/50">Project Details</h4>
              <ul className="space-y-4">
                <li className="flex justify-between text-sm">
                  <span className="text-light-gray/60">Category</span>
                  <span className="text-white-2">{project.category}</span>
                </li>
                <li className="flex justify-between text-sm">
                  <span className="text-light-gray/60">Status</span>
                  <span className="text-primary">Completed</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="mt-16 pt-16 border-t border-border">
          <h3 className="h3 mb-8">Related Projects</h3>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedProjects.map((p) => (
              <li key={p.id} className="animate-scale-up">
                <Link to={`/project/${p.id}`} className="block group">
                  <figure className="project-card mb-4 rounded-2xl overflow-hidden h-[180px]">
                    <img 
                      src={p.image} 
                      alt={p.title}
                      className="project-img w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="overlay group-hover:bg-black/50 transition-all">
                      <div className="overlay-icon opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all">
                        <ArrowLeft className="w-5 h-5 rotate-180" />
                      </div>
                    </div>
                  </figure>
                  <h4 className="text-white-2 text-[15px] font-normal capitalize ml-2 group-hover:text-primary transition-colors">
                    {p.title}
                  </h4>
                  <p className="text-light-gray/70 text-sm font-light ml-2 capitalize">
                    {p.category}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
};

export default ProjectDetails;
