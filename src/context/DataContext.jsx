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
            results[endpoint.key] = { data: null };
          } finally {
            completed++;
            const newProgress = 10 + Math.floor((completed / endpoints.length) * 90);
            setProgress(prev => Math.max(prev, newProgress));
          }
        });

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 8000)
        );

        try {
          await Promise.race([Promise.all(fetchPromises), timeoutPromise]);
        } catch (err) {
        }
        
        setProgress(100);
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

        // Helper to extract list from various response structures
        const normalizeList = (res, keys = []) => {
          const data = res?.data ?? res;
          if (Array.isArray(data)) return data;
          if (Array.isArray(data?.data)) return data.data;
          if (Array.isArray(data?.items)) return data.items;
          
          for (const key of keys) {
            if (Array.isArray(data?.[key])) return data[key];
          }
          return [];
        };

        // 1. Normalize Profile
        const profileData = profileRes?.data?.user || profileRes?.user || profileRes?.data || profileRes || null;
        setProfile(profileData);

        // 2. Normalize Settings
        const rawSettings = settingsRes?.data ?? settingsRes;
        const settingsData = Array.isArray(rawSettings) ? rawSettings[0] : (rawSettings?.settings?.[0] || rawSettings || null);
        setSettings(settingsData);

        // 3. Normalize Services
        const servicesList = normalizeList(servicesRes, ['services', 'service']);
        setServices({ services: servicesList });

        // 4. Normalize Certificates
        const certsList = normalizeList(certificatesRes, ['certificates', 'certificate', 'certifications']).map(cert => ({
          ...cert,
          avatar: cert.avatar || cert.image || '', // Handle both field names
        }));
        setCertificates({ certificates: certsList });

        // 5. Normalize Team
        const teamList = normalizeList(teamRes, ['team', 'teams']).map(member => ({
          ...member,
          logo: member.logo || member.image || member.avatar || '', // Handle multiple field names
        }));
        setTeam({ team: teamList });

        // 6. Normalize Blog
        const blogList = normalizeList(blogRes, ['posts', 'blogs', 'blog']).map(post => ({
          ...post,
          excerpt: post.excerpt || post.short_desc || post.description || '',
        }));
        setBlog({ posts: blogList });

        // 7. Normalize Portfolio
        const portfolioDataRaw = portfolioRes?.data ?? portfolioRes ?? {};
        const serviceTitleById = new Map(
          (Array.isArray(servicesList) ? servicesList : []).map(service => [
            String(service?.id),
            service?.title || service?.name || service?.slug || ''
          ])
        );
        const resolveCategory = (project) => {
          const direct = project?.category;
          if (typeof direct === 'string' && direct.trim() !== '') return direct;
          if (project?.service_name) return project.service_name;
          if (project?.service_title) return project.service_title;
          if (project?.service?.title) return project.service.title;
          if (project?.service?.name) return project.service.name;
          if (typeof project?.service === 'string') return project.service;
          const serviceId = project?.service_id ?? project?.service?.id;
          const mapped = serviceId != null ? serviceTitleById.get(String(serviceId)) : '';
          return mapped || '';
        };
        const projectsList = normalizeList(portfolioDataRaw, ['projects', 'portfolios', 'portfolio']).map(project => ({
          ...project,
          image: project.image || project.image_cover || (Array.isArray(project?.images) ? project.images[0] : ''),
          category: resolveCategory(project),
          description: project.description || project.short_desc || project.desc || '',
          full_description: project.full_description || project.description || ''
        }));
        
        const categories = Array.isArray(portfolioDataRaw?.categories) && portfolioDataRaw.categories.length > 0
          ? portfolioDataRaw.categories
          : ['all', ...new Set(projectsList.map((p) => p.category).filter(Boolean))];
        
        setPortfolio({ 
          ...portfolioDataRaw, 
          projects: projectsList, 
          categories 
        });

        // 8. Normalize Resume (Education, Experience, Skills)
        const rawOrder = Array.isArray(resumeOrderRes?.data)
          ? resumeOrderRes.data
          : Array.isArray(resumeOrderRes?.data?.order)
            ? resumeOrderRes.data.order
            : ["education", "experience", "skills"];
        
        const order = rawOrder
          .map((item) => typeof item === 'string' ? item : item?.type || item?.name || '')
          .filter(Boolean);
        
        const normalizedOrder = order.length > 0 ? order : ["education", "experience", "skills"];
        
        const reconstructedResume = normalizedOrder.map(type => {
          if (type === 'education') return { type: 'education', data: normalizeList(eduRes, ['educations', 'education']) };
          if (type === 'experience') return { type: 'experience', data: normalizeList(expRes, ['experiences', 'experience']) };
          if (type === 'skills') return { type: 'skills', data: normalizeList(skillsRes, ['skills', 'skill']) };
          return { type, data: [] };
        });
        setResume(reconstructedResume);

      } catch (err) {
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
