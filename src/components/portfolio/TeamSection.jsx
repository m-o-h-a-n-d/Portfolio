import { useTeam } from '../../context/DataContext';
import { ArrowLeft } from 'lucide-react';

const TeamSection = ({ onBack }) => {
  const teamData = useTeam();

  if (!teamData) return null;

  const team = teamData.team || [];

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
        <h2 className="h2 article-title !mb-0 text-center flex-1">Team Members</h2>
        <div className="w-10 sm:w-[60px]"></div> {/* Spacer to center title */}
      </header>

      <section>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[25px]">
          {team.map((member) => (
            <li key={member.id} className="bg-border-gradient-onyx rounded-[14px] shadow-portfolio-2 p-[1px] z-10 relative">
              <div className="bg-bg-gradient-jet rounded-[14px] p-[20px] h-full">
                <a href={member.url} target="_blank" rel="noopener noreferrer" className="block group text-center">
                  <div className="relative w-full h-[180px] overflow-hidden bg-onyx mb-4 rounded-[14px]">
                    <img 
                      src={member.logo} 
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h4 className="text-white-1 font-medium text-lg mb-1 group-hover:text-primary transition-colors">{member.name}</h4>
                  <p className="text-orange-yellow text-sm">{member.track}</p>
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
};

export default TeamSection;
