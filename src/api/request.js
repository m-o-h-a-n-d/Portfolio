/* src/api/request.js */
import { BASE_URL } from "./endpoints";

// ============================================================
// CONFIGURATION
// ============================================================
// Toggle this flag to switch between mock and real API
export const MOCK_MODE = true;

// ============================================================
// CONTACT US ENDPOINTS (REAL API TESTING)
// ============================================================
export const CONTACT_US_ENDPOINTS = {
  list: "/admin/contact-us",
  markRead: (id) => `/admin/contact-us/read/${id}`,
  delete: (id) => `/admin/contact-us/delete/${id}`,
  store: "/contact-us/store"
};

// Simulated network delay (300-800ms)
const simulateDelay = () =>
  new Promise((resolve) => setTimeout(resolve, Math.random() * 500 + 300));

// ============================================================
// MOCK DATA IMPORTS
// ============================================================
import profileData from "./mockData/profile.json";
import resumeOrderData from "./mockData/resume.json";
import educationData from "./mockData/education.json";
import experienceData from "./mockData/experience.json";
import skillsData from "./mockData/skills.json";
import portfolioData from "./mockData/portfolio.json";
import blogData from "./mockData/blog.json";
import messagesData from "./mockData/messages.json";
import servicesData from "./mockData/services.json";
import certificatesData from "./mockData/certificates.json";
import teamData from "./mockData/team.json";
import settingsData from "./mockData/settings.json";

// Mock data mapping
const mockDataMap = {
  "/user": profileData,
  "/education": educationData,
  "/experience": experienceData,
  "/skill": skillsData,
  "/resume": resumeOrderData,
  "/portfolio": portfolioData,
  "/blog": blogData,
  "/messages": messagesData,
  "/service": servicesData,
  "/certificate": certificatesData,
  "/team": teamData,
  "/setting": settingsData
};

// ============================================================
// AUTHENTICATION HELPERS
// ============================================================
export const getAuthToken = () => localStorage.getItem("auth_token");
export const setAuthToken = (token) =>
  localStorage.setItem("auth_token", token);
export const removeAuthToken = () => localStorage.removeItem("auth_token");
export const isAuthenticated = () => !!getAuthToken();

// ============================================================
// REAL API TESTING SPACE
// ============================================================
/**
 * Use this space to test specific real API endpoints even when MOCK_MODE is true.
 * Add endpoint strings or regex patterns to this array.
 */
const FORCE_REAL_API_ENDPOINTS = [
  // CONTACT_US_ENDPOINTS.list,
  // "/admin/contact-us/read",
  // "/admin/contact-us/delete",
  // CONTACT_US_ENDPOINTS.store, 
  // "/auth/login",
  // "/auth/forgot-password",
  // "/auth/verify-otp",
  // "/auth/reset-password",
  // "/admin/auth/logout",
  // "/user",
  // "/service",
  // "/portfolio",
  // "/setting",
  // "/team",
  // "/certificate",
  // "/blog",
  // "/resume",
  // "/skill",
  // "/experience",
  // "/education",
  // "/admin/user",
  // "/admin/user/update",
  // "/admin/education",
  // "/admin/experience",
  // "/admin/skill",
  // "/admin/blog",
  // "/admin/certification",
  // "/admin/portfolio",
  // "/admin/setting",
  // "/admin/team",
  // "/admin/service",
  // "/admin/resume",
  // "/admin/contact-us"

];

// ============================================================
// MAIN API FETCH WRAPPER
// ============================================================
export const apiFetch = async (endpoint, method = "GET", body = null) => {
  // 1. Determine if we should use Real API
  const shouldForceRealAPI = FORCE_REAL_API_ENDPOINTS.some((pattern) => {
    if (pattern instanceof RegExp) return pattern.test(endpoint);
    return endpoint.includes(pattern);
  });

  const useRealAPI = !MOCK_MODE || shouldForceRealAPI;

  // 2. Handle Mock Mode
  if (!useRealAPI) {
    await simulateDelay();

    // Mock Login Logic
    if (endpoint.includes("/auth/login")) {
      if (
        body?.email === "admin@example.com" &&
        body?.password === "password"
      ) {
        const mockToken = "mock_jwt_token_" + Date.now();
        setAuthToken(mockToken);
        return {
          success: true,
          token: mockToken,
          user: { id: 1, name: "Admin", email: "admin@example.com" }
        };
      }
      throw new Error("Invalid credentials");
    }

    // Mock GET Logic
    if (method === "GET") {
      for (const [path, data] of Object.entries(mockDataMap)) {
        if (endpoint.endsWith(path)) return { success: true, data };
      }
      // Fallback for ID-based GET
      if (endpoint.includes("/portfolio/")) {
        const id = parseInt(endpoint.split("/").pop());
        const project = portfolioData.projects.find((p) => p.id === id);
        return { success: true, data: project };
      }
      return { success: true, data: {} };
    }

    // Mock POST/PUT/DELETE Logic
    return {
      success: true,
      message: "Operation successful (Mock)",
      data: body
    };
  }

  // 3. Handle Real API Mode
  const fullUrl = endpoint.startsWith("https")
    ? endpoint
    : `${BASE_URL}${endpoint}`;
  const headers = {
    Accept: "application/json"
  };

  const token = getAuthToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const config = {
    method,
    headers,
    body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : null
  };

  try {
    const response = await fetch(fullUrl, config);

    const contentType = response.headers.get("content-type");
    const data = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    if (response.status === 401) {
      if (!endpoint.includes("/auth/login")) {
        removeAuthToken();
        const isAdminRoute =
          typeof window !== "undefined" &&
          window.location.pathname.startsWith("/admin");
        const isAdminEndpoint = endpoint.includes("/admin");
        if (isAdminRoute && isAdminEndpoint && typeof window !== "undefined") {
          window.location.href = "/admin/login";
        }
      }
      const authError = new Error(data?.message || data || "Session expired");
      authError.status = response.status;
      authError.data = data;
      throw authError;
    }

    if (!response.ok) {
      const apiError = new Error(data?.message || data || "API Error");
      apiError.status = response.status;
      apiError.data = data;
      throw apiError;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Convenience methods
export const apiGet = (endpoint) => apiFetch(endpoint, "GET");
export const apiPost = (endpoint, body) => apiFetch(endpoint, "POST", body);
export const apiPut = (endpoint, body) => apiFetch(endpoint, "PUT", body);
export const apiPatch = (endpoint, body) => apiFetch(endpoint, "PATCH", body);
export const apiDelete = (endpoint) => apiFetch(endpoint, "DELETE");
