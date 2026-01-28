import { useState, useEffect, createContext, useContext } from 'react';
import LoadingScreen from '../components/portfolio/LoadingScreen';
import { apiGet, isAuthenticated } from '../api/request';
import { DASHBOARD_ENDPOINTS, PORTFOLIO_ENDPOINTS } from '../api/endpoints';

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
        
        const authed = isAuthenticated();
        const useAdminApi = authed;
        const profileEndpoint = useAdminApi
          ? DASHBOARD_ENDPOINTS.user.list
          : PORTFOLIO_ENDPOINTS.profile.get;
        const settingsEndpoint = useAdminApi
          ? DASHBOARD_ENDPOINTS.settings.list
          : PORTFOLIO_ENDPOINTS.settings.get;

        const endpoints = [
          { key: 'profile', url: profileEndpoint },
          { key: 'resumeOrder', url: useAdminApi ? DASHBOARD_ENDPOINTS.resume.list : PORTFOLIO_ENDPOINTS.resume.get },
          { key: 'edu', url: useAdminApi ? DASHBOARD_ENDPOINTS.education.list : PORTFOLIO_ENDPOINTS.education.list },
          { key: 'exp', url: useAdminApi ? DASHBOARD_ENDPOINTS.experience.list : PORTFOLIO_ENDPOINTS.experience.list },
          { key: 'skills', url: useAdminApi ? DASHBOARD_ENDPOINTS.skills.list : PORTFOLIO_ENDPOINTS.skills.list },
          { key: 'portfolio', url: useAdminApi ? DASHBOARD_ENDPOINTS.portfolio.list : PORTFOLIO_ENDPOINTS.portfolio.list },
          { key: 'blog', url: useAdminApi ? DASHBOARD_ENDPOINTS.blog.list : PORTFOLIO_ENDPOINTS.blog.list },
          { key: 'certificates', url: useAdminApi ? DASHBOARD_ENDPOINTS.certification.list : PORTFOLIO_ENDPOINTS.certificates.list },
          { key: 'team', url: useAdminApi ? DASHBOARD_ENDPOINTS.team.list : PORTFOLIO_ENDPOINTS.team.list },
          { key: 'services', url: useAdminApi ? DASHBOARD_ENDPOINTS.services.list : PORTFOLIO_ENDPOINTS.services.list },
          { key: 'settings', url: settingsEndpoint }
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
            // Only update progress if it's a significant change to reduce re-renders
            const newProgress = 10 + Math.floor((completed / endpoints.length) * 90);
            setProgress(prev => Math.max(prev, newProgress));
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

        const normalizeProfile = (res) =>
          res?.data?.user || res?.user || res?.data || res || null;
        const normalizeSettings = (res) => {
          const data = res?.data ?? res;
          if (Array.isArray(data)) return data[0] || null;
          if (Array.isArray(data?.settings)) return data.settings[0] || null;
          return data || null;
        };
        const normalizeList = (res, keys = []) => {
          if (Array.isArray(res)) return res;
          if (Array.isArray(res?.data)) return res.data;
          if (Array.isArray(res?.data?.data)) return res.data.data;
          if (Array.isArray(res?.data?.items)) return res.data.items;
          for (const key of keys) {
            if (Array.isArray(res?.data?.[key])) return res.data[key];
            if (Array.isArray(res?.[key])) return res[key];
          }
          return [];
        };

        const normalizePortfolio = (res) => {
          const data = res?.data ?? res ?? {};
          const projects = normalizeList(data, ['projects', 'portfolios', 'portfolio']);
          const categories =
            Array.isArray(data?.categories) && data.categories.length > 0
              ? data.categories
              : ['all', ...new Set(projects.map((p) => p.category).filter(Boolean))];

          if (Array.isArray(data)) {
            return { projects, categories };
          }

          return { ...data, projects, categories };
        };

        const normalizeServices = (res) => ({
          services: normalizeList(res, ['services', 'service'])
        });

        const normalizeCertificates = (res) => ({
          certificates: normalizeList(res, ['certificates', 'certificate'])
        });

        const normalizeTeam = (res) => ({
          team: normalizeList(res, ['team', 'teams'])
        });

        const normalizeBlog = (res) => ({
          posts: normalizeList(res, ['posts', 'blogs', 'blog'])
        });

        // Reconstruct the resume object based on the order array and individual data
        const rawOrder = Array.isArray(resumeOrderRes?.data)
          ? resumeOrderRes.data
          : Array.isArray(resumeOrderRes?.data?.order)
            ? resumeOrderRes.data.order
            : Array.isArray(resumeOrderRes?.data?.data)
              ? resumeOrderRes.data.data
              : ["education", "experience", "skills"];
        const order = rawOrder
          .map((item) =>
            typeof item === 'string' ? item : item?.type || item?.name || ''
          )
          .filter(Boolean);
        const normalizedOrder = order.length > 0 ? order : ["education", "experience", "skills"];
        const reconstructedResume = normalizedOrder.map(type => {
          if (type === 'education') return { type: 'education', data: normalizeList(eduRes, ['educations', 'education']) };
          if (type === 'experience') return { type: 'experience', data: normalizeList(expRes, ['experiences', 'experience']) };
          if (type === 'skills') return { type: 'skills', data: normalizeList(skillsRes, ['skills', 'skill']) };
          return { type, data: [] };
        });

        setProfile(normalizeProfile(profileRes));
        setResume(reconstructedResume);
        setPortfolio(normalizePortfolio(portfolioRes));
        setBlog(normalizeBlog(blogRes));
        setCertificates(normalizeCertificates(certificatesRes));
        setTeam(normalizeTeam(teamRes));
        setServices(normalizeServices(servicesRes));
        setSettings(normalizeSettings(settingsRes));

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
