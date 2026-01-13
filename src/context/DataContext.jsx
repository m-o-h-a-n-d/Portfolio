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
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setProgress(10);
        
        const endpoints = [
          { key: 'profile', url: API_PROFILE_GET },
          { key: 'resumeOrder', url: API_RESUME_GET },
          { key: 'edu', url: API_EDUCATION_GET },
          { key: 'exp', url: API_EXPERIENCE_GET },
          { key: 'skills', url: API_SKILLS_GET },
          { key: 'portfolio', url: API_PORTFOLIO_LIST },
          { key: 'blog', url: API_BLOG_LIST },
          { key: 'certificates', url: API_CERTIFICATES_LIST },
          { key: 'team', url: API_TEAM_LIST },
          { key: 'services', url: API_SERVICES_LIST },
          { key: 'settings', url: API_SETTINGS_GET }
        ];

        const results = {};
        let completed = 0;

        // Fetch data in parallel for maximum speed
        const fetchPromises = endpoints.map(async (endpoint) => {
          try {
            const res = await apiGet(endpoint.url);
            results[endpoint.key] = res;
          } catch (err) {
            console.error(`Error fetching ${endpoint.key}:`, err);
            results[endpoint.key] = { data: null };
          } finally {
            completed++;
            setProgress(10 + Math.floor((completed / endpoints.length) * 90));
          }
        });

        // Add a safety timeout of 8 seconds
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 8000)
        );

        try {
          await Promise.race([Promise.all(fetchPromises), timeoutPromise]);
        } catch (err) {
          console.warn('Data fetching timed out or failed, proceeding with partial data');
        }
        
        setProgress(100);
        // Small delay to ensure 100% is visible
        await new Promise(resolve => setTimeout(resolve, 200));

        const {
          profile: profileRes,
          resumeOrder: resumeOrderRes,
          edu: eduRes,
          exp: expRes,
          skills: skillsRes,
          portfolio: portfolioRes,
          blog: blogRes,
          certificates: certificatesRes,
          team: teamRes,
          services: servicesRes,
          settings: settingsRes
        } = results;

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
    return <LoadingScreen progress={progress} />;
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
