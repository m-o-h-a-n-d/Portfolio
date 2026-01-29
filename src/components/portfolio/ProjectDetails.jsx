import { useParams, useNavigate } from 'react-router-dom';
import { usePortfolio, useTeam } from '../../context/DataContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';
import { ExternalLink, Github, ArrowLeft, Share2, Users, Code, Calendar, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const ProjectDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const portfolio = usePortfolio();
  const teamData = useTeam();
  const teamRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const scrollInterval = setInterval(() => {
      if (teamRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = teamRef.current;
        const itemWidth = teamRef.current.querySelector('li')?.offsetWidth || 200;
        const gap = 30;
        const scrollStep = itemWidth + gap;

        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          teamRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          const nextScroll = Math.ceil((scrollLeft + 1) / scrollStep) * scrollStep;
          teamRef.current.scrollTo({ left: nextScroll, behavior: 'smooth' });
        }
      }
    }, 5000);

    return () => clearInterval(scrollInterval);
  }, [teamData]);

  if (!portfolio) return null;

  const project = portfolio.projects.find(p => p.slug === slug || p.id === parseInt(slug));

  if (!project) {
    return (
      <div className="text-center py-20">
        <h2 className="text-white-2 text-2xl mb-4">Project not found</h2>
        <a href="/" className="form-btn w-auto px-6 mx-auto inline-flex">
          Back to Portfolio
        </a>
      </div>
    );
  }

  const relatedProjects = portfolio.projects
    .filter(p => p.category === project.category && p.id !== project.id)
    .sort((a, b) => b.id - a.id)
    .slice(0, 3);

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

  const projectImages = project.images || [project.image];

  return (
    <article className="animate-fade-in pt-16 md:pt-20">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 gap-4">
        <a 
          href="/" 
          className="flex items-center gap-2 text-light-gray hover:text-primary transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Back</span>
        </a>
        <h2 className="h2 article-title !mb-0 text-center flex-1">{project.title}</h2>
        <button 
          onClick={handleShare}
          className="icon-box !w-10 !h-10 hover:bg-primary hover:text-black transition-all flex-shrink-0"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </header>

      {/* Image Slider with Enhanced Features */}
      <section className="mb-10 rounded-2xl overflow-hidden border border-border shadow-2">
        <div className="relative">
          <Swiper
            modules={[Autoplay, Navigation, Pagination, EffectFade]}
            spaceBetween={0}
            slidesPerView={1}
            navigation={{
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            }}
            pagination={{ 
              clickable: true,
              dynamicBullets: true,
            }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            effect="fade"
            onSlideChange={(swiper) => setActiveSlide(swiper.activeIndex)}
            className="project-swiper h-[250px] sm:h-[350px] md:h-[500px]"
          >
            {projectImages.map((img, index) => (
              <SwiperSlide key={index}>
                <img 
                  src={img} 
                  alt={`${project.title} - ${index + 1}`} 
                  className="w-full h-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Slide Counter */}
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-white-1 z-10">
            {activeSlide + 1} / {projectImages.length}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          {/* About Project */}
          <section className="mb-8">
            <h3 className="h3 mb-4">About Project</h3>
            <p className="text-light-gray leading-relaxed font-light text-left">
              {project.full_description || project.description}
            </p>
          </section>

          {/* Technologies */}
          {project.technologies && project.technologies.length > 0 && (
            <section className="mb-8">
              <h3 className="h3 mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" />
                Technologies Used
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, index) => (
                  <span 
                    key={index}
                    className="px-4 py-1.5 bg-onyx border border-border rounded-full text-xs text-light-gray hover:border-primary hover:text-primary transition-colors cursor-default"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Team Members Section */}
          {projectTeam.length > 0 && (
            <section className="mb-8">
              <h3 className="h3 mb-5 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Team Work ({projectTeam.length})
              </h3>
              <div className="-mx-[15px] px-[15px]">
                <ul 
                  ref={teamRef}
                  className="flex gap-[30px] overflow-x-auto has-scrollbar pb-6 scroll-smooth snap-x snap-mandatory"
                >
                  {projectTeam.map((member) => (
                    <li key={member.id} className="min-w-[75%] md:min-w-[190px] flex-shrink-0 snap-start">
                      <a href={member.url} target="_blank" rel="noopener noreferrer" className="block group text-center">
                        <div className="relative w-full h-[150px] md:h-[170px] overflow-hidden bg-onyx mb-3 rounded-[14px]">
                          <img 
                            src={member.logo} 
                            alt={member.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                        </div>
                        <h4 className="text-white-1 font-medium text-lg mb-1">{member.name}</h4>
                        <p className="text-orange-yellow text-sm">{member.track}</p>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            {/* Action Buttons */}
            <div className="space-y-3">
              {project.link && (
                <a 
                  href={project.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="form-btn flex items-center justify-center gap-2 group"
                >
                  <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  Live Project
                </a>
              )}
              {project.github && (
                <a 
                  href={project.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="form-btn !bg-transparent border border-border hover:!bg-onyx flex items-center justify-center gap-2 group"
                >
                  <Github className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
                  View Code
                </a>
              )}
            </div>

            {/* Project Details Card */}
            <div className="bg-card/80 backdrop-blur-md border border-border rounded-2xl p-6 mt-8">
              <h4 className="h4 mb-4 text-sm uppercase tracking-wider text-light-gray/50">Project Details</h4>
              <ul className="space-y-4">
                <li className="flex justify-between items-center text-sm">
                  <span className="text-light-gray/60 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Category
                  </span>
                  <span className="text-white-2 text-right font-medium">{project.category}</span>
                </li>
                <li className="flex justify-between items-center text-sm">
                  <span className="text-light-gray/60 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Status
                  </span>
                  {(() => {
                    const isCompleted =
                      project?.status === 1 ||
                      project?.status === '1' ||
                      project?.status === true;

                    return (
                      <span className={`${isCompleted ? 'text-primary' : 'text-vegas-gold'} font-medium`}>
                        {isCompleted ? 'Completed' : 'In Progress'}
                      </span>
                    );
                  })()}
                </li>
                {projectTeam.length > 0 && (
                  <li className="flex justify-between items-center text-sm">
                    <span className="text-light-gray/60 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Team Size
                    </span>
                    <span className="text-white-2 text-right font-medium">{projectTeam.length} member{projectTeam.length > 1 ? 's' : ''}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Related Projects Section */}
      {relatedProjects.length > 0 && (
        <section className="mt-16 pt-16 border-t border-border">
          <h3 className="h3 mb-8">Related Projects</h3>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedProjects.map((p) => (
              <li key={p.id} className="animate-scale-up">
                <a href={`/project/${p.slug || p.id}`} className="block group">
                  <figure className="project-card mb-4 rounded-2xl overflow-hidden h-[180px]">
                    <img 
                      src={p.image} 
                      alt={p.title}
                      className="project-img w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
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
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
};

export default ProjectDetails;
