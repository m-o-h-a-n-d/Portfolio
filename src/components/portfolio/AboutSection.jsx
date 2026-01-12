import { useProfile, useServices, useCertificates, useTeam } from '../../context/DataContext';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Monitor, 
  Server, 
  Wifi, 
  Layout, 
  X, 
  Code,
  Smartphone,
  Database,
  Globe,
  Cpu,
  ZoomIn
} from 'lucide-react';

const serviceIcons = {
  frontend: Monitor,
  backend: Server,
  iot: Wifi,
  uiux: Layout,
  code: Code,
  mobile: Smartphone,
  database: Database,
  web: Globe,
  hardware: Cpu
};


const AboutSection = () => {
  const profile = useProfile();
  const services = useServices();
  const certificates = useCertificates();
  const team = useTeam();
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const certificatesRef = useRef(null);
  const teamRef = useRef(null);

  useEffect(() => {
    const scrollInterval = setInterval(() => {
      // Auto-scroll Certificates
      if (certificatesRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = certificatesRef.current;
        const itemWidth = certificatesRef.current.querySelector('li')?.offsetWidth || 200;
        const gap = 20; // gap-[20px]
        const scrollStep = itemWidth + gap;

        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          certificatesRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Calculate next snap position
          const nextScroll = Math.ceil((scrollLeft + 1) / scrollStep) * scrollStep;
          certificatesRef.current.scrollTo({ left: nextScroll, behavior: 'smooth' });
        }
      }

      // Auto-scroll Team
      if (teamRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = teamRef.current;
        const itemWidth = teamRef.current.querySelector('li')?.offsetWidth || 200;
        const gap = 30; // gap-[30px]
        const scrollStep = itemWidth + gap;

        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          teamRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Calculate next snap position
          const nextScroll = Math.ceil((scrollLeft + 1) / scrollStep) * scrollStep;
          teamRef.current.scrollTo({ left: nextScroll, behavior: 'smooth' });
        }
      }
    }, 5000);

    return () => clearInterval(scrollInterval);
  }, [certificates, team]);

  if (!profile) return null;

  return (
    <article className="animate-fade-in">
      <header>
        <h2 className="h2 article-title">About me</h2>
      </header>

      <section className="text-light-gray text-[18px] font-light leading-relaxed mb-9 text-left relative">
        <div className={`transition-all duration-500 overflow-hidden ${!isExpanded ? 'max-h-[150px]' : 'max-h-[2000px]'}`}>
          {typeof profile.about === 'string' ? (
            <p className="mb-4 text-left ">{profile.about}</p>
          ) : Array.isArray(profile.about) ? (
            profile.about.map((paragraph, index) => (
              <p key={index} className="mb-4 text-left ">{paragraph}</p>
            ))
          ) : null}
        </div>
        
        {!isExpanded && (
          <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-bg-gradient-jet to-transparent pointer-events-none" />
        )}

        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 text-primary font-medium hover:underline transition-all duration-300 flex items-center gap-1"
        >
          {isExpanded ? 'Read Less' : 'Read More'}
        </button>
      </section>

      {/* Services */}
      <section className="mb-9">
        <h3 className="h3 mb-5">What I'm Doing</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {services?.services?.map((service) => {
            const Icon = serviceIcons[service.icon] || Code;
            return (
              <li key={service.id} className="service-item p-[20px] md:p-[30px] bg-border-gradient-onyx rounded-[14px] shadow-portfolio-2 flex gap-5 items-start z-10 relative">
                <div className="absolute inset-[1px] bg-bg-gradient-jet rounded-[14px] -z-10" />
                <div className="text-primary w-[40px] h-[40px] flex-shrink-0">
                  <Icon className="w-10 h-10" strokeWidth={1.5} />
                </div>
                <div className="text-left">
                  <h4 className="h4 mb-2 text-white-2">{service.title}</h4>
                  <p className="text-light-gray text-[15px] font-light leading-relaxed text-left">
                    {service.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Certificates Section */}
      <section className="mb-8">
        <h3 className="h3 mb-5">Certificates</h3>
        
        <div className="-mx-[15px] px-[15px]">
          <ul 
            ref={certificatesRef}
            className="flex gap-[20px] overflow-x-auto has-scrollbar pb-6 scroll-smooth snap-x snap-mandatory"
          >
            {certificates?.certificates?.sort((a, b) => (a.order || 0) - (b.order || 0)).map((certificate) => (
              <li 
                key={certificate.id} 
                className="min-w-[75%] md:min-w-[120px] flex-shrink-0 snap-start relative group cursor-pointer"
                onClick={() => setSelectedCertificate(certificate)}
              >
                <div className="relative bg-border-gradient-onyx rounded-[14px] shadow-portfolio-2 overflow-hidden z-10 h-full">
                  <div className="absolute inset-[1px] bg-bg-gradient-jet rounded-[14px] -z-10" />
                  
                  {/* Certificate Image */}
                   {/* Certificate Image */}
                  <div className="relative w-full h-[140px] md:h-[160px] overflow-hidden bg-onyx">
                    <img 
                      src={certificate.avatar} 
                      alt={certificate.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="bg-primary/90 rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform duration-300">
                        <ZoomIn className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Certificate Title */}
                  <div className="p-[15px] md:p-[20px]">
                    <h4 className="h4 text-white-2 truncate text-left text-sm">{certificate.name}</h4>
                    <time className="text-light-gray/70 text-xs font-medium block mt-2 text-left">
                      {new Date(certificate.date).toLocaleDateString('en-GB', { 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </time>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* MODAL */}
      {selectedCertificate && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-[3px] animate-fade-in"
            onClick={() => setSelectedCertificate(null)}
          ></div>

          <div className="relative bg-eerie-black-2 border border-jet rounded-[24px] shadow-portfolio-5 w-full max-w-[900px] p-[40px] animate-scale-up z-10 max-h-[90vh] overflow-y-auto">
            
            <button 
              onClick={() => setSelectedCertificate(null)}
              className="absolute top-5 right-5 bg-onyx hover:bg-jet text-white-2 rounded-[12px] w-12 h-12 flex items-center justify-center transition-all duration-200 shadow-lg z-50 group border border-jet/50"
            >
              <X className="w-6 h-6 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
            </button>

            <div className="flex flex-col gap-6 relative z-10">
              {/* Certificate Image */}
              <div className="w-full bg-gradient-onyx rounded-[20px] p-[5px] shadow-portfolio-2 overflow-hidden">
                <img 
                  src={selectedCertificate.avatar} 
                  alt={selectedCertificate.name}
                  className="w-full h-auto object-contain rounded-[14px]"
                />
              </div>

              {/* Certificate Info */}
              <div className="text-left">
                <h3 className="text-[18px] md:text-[32px] text-white-2 font-bold mb-2 tracking-tight break-words">
                  {selectedCertificate.name}
                </h3>
                
                <time className="block text-[16px] text-light-gray/70 mb-4 font-medium">
                  {new Date(selectedCertificate.date).toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </time>

                {selectedCertificate.text && selectedCertificate.text.length > 5 && (
                  <div className="text-[16px] md:text-[18px] text-light-gray font-light leading-loose max-h-[300px] overflow-y-auto pr-3 custom-scrollbar">
                    <p className="break-words">
                      {selectedCertificate.text}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* team */}
      <section className="mb-4">
        <h3 className="h3 mb-5">team</h3>
        <div className="-mx-[15px] px-[15px]">
            <ul 
              ref={teamRef}
              className="flex gap-[30px] overflow-x-auto has-scrollbar pb-6 scroll-smooth snap-x snap-mandatory"
            >
            {team?.team?.map((member) => (
                <li key={member.id} className="min-w-[75%] md:min-w-[190px] flex-shrink-0 snap-start">
                <a href={member.url} target="_blank" rel="noopener noreferrer" className="block group text-center">
                    <div className="relative w-full h-[150px] md:h-[170px] overflow-hidden bg-onyx">
                      <img 
                      src={member.logo} 
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 rounded-[14px]"
                      />
                    </div>
                    <h4 className="text-white-1 font-medium text-lg mb-1">{member.name}</h4>
                    <p className="text-orange-yellow text-sm">{member.track}</p>
                </a>
                </li>
            ))}
            </ul>
        </div>
      </section>
    </article>
  );
};

export default AboutSection;
