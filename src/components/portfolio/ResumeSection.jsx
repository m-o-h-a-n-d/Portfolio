import { useResume, useProfile, useSettings } from '../../context/DataContext';
import { BookOpen, Briefcase, Download } from 'lucide-react';

const ResumeSection = () => {
  const resume = useResume();
  const profile = useProfile();
  const settings = useSettings();

  if (!resume || !Array.isArray(resume)) return null;

  const formatMonthYear = (value) => {
    if (!value) return null;
    const normalized = typeof value === 'string' ? value.replace(' ', 'T') : value;
    const date = normalized instanceof Date ? normalized : new Date(normalized);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
  };

  const formatItemPeriod = (item) => {
    if (!item) return '';
    const hasDates = item.start_date || item.end_date || item.is_present !== undefined;
    if (hasDates) {
      const start = formatMonthYear(item.start_date);
      const isPresent = item.is_present === 1 || item.is_present === true;
      const end = isPresent ? 'Present' : formatMonthYear(item.end_date);
      if (start && end) return `${start} / ${end}`;
      if (start) return start;
    }
    if (typeof item.period === 'string') {
      const parts = item.period.split('/');
      const startPart = formatMonthYear((parts[0] || '').trim());
      const endRaw = (parts[1] || '').trim();
      const isPresent = endRaw.toLowerCase() === 'present';
      const endPart = isPresent ? 'Present' : formatMonthYear(endRaw);
      if (startPart && endPart) return `${startPart} / ${endPart}`;
      if (startPart) return startPart;
    }
    return item.period || '';
  };

  const renderEducation = (data) => (
    <section className="mb-8" key="education">
      <div className="flex items-center gap-4 mb-6">
        <div className="icon-box">
          <BookOpen className="w-5 h-5" />
        </div>
        <h3 className="h3">Education</h3>
      </div>

      <ol className="ml-16 md:ml-[65px]">
        {data?.map((item, index) => (
          <li 
            key={item.id} 
            className={`timeline-item ${index !== data.length - 1 ? 'pb-5' : ''}`}
          >
            <h4 className="h4 mb-2 leading-tight">{item.title}</h4>
            <span className="text-vegas-gold font-normal leading-relaxed block mb-2">
              {formatItemPeriod(item)}
            </span>
            <p className="text-light-gray font-light leading-relaxed text-sm">
              {item.description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );

  const renderExperience = (data) => (
    <section className="mb-8" key="experience">
      <div className="flex items-center gap-4 mb-6">
        <div className="icon-box">
          <Briefcase className="w-5 h-5" />
        </div>
        <h3 className="h3">Experience</h3>
      </div>

      <ol className="ml-16 md:ml-[65px]">
        {data?.map((item, index) => (
          <li 
            key={item.id} 
            className={`timeline-item ${index !== data.length - 1 ? 'pb-5' : ''}`}
          >
            <h4 className="h4 mb-2 leading-tight">{item.title}</h4>
            <span className="text-vegas-gold font-normal leading-relaxed block mb-2">
              {formatItemPeriod(item)}
            </span>
            <p className="text-light-gray font-light leading-relaxed text-sm">
              {item.description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );

  const renderSkills = (data) => (
    <section className="mb-8" key="skills">
      <h3 className="h3 mb-5">My Skills</h3>
      <ul className="content-card !pt-5 p-5">
        {data?.map((skill, index) => (
          <li 
            key={skill.id} 
            className={index !== data.length - 1 ? 'mb-4' : ''}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <h5 className="h5">{skill.name}</h5>
              <data value={skill.percentage} className="text-light-gray text-[13px] font-light">
                {skill.percentage}%
              </data>
            </div>
            <div className="skill-progress-bg">
              <div 
                className="skill-progress-fill" 
                style={{ width: `${skill.percentage}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );

  const cvUrl = settings?.site_identity?.cv_url || profile?.cv_url;

  return (
    <article className="animate-fade-in">
      {/* Title */}
      <header>
        <h2 className="h2 article-title">Resume</h2>
      </header>

      {/* Dynamic Sections based on Array Order in resume.json */}
      {resume.map(section => {
        if (section.type === 'education') return renderEducation(section.data);
        if (section.type === 'experience') return renderExperience(section.data);
        if (section.type === 'skills') return renderSkills(section.data);
        return null;
      })}

      {/* Download CV Button */}
      <section className="text-center">
        <a 
          href={cvUrl || '#'} 
          download
          className="download-cv-btn inline-flex"
        >
          <Download className="w-5 h-5" />
          <span>Download CV</span>
        </a>
      </section>
    </article>
  );
};

export default ResumeSection;
