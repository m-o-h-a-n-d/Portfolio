import { useCertificates } from '../../context/DataContext';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ZoomIn, ArrowLeft } from 'lucide-react';

const limitText = (text, limit = 40) => {
  if (!text) return '';
  return text.length > limit ? `${text.slice(0, limit).trim()}...` : text;
};

const CertificatesSection = ({ onBack }) => {
  const certificatesData = useCertificates();
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  if (!certificatesData) return null;

  const certificates = certificatesData.certificates || [];

  return (
    <article className="animate-fade-in pt-16 md:pt-20">
      <header className="flex justify-between items-center mb-8 gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-light-gray hover:text-primary transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <h2 className="h2 article-title !mb-0 text-center flex-1">Certifications</h2>
        <div className="w-10 sm:w-[60px]"></div> {/* Spacer to center title */}
      </header>

      <section>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[25px]">
          {certificates.sort((a, b) => (a.order || 0) - (b.order || 0)).map((certificate) => (
            <li 
              key={certificate.id} 
              className="relative group cursor-pointer"
              onClick={() => setSelectedCertificate(certificate)}
            >
              <div className="relative bg-border-gradient-onyx rounded-[14px] shadow-portfolio-2 overflow-hidden z-10 h-full flex flex-col">
                <div className="absolute inset-[1px] bg-bg-gradient-jet rounded-[14px] -z-10" />
                
                {/* Certificate Image */}
                <div className="relative w-full h-[160px] overflow-hidden bg-onyx">
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
                <div className="p-[20px] flex-1 flex flex-col justify-between">
                  <h4
                    className="h4 text-white-2 text-left text-sm line-clamp-2 min-h-[40px]"
                    title={certificate.name}
                  >
                    {limitText(certificate.name, 60)}
                  </h4>
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
      </section>

      {/* MODAL */}
      {selectedCertificate && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-[3px] animate-fade-in"
            onClick={() => setSelectedCertificate(null)}
          ></div>

          <div className="relative bg-eerie-black-2 border border-jet rounded-[24px] shadow-portfolio-5 w-full max-w-[900px] p-[20px] md:p-[40px] animate-scale-up z-10 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedCertificate(null)}
              className="absolute top-5 right-5 bg-onyx hover:bg-jet text-white-2 rounded-[12px] w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-all duration-200 shadow-lg z-50 group border border-jet/50"
            >
              <X className="w-5 h-5 md:w-6 md:h-6 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
            </button>

            <div className="flex flex-col gap-6 relative z-10">
              <div className="w-full bg-gradient-onyx rounded-[20px] p-[5px] shadow-portfolio-2 overflow-hidden">
                <img 
                  src={selectedCertificate.avatar} 
                  alt={selectedCertificate.name}
                  className="w-full h-auto object-contain rounded-[14px]"
                />
              </div>

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
    </article>
  );
};

export default CertificatesSection;
