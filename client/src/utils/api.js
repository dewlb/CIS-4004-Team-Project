// API utility for making authenticated requests

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Get the authentication token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/tasks')
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise<any>} - Response data
 */
export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

/**
 * API methods for common operations
 */
export const api = {
  // Classes
  getClasses: () => apiRequest('/classes'),
  getClassGroups: (classId) => apiRequest(`/classes/${classId}/groups`),
  getStudentGroup: (classId) => apiRequest(`/classes/${classId}/student-group`),
  
  // Tasks
  getTasks: () => apiRequest('/tasks'),
  updateTaskStatus: (taskId, status) => 
    apiRequest(`/tasks/${taskId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  
  // Groups
  removeMemberFromGroup: (groupId, userId) =>
    apiRequest(`/groups/${groupId}/remove`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),
  
  // Badges
  getBadges: () => apiRequest('/badges/me'),
  checkBadges: () => apiRequest('/badges/check', { method: 'POST' }),
};

export default api;
