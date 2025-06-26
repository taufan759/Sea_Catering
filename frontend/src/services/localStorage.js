// services/localStorage.js
const storageService = {
  // Get auth data (token and user)
  getAuthData: () => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    
    return {
      token,
      user: user ? JSON.parse(user) : null
    };
  },

  // Set auth data
  setAuthData: (token, user) => {
    localStorage.setItem('accessToken', token);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  // Clear auth data
  clearAuthData: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  },

  // Generic methods
  setItem: (key, value) => {
    if (typeof value === 'object') {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.setItem(key, value);
    }
  },

  getItem: (key) => {
    const item = localStorage.getItem(key);
    
    // Try to parse JSON, if fails return as is
    try {
      return JSON.parse(item);
    } catch {
      return item;
    }
  },

  removeItem: (key) => {
    localStorage.removeItem(key);
  },

  clear: () => {
    localStorage.clear();
  }
};

export default storageService;