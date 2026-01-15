/* src/api/endpoints.js */

export const BASE_URL = "http://localhost:8000/api";

// ==========================================
// 1. Authentication
// ==========================================
// [POST] Login user & return Token
export const API_LOGIN = `${BASE_URL}/auth/login`;

// ==========================================
// 2. Global Settings
// ==========================================
// [GET] Fetch site settings (Logo, Favicon, Social Links)
export const API_SETTINGS_GET = `${BASE_URL}/settings`;
// [POST] Update site settings
export const API_SETTINGS_UPDATE = `${BASE_URL}/settings/update`;

// ==========================================
// 3. Profile Section
// ==========================================
// [GET] Get personal info (Name, Bio, Job, CV URL)
export const API_PROFILE_GET = `${BASE_URL}/profile`;
// [POST] Update profile info (Handle FormData for CV PDF)
export const API_PROFILE_UPDATE = `${BASE_URL}/profile/update`;

// ==========================================
// 4. Resume Section (Unified Array Structure)
// ==========================================
// [GET] Get full resume array (Skills, Education, Experience in order)
export const API_RESUME_GET = `${BASE_URL}/resume`;
// [POST] Update section order (Sends array of strings: ["Skills", "Education", "Experience"])
export const API_RESUME_REORDER = `${BASE_URL}/resume/reorder`;

// Education Endpoints
export const API_EDUCATION_GET = `${BASE_URL}/resume/education`;
export const API_EDUCATION_CREATE = `${BASE_URL}/resume/education`;
export const API_EDUCATION_UPDATE = `${BASE_URL}/resume/education`;
export const API_EDUCATION_DELETE = `${BASE_URL}/resume/education`;

// Experience Endpoints
export const API_EXPERIENCE_GET = `${BASE_URL}/resume/experience`;
export const API_EXPERIENCE_CREATE = `${BASE_URL}/resume/experience`;
export const API_EXPERIENCE_UPDATE = `${BASE_URL}/resume/experience`;
export const API_EXPERIENCE_DELETE = `${BASE_URL}/resume/experience`;

// Skills Endpoints
export const API_SKILLS_GET = `${BASE_URL}/resume/skills`;
export const API_SKILLS_CREATE = `${BASE_URL}/resume/skills`;
export const API_SKILLS_UPDATE = `${BASE_URL}/resume/skills`;
export const API_SKILLS_DELETE = `${BASE_URL}/resume/skills`;

// ==========================================
// 5. Portfolio Section
// ==========================================
// [GET] List all projects
export const API_PORTFOLIO_LIST = `${BASE_URL}/portfolio`;
// [POST] Add new project (FormData for Image)
export const API_PORTFOLIO_CREATE = `${BASE_URL}/portfolio`;
// [PUT] Update project
export const API_PORTFOLIO_UPDATE = (id) => `${BASE_URL}/portfolio/${id}`;
// [DELETE] Delete project
export const API_PORTFOLIO_DELETE = (id) => `${BASE_URL}/portfolio/${id}`;

// ==========================================
// 6. Blog Section
// ==========================================
// [GET] List all blog posts
export const API_BLOG_LIST = `${BASE_URL}/blog`;
// [POST] Create blog post (FormData for Thumbnail)
export const API_BLOG_CREATE = `${BASE_URL}/blog`;
// [PUT] Update blog post
export const API_BLOG_UPDATE = `${BASE_URL}/blog`;
// [DELETE] Delete blog post
export const API_BLOG_DELETE = `${BASE_URL}/blog`;

// ==========================================
// 7. Certificates & Team
// ==========================================
// [GET] List certificates
export const API_CERTIFICATES_LIST = `${BASE_URL}/certificates`;
// [POST] Add certificate
export const API_CERTIFICATES_CREATE = `${BASE_URL}/certificates`;
// [DELETE] Delete certificate
export const API_CERTIFICATES_DELETE = `${BASE_URL}/certificates`;

// ==========================================
// 7.5 Services Section
// ==========================================
// [GET] List services
export const API_SERVICES_LIST = `${BASE_URL}/services`;
// [POST] Add service
export const API_SERVICES_CREATE = `${BASE_URL}/services/store`;
// [PUT] Update service (Requires ID)
export const API_SERVICES_UPDATE = (id) => `${BASE_URL}/services/${id}`;
// [DELETE] Delete service (Requires ID)
export const API_SERVICES_DELETE = (id) => `${BASE_URL}/services/${id}`;

// [GET] List team
export const API_TEAM_LIST = `${BASE_URL}/team`; 
// [POST] Add team member
export const API_TEAM_CREATE = `${BASE_URL}/team` ;
// [DELETE] Delete team member
export const API_TEAM_DELETE = `${BASE_URL}/team`;

// ==========================================
// 8. Communication
// ==========================================
// [GET] List all contact messages
export const API_MESSAGES_LIST = `${BASE_URL}/messages`;
// [POST] Send a contact message (Public Site)