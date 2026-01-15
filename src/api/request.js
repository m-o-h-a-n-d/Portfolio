// API Request Wrapper with Mock Data Support
// Toggle this flag to switch between mock and real API
export const MOCK_MODE = true;

// Import mock data
import profileData from './mockData/profile.json';
import resumeOrderData from './mockData/resume.json';
import educationData from './mockData/education.json';
import experienceData from './mockData/experience.json';
import skillsData from './mockData/skills.json';
import portfolioData from './mockData/portfolio.json';
import blogData from './mockData/blog.json';
import messagesData from './mockData/messages.json';
import servicesData from './mockData/services.json';
import certificatesData from './mockData/certificates.json';
import teamData from './mockData/team.json';
import settingsData from './mockData/settings.json';

// Mock data mapping
const mockDataMap = {
  '/profile': profileData,
  '/resume/education': educationData,
  '/resume/experience': experienceData,
  '/resume/skills': skillsData,
  '/resume': resumeOrderData,
  '/portfolio': portfolioData,
  '/blog': blogData,
  '/messages': messagesData,
  '/services': servicesData,
  '/certificates': certificatesData,
  '/team': teamData,
  '/settings': settingsData,
};

// Simulated network delay (300-800ms)
const simulateDelay = () => new Promise(resolve => 
  setTimeout(resolve, Math.random() * 500 + 300)
);

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Set auth token in localStorage
export const setAuthToken = (token) => {
  localStorage.setItem('auth_token', token);
};

// Remove auth token from localStorage
export const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Main API Fetch Wrapper
 * @param {string} endpoint - API endpoint (e.g., '/profile', '/resume')
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object|FormData} body - Request body
 * @returns {Promise} - Response data
 */
// List of endpoints (as strings or regex) that should ALWAYS use Real API even if MOCK_MODE is true
const REAL_API_ENDPOINTS = [
  // '/services',
  // '/services/store',
  // /\/services\/\d+/, // Matches /services/{id} for PUT and DELETE
];

import { BASE_URL } from './endpoints';

export const apiFetch = async (endpoint, method = 'GET', body = null, isFile = false) => {
  // Check if this specific endpoint should use Real API
  const shouldForceRealAPI = REAL_API_ENDPOINTS.some(pattern => {
    if (pattern instanceof RegExp) {
      return pattern.test(endpoint);
    }
    return endpoint.endsWith(pattern);
  });

  // Construct full URL for Real API
  const fullUrl = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  // Mock Mode Logic
  if (MOCK_MODE && !shouldForceRealAPI) {
    await simulateDelay();
    
    // Handle authentication
    if (endpoint.includes('/auth/login')) {
      const credentials = body;
      // Mock login validation
      if (credentials?.email === 'admin@example.com' && credentials?.password === 'password') {
        const mockToken = 'mock_jwt_token_' + Date.now();
        setAuthToken(mockToken);
        return {
          success: true,
          token: mockToken,
          user: {
            id: 1,
            name: 'Richard Hanrick',
            email: 'admin@example.com',
            role: 'admin'
          }
        };
      } else {
        throw new Error('Invalid credentials');
      }
    }

    if (endpoint.includes('/auth/logout')) {
      removeAuthToken();
      return { success: true };
    }

    // Handle GET requests
    if (method === 'GET') {
      // Find matching mock data
      for (const [path, data] of Object.entries(mockDataMap)) {
        if (endpoint.endsWith(path)) {
          return { success: true, data };
        }
      }
      
      // Fallback for endpoints with IDs
      if (endpoint.includes('/portfolio/')) {
        const id = parseInt(endpoint.split('/').pop());
        const project = portfolioData.projects.find(p => p.id === id);
        return { success: true, data: project };
      }
      if (endpoint.endsWith('/resume/education')) return { success: true, data: educationData };
      if (endpoint.endsWith('/resume/experience')) return { success: true, data: experienceData };
      if (endpoint.endsWith('/resume/skills')) return { success: true, data: skillsData };
      if (endpoint.includes('/resume/education/')) return { success: true, data: educationData[0] };
      if (endpoint.includes('/resume/experience/')) return { success: true, data: experienceData[0] };
      if (endpoint.includes('/resume/skills/')) return { success: true, data: skillsData[0] };

      throw new Error('Endpoint not found: ' + endpoint);
    }

    // Handle POST/PUT requests (Create/Update)
    if (method === 'POST' || method === 'PUT') {
      console.log(`[Mock API] ${method} to ${endpoint}:`, body);
      return { 
        success: true, 
        message: 'Operation completed successfully',
        data: body 
      };
    }

    // Handle DELETE requests
    if (method === 'DELETE') {
      console.log(`[Mock API] DELETE ${endpoint}`);
      return { success: true, message: 'Item deleted successfully' };
    }

    throw new Error('Unknown request method');
  }

  // Real API Mode
  const headers = {
    'Accept': 'application/json',
  };

  // Add auth token if available
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser will set it with boundary)
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  try {
    console.log(`[API Request] ${method} ${fullUrl}`, config);
    const response = await fetch(fullUrl, config);
    console.log(`[API Response] Status: ${response.status}`);
    
    // Handle unauthorized response
    if (response.status === 401) {
      removeAuthToken();
      window.location.href = '/admin/login';
      throw new Error('Session expired. Please login again.');
    }

    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    console.log(`[API Data]`, data);

    if (!response.ok) {
      const errorMessage = (data && typeof data === 'object' && data.message) 
        ? data.message 
        : (typeof data === 'string' ? data : 'Something went wrong');
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('Detailed API Error:', error);
    throw error;
  }
};

// Convenience methods
export const apiGet = (endpoint) => apiFetch(endpoint, 'GET');
export const apiPost = (endpoint, body) => apiFetch(endpoint, 'POST', body);
export const apiPut = (endpoint, body) => apiFetch(endpoint, 'PUT', body);
export const apiDelete = (endpoint) => apiFetch(endpoint, 'DELETE');

// File upload helper
export const apiUpload = async (endpoint, file, fieldName = 'file') => {
  const formData = new FormData();
  formData.append(fieldName, file);
  return apiFetch(endpoint, 'POST', formData);
};
