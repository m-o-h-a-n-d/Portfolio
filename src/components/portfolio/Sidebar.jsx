import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useProfile } from '../../context/DataContext';
import { 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Github, 
  ChevronDown,
  X,
  ZoomIn
} from 'lucide-react';

const Sidebar = () => {
  // حالة التحكم في الفتح والإغلاق
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const profile = useProfile();

  if (!profile) return null;

  const socialIcons = {
    facebook: Facebook,
    twitter: Twitter,
    instagram: Instagram,
    linkedin: Linkedin,
    github: Github,
  };

function limitWords(text, limit = 2) {
  return text?.trim().split(/\s+/).slice(0, limit).join(" ");
}



  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <aside 
      className={`
        bg-card/80 backdrop-blur-md border border-border rounded-[20px] shadow-portfolio-1 z-10 
        p-[15px] md:p-[30px] lg:p-[40px]
        overflow-hidden transition-all duration-500 ease-in-out relative
        lg:sticky lg:top-[60px]
        /* التحكم في الارتفاع:
           - في الموبايل: مغلق (112px) أو مفتوح (max-h كبير)
           - في الديسك توب (lg): دائماً مفتوح (h-auto)
        */
        ${isExpanded ? 'max-h-[800px]' : 'max-h-[112px] md:max-h-[180px]'} 
        lg:max-h-max lg:h-auto
      `}
    >
      
      {/* Top Section */}
      <div className="flex flex-col items-start lg:items-center gap-4 md:gap-[15px] relative z-10">
        
        {/* Header Layout (Avatar + Name) */}
        <div className="flex items-center gap-4 lg:flex-col lg:gap-6 w-full">
            {/* Avatar */}
            <figure 
              className="bg-gradient-onyx rounded-[20px] lg:rounded-[30px] overflow-hidden flex-shrink-0 relative group cursor-pointer"
              onClick={() => setIsAvatarModalOpen(true)}
            >
              <img 
                  src={profile.avatar} 
                  alt={profile.name} 
                  className="w-[100px] lg:w-[180px] object-cover group-hover:scale-110 transition-transform duration-300" 
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="bg-primary/90 rounded-full p-2 lg:p-3 transform scale-0 group-hover:scale-100 transition-transform duration-300">
                  <ZoomIn className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                </div>
              </div>
            </figure>

            {/* Name & Title */}
            <div className="text-left lg:text-center">
            <h1 className="text-white-2 text-[20px] md:text-[26px] font-medium tracking-tight mb-2 whitespace-nowrap">
                {limitWords(profile.name, 2)}
            </h1>
            <p className="bg-onyx text-white-1 text-xs font-light px-[12px] py-[4px] md:px-[18px] md:py-[5px] rounded-lg inline-block">
                {profile.title}
            </p>
            </div>
        </div>

        {/* Toggle Button (Hidden on Large Screens) */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            absolute -top-[15px] -right-[15px] md:-top-[30px] md:-right-[30px]
            bg-border-gradient-onyx text-primary shadow-portfolio-2
            rounded-bl-[20px] cursor-pointer z-20
            flex items-center justify-center gap-2
            transition-all duration-300 hover:bg-onyx
            p-3 md:px-6 md:py-4
            lg:hidden
          `}
        >
          <span className="hidden md:block text-[13px] font-medium text-primary">
             {isExpanded ? 'Hide Contacts' : 'Show Contacts'}
          </span>
          <ChevronDown 
            className={`w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 text-primary ${isExpanded ? 'rotate-180' : ''}`} 
          />
        </button>

      </div>

      {/* Info Section (Collapsible Content) */}
      <div className={`
         mt-6 lg:mt-8 transition-opacity duration-500
         ${isExpanded ? 'opacity-100' : 'opacity-0 lg:opacity-100'}
      `}>
        
        <div className="separator my-6 bg-border h-[1px]" />

        {/* Contact List */}
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
          
          {/* Email */}
          <li className="flex items-center gap-4 min-w-0">
            <div className="icon-box w-[48px] h-[48px] rounded-xl bg-border-gradient-onyx flex items-center justify-center text-primary shadow-portfolio-1 z-10 relative flex-shrink-0">
               <Mail className="w-5 h-5" />
            </div>
            <div className="flex-1 truncate text-left">
              <p className="text-light-gray/70 text-xs uppercase mb-1">Email</p>
              <a href={`mailto:${profile.contact_email}`} className="text-white-2 text-sm hover:text-primary transition-colors block truncate" title={profile.email}>
                {profile.contact_email}
              </a>
            </div>
          </li>

          {/* Phone */}
          <li className="flex items-center gap-4 min-w-0">
            <div className="icon-box w-[48px] h-[48px] rounded-xl bg-border-gradient-onyx flex items-center justify-center text-primary shadow-portfolio-1 z-10 relative flex-shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div className="flex-1 truncate text-left">
              <p className="text-light-gray/70 text-xs uppercase mb-1">Phone</p>
              <a href={`tel:${profile.phone}`} className="text-white-2 text-sm hover:text-primary transition-colors block truncate">
                {profile.phone}
              </a>
            </div>
          </li>

          {/* Birthday */}
          <li className="flex items-center gap-4 min-w-0">
            <div className="icon-box w-[48px] h-[48px] rounded-xl bg-border-gradient-onyx flex items-center justify-center text-primary shadow-portfolio-1 z-10 relative flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex-1 truncate text-left">
              <p className="text-light-gray/70 text-xs uppercase mb-1">Birthday</p>
              <time className="text-white-2 text-sm block truncate">
                {formatDate(profile.birthday)}
              </time>
            </div>
          </li>

          {/* Location */}
          <li className="flex items-center gap-4 min-w-0">
            <div className="icon-box w-[48px] h-[48px] rounded-xl bg-border-gradient-onyx flex items-center justify-center text-primary shadow-portfolio-1 z-10 relative flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex-1 truncate text-left">
              <p className="text-light-gray/70 text-xs uppercase mb-1">Location</p>
              <address className="text-white-2 text-sm not-italic block truncate">
                {profile.location}
              </address>
            </div>
          </li>
        </ul>

        <div className="separator my-6 bg-border h-[1px]" />

        {/* Social Links */}
        <ul className="flex items-center justify-center gap-4">
          {profile.social_links && Object.entries(profile.social_links).map(([platform, url], index) => {
            const Icon = socialIcons[platform] || Facebook;
            if (!url) return null;
            return (
              <li key={index}>
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-light-gray/70 hover:text-light-gray transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Avatar Modal (Same style as certificates) */}
      {isAvatarModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-[3px] animate-fade-in"
            onClick={() => setIsAvatarModalOpen(false)}
          ></div>

          <div className="relative bg-eerie-black-2 border border-jet rounded-[24px] shadow-portfolio-5 w-full max-w-[600px] p-[20px] md:p-[40px] animate-scale-up z-10 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsAvatarModalOpen(false)}
              className="absolute top-5 right-5 bg-onyx hover:bg-jet text-white-2 rounded-[12px] w-12 h-12 flex items-center justify-center transition-all duration-200 shadow-lg z-50 group border border-jet/50"
            >
              <X className="w-6 h-6 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
            </button>

            <div className="flex flex-col gap-6 relative z-10">
              <div className="w-full bg-gradient-onyx rounded-[20px] p-[5px] shadow-portfolio-2 overflow-hidden">
                <img 
                  src={profile.avatar} 
                  alt={profile.name}
                  className="w-full h-auto object-contain rounded-[14px]"
                />
              </div>
              <div className="text-center">
                <h3 className="text-[24px] md:text-[32px] text-white-2 font-bold mb-2 tracking-tight">
                  {profile.name}
                </h3>
                <p className="text-primary font-medium">{profile.title}</p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </aside>
  );
};

export default Sidebar;
