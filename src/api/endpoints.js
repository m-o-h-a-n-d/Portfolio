/* src/api/endpoints.js */

export const BASE_URL = "https://portfoliomo.up.railway.app/api";


// ==========================================
// Portfolio (Public) Endpoints
// ==========================================
export const PORTFOLIO_ENDPOINTS = {
  auth: {
    login: `${BASE_URL}/auth/login`,
    forgotPassword: `${BASE_URL}/auth/forgot-password`,
    verifyOtp: `${BASE_URL}/auth/verify-otp`,
    resetPassword: `${BASE_URL}/auth/reset-password`
  },
  contactUs: {
    store: `${BASE_URL}/contact-us/store`
  },
  profile: {
    get: `${BASE_URL}/user/data`
  },
  services: {
    list: `${BASE_URL}/service`
  },
  portfolio: {
    list: `${BASE_URL}/portfolio`,
    show: (id) => `${BASE_URL}/portfolio/show/${id}`
  },
  settings: {
    get: `${BASE_URL}/setting`
  },
  team: {
    list: `${BASE_URL}/team`
  },
  certificates: {
    list: `${BASE_URL}/certificate`
  },
  blog: {
    list: `${BASE_URL}/blog`
  },
  resume: {
    get: `${BASE_URL}/resume`
  },
  skills: {
    list: `${BASE_URL}/skill`
  },
  experience: {
    list: `${BASE_URL}/experience`
  },
  education: {
    list: `${BASE_URL}/education`
  }
};

// ==========================================
// Dashboard (Admin) Endpoints
// ==========================================
export const DASHBOARD_ENDPOINTS = {
  auth: {
    login: `${BASE_URL}/auth/login`,
    logout: `${BASE_URL}/admin/auth/logout`,
    forgotPassword: `${BASE_URL}/auth/forgot-password`,
    verifyOtp: `${BASE_URL}/auth/verify-otp`,
    resetPassword: `${BASE_URL}/auth/reset-password`
  },
  user: {
    list: `${BASE_URL}/admin/user`,
    update: `${BASE_URL}/admin/user/update`
  },
  education: {
    list: `${BASE_URL}/admin/education`,
    store: `${BASE_URL}/admin/education/store`,
    update: (id) => `${BASE_URL}/admin/education/update/${id}`,
    delete: (id) => `${BASE_URL}/admin/education/delete/${id}`
  },
  experience: {
    list: `${BASE_URL}/admin/experience`,
    store: `${BASE_URL}/admin/experience/store`,
    update: (id) => `${BASE_URL}/admin/experience/update/${id}`,
    delete: (id) => `${BASE_URL}/admin/experience/delete/${id}`
  },
  skills: {
    list: `${BASE_URL}/admin/skill`,
    store: `${BASE_URL}/admin/skill/store`,
    update: (id) => `${BASE_URL}/admin/skill/update/${id}`,
    delete: (id) => `${BASE_URL}/admin/skill/delete/${id}`
  },
  blog: {
    list: `${BASE_URL}/admin/blog`,
    store: `${BASE_URL}/admin/blog/store`,
    update: (id) => `${BASE_URL}/admin/blog/update/${id}`,
    delete: (id) => `${BASE_URL}/admin/blog/delete/${id}`
  },
  certification: {
    list: `${BASE_URL}/admin/certification`,
    store: `${BASE_URL}/admin/certification/store`,
    update: (id) => `${BASE_URL}/admin/certification/update/${id}`,
    delete: (id) => `${BASE_URL}/admin/certification/delete/${id}`
  },
  portfolio: {
    list: `${BASE_URL}/admin/portfolio`,
    store: `${BASE_URL}/admin/portfolio/store`,
    show: (id) => `${BASE_URL}/admin/portfolio/show/${id}`,
    update: (id) => `${BASE_URL}/admin/portfolio/update/${id}`,
    delete: (id) => `${BASE_URL}/admin/portfolio/delete/${id}`
  },
  settings: {
    list: `${BASE_URL}/admin/setting`,
    store: `${BASE_URL}/admin/setting/store`,
    update: `${BASE_URL}/admin/setting/update`
  },
  team: {
    list: `${BASE_URL}/admin/team`,
    store: `${BASE_URL}/admin/team/store`,
    update: (id) => `${BASE_URL}/admin/team/update/${id}`,
    delete: (id) => `${BASE_URL}/admin/team/delete/${id}`
  },
  services: {
    list: `${BASE_URL}/admin/service`,
    store: `${BASE_URL}/admin/service/store`,
    update: (id) => `${BASE_URL}/admin/service/update/${id}`,
    delete: (id) => `${BASE_URL}/admin/service/delete/${id}`
  },
  resume: {
    list: `${BASE_URL}/admin/resume`,
    reorder: `${BASE_URL}/admin/resume/reorder`
  },
  contactUs: {
    list: `${BASE_URL}/admin/contact-us`,
    read: (id) => `${BASE_URL}/admin/contact-us/read/${id}`,
    delete: (id) => `${BASE_URL}/admin/contact-us/delete/${id}`
  }
};
