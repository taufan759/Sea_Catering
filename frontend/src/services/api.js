const API_URL = 'http://localhost:5000/api';

// Fungsi helper untuk melakukan fetch request dengan auth headers otomatis
const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('accessToken');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
  };
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...defaultOptions,
      ...options,
    });
    
    // Handle unauthorized responses
    if (response.status === 401 || response.status === 403) {
      // Token might be expired or invalid
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.msg || 'Terjadi kesalahan pada server');
    }
    
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth Services
export const authService = {
  login: async (credentials) => {
    // Login doesn't need auth header
    const response = await fetch(`${API_URL}/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Login failed');
    }
    
    return response.json();
  },
  
  register: async (userData) => {
    // Register doesn't need auth header
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Registration failed');
    }
    
    return response.json();
  },
  
  logout: () => {
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  },
  
  getCurrentUser: () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    
    try {
      // Decode JWT to get user info
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  },
};

// Transaction Services
export const transactionService = {
  getAll: (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return fetchWithAuth(`/transactions?${queryParams}`);
  },
  
  create: (transaction) => {
    return fetchWithAuth('/transactions/add', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  },
  
  update: (id, transaction) => {
    return fetchWithAuth(`/transactions/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    });
  },
  
  delete: (id) => {
    return fetchWithAuth(`/transactions/delete/${id}`, {
      method: 'DELETE',
    });
  },
  
  getSummary: () => {
    return fetchWithAuth('/transactions/summary');
  },
};

// Financial Goals Services
export const goalService = {
  getAll: () => {
    return fetchWithAuth('/goals');
  },
  
  create: (goal) => {
    return fetchWithAuth('/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    });
  },
  
  update: (id, goal) => {
    return fetchWithAuth(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(goal),
    });
  },
  
  delete: (id) => {
    return fetchWithAuth(`/goals/${id}`, {
      method: 'DELETE',
    });
  },
};

// Investment Services
export const investmentService = {
  getPortfolio: () => {
    return fetchWithAuth('/investments/portfolio');
  },
  
  getRecommendations: (riskProfile) => {
    return fetchWithAuth(`/investments/recommendations?riskProfile=${riskProfile}`);
  },
  
  getRiskProfile: () => {
    return fetchWithAuth('/investments/risk-profile');
  },
  
  updateRiskProfile: (answers) => {
    return fetchWithAuth('/investments/risk-profile', {
      method: 'POST',
      body: JSON.stringify(answers),
    });
  },
};

// Article Services
export const articleService = {
  getAll: (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return fetchWithAuth(`/articles?${queryParams}`);
  },
  
  getById: (id) => {
    return fetchWithAuth(`/articles/${id}`);
  },
};

// User Services
export const userService = {
  getAll: () => {
    return fetchWithAuth('/users');
  },
  
  getProfile: () => {
    return fetchWithAuth('/users/profile');
  },
  
  updateProfile: (userData) => {
    return fetchWithAuth('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
};

export default {
  authService,
  transactionService,
  goalService,
  investmentService,
  articleService,
  userService,
};