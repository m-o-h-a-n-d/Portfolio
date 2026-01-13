import { useState, useEffect, createContext, useContext } from 'react';
import LoadingScreen from '../components/portfolio/LoadingScreen';
import { apiGet } from '../api/request';
import { 
  API_PROFILE_GET, 
  API_RESUME_GET, 
  API_EDUCATION_GET, 
  API_EXPERIENCE_GET, 
  API_SKILLS_GET,
  API_PORTFOLIO_LIST,
  API_BLOG_LIST,
  API_CERTIFICATES_LIST,
  API_TEAM_LIST,
  API_SERVICES_LIST,
  API_SETTINGS_GET
} from '../api/endpoints';

// Create contexts for data
const ProfileContext = createContext(null);
const ResumeContext = createContext(null);
const PortfolioContext = createContext(null);
const BlogContext = createContext(null);
const ServicesContext = createContext(null);
const CertificatesContext = createContext(null);
const TeamContext = createContext(null);
const SettingsContext = createContext(null);

// Custom hooks for accessing data
export const useProfile = () => useContext(ProfileContext);
export const useResume = () => useContext(ResumeContext);
export const usePortfolio = () => useContext(PortfolioContext);
export const useBlog = () => useContext(BlogContext);
export const useServices = () => useContext(ServicesContext);
export const useCertificates = () => useContext(CertificatesContext);
export const useTeam = () => useContext(TeamContext);
export const useSettings = () => useContext(SettingsContext);

// Data Provider Component
export const DataProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [resume, setResume] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [blog, setBlog] = useState(null);
  const [services, setServices] = useState(null);
  const [certificates, setCertificates] = useState(null);
  const [team, setTeam] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        const [
          profileRes,
          resumeOrderRes,
          eduRes,
          expRes,
          skillsRes,
          portfolioRes,
          blogRes,
          certificatesRes,
          teamRes,
          servicesRes,
          settingsRes
        ] = await Promise.all([
          apiGet(API_PROFILE_GET),
          apiGet(API_RESUME_GET),
          apiGet(API_EDUCATION_GET),
          apiGet(API_EXPERIENCE_GET),
          apiGet(API_SKILLS_GET),
          apiGet(API_PORTFOLIO_LIST),
          apiGet(API_BLOG_LIST),
          apiGet(API_CERTIFICATES_LIST),
          apiGet(API_TEAM_LIST),
          apiGet(API_SERVICES_LIST),
          apiGet(API_SETTINGS_GET)
        ]);

        // Reconstruct the resume object based on the order array and individual data
        const order = resumeOrderRes.data || ["education", "experience", "skills"];
        const reconstructedResume = order.map(type => {
          if (type === 'education') return { type: 'education', data: eduRes.data || [] };
          if (type === 'experience') return { type: 'experience', data: expRes.data || [] };
          if (type === 'skills') return { type: 'skills', data: skillsRes.data || [] };
          return { type, data: [] };
        });

        setProfile(profileRes.data);
        setResume(reconstructedResume);
        setPortfolio(portfolioRes.data);
        setBlog(blogRes.data);
        setCertificates(certificatesRes.data);
        setTeam(teamRes.data);
        setServices(servicesRes.data);
        setSettings(settingsRes.data);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-destructive">
          <p>Error loading data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <SettingsContext.Provider value={settings}>
      <ProfileContext.Provider value={profile}>
        <ResumeContext.Provider value={resume}>
          <PortfolioContext.Provider value={portfolio}>
            <BlogContext.Provider value={blog}>
              <ServicesContext.Provider value={services}>
                <CertificatesContext.Provider value={certificates}>
                  <TeamContext.Provider value={team}>
                    {children}
                  </TeamContext.Provider>
                </CertificatesContext.Provider>
              </ServicesContext.Provider>
            </BlogContext.Provider>
          </PortfolioContext.Provider>
        </ResumeContext.Provider>
      </ProfileContext.Provider>
    </SettingsContext.Provider>
  );
};
