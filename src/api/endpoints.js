/* src/api/endpoints.js */

export const BASE_URL = "https://portfolio.test/api";

// ==========================================
// 1. Authentication
// ==========================================
export const API_LOGIN = `${BASE_URL}/auth/login`;
export const API_LOGOUT = `${BASE_URL}/auth/logout`;
export const API_REGISTER = `${BASE_URL}/auth/register`;
export const API_USER_ME = `${BASE_URL}/auth/me`;

// ==========================================
// 2. Global Settings
// ==========================================
export const API_SETTINGS_GET = `${BASE_URL}/settings`;
export const API_SETTINGS_UPDATE = `${BASE_URL}/settings/update`;

// ==========================================
// 3. Profile Section
// ==========================================
export const API_PROFILE_GET = `${BASE_URL}/profile`;
export const API_PROFILE_UPDATE = `${BASE_URL}/profile/update`;

// ==========================================
// 4. Resume Section (Unified Array Structure)
// ==========================================
export const API_RESUME_GET = `${BASE_URL}/resume`;
export const API_RESUME_REORDER = `${BASE_URL}/resume/reorder`;

// Education Endpoints
export const API_EDUCATION_GET = `${BASE_URL}/resume/education`;
export const API_EDUCATION_CREATE = `${BASE_URL}/resume/education`;
export const API_EDUCATION_UPDATE = (id) => `${BASE_URL}/resume/education/${id}`;
export const API_EDUCATION_DELETE = (id) => `${BASE_URL}/resume/education/${id}`;

// Experience Endpoints
export const API_EXPERIENCE_GET = `${BASE_URL}/resume/experience`;
export const API_EXPERIENCE_CREATE = `${BASE_URL}/resume/experience`;
export const API_EXPERIENCE_UPDATE = (id) => `${BASE_URL}/resume/experience/${id}`;
export const API_EXPERIENCE_DELETE = (id) => `${BASE_URL}/resume/experience/${id}`;

// Skills Endpoints
export const API_SKILLS_GET = `${BASE_URL}/resume/skills`;
export const API_SKILLS_CREATE = `${BASE_URL}/resume/skills`;
export const API_SKILLS_UPDATE = (id) => `${BASE_URL}/resume/skills/${id}`;
export const API_SKILLS_DELETE = (id) => `${BASE_URL}/resume/skills/${id}`;

// ==========================================
// 5. Portfolio Section
// ==========================================
export const API_PORTFOLIO_LIST = `${BASE_URL}/portfolio`;
export const API_PORTFOLIO_CREATE = `${BASE_URL}/portfolio`;
export const API_PORTFOLIO_UPDATE = (id) => `${BASE_URL}/portfolio/${id}`;
export const API_PORTFOLIO_DELETE = (id) => `${BASE_URL}/portfolio/${id}`;
export const API_PORTFOLIO_GET = (id) => `${BASE_URL}/portfolio/${id}`;

// ==========================================
// 6. Blog Section
// ==========================================
export const API_BLOG_LIST = `${BASE_URL}/blog`;
export const API_BLOG_CREATE = `${BASE_URL}/blog`;
export const API_BLOG_UPDATE = (id) => `${BASE_URL}/blog/${id}`;
export const API_BLOG_DELETE = (id) => `${BASE_URL}/blog/${id}`;
export const API_BLOG_GET = (id) => `${BASE_URL}/blog/${id}`;

// ==========================================
// 7. Certificates
// ==========================================
export const API_CERTIFICATES_LIST = `${BASE_URL}/certificates`;
export const API_CERTIFICATES_CREATE = `${BASE_URL}/certificates`;
export const API_CERTIFICATES_UPDATE = (id) => `${BASE_URL}/certificates/${id}`;
export const API_CERTIFICATES_DELETE = (id) => `${BASE_URL}/certificates/${id}`;

// ==========================================
// 8. Services Section
// ==========================================
export const API_SERVICES_LIST = `${BASE_URL}/services`;
export const API_SERVICES_CREATE = `${BASE_URL}/services/store`;
export const API_SERVICES_UPDATE = (id) => `${BASE_URL}/services/${id}`;
export const API_SERVICES_DELETE = (id) => `${BASE_URL}/services/${id}`;

// ==========================================
// 9. Team Section
// ==========================================
export const API_TEAM_LIST = `${BASE_URL}/team`; 
export const API_TEAM_CREATE = `${BASE_URL}/team`;
export const API_TEAM_UPDATE = (id) => `${BASE_URL}/team/${id}`;
export const API_TEAM_DELETE = (id) => `${BASE_URL}/team/${id}`;

// ==========================================
// 10. Communication (Messages)
// ==========================================
export const API_MESSAGES_LIST = `${BASE_URL}/messages`;
export const API_MESSAGES_SEND = `${BASE_URL}/messages/send`;
export const API_MESSAGES_DELETE = (id) => `${BASE_URL}/messages/${id}`;
export const API_MESSAGES_READ = (id) => `${BASE_URL}/messages/${id}/read`;
