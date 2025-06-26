// AppSettings.js
const AppSettings = {
  // API URL
  api: 'http://localhost:3000', 
  
  // App configuration
  appName: 'SEA Catering',
  appFullName: 'SEA Catering - Healthy Meals Service',
  tagline: 'Healthy Meals, Anytime, Anywhere',
  version: '1.0.0',
  
  // Business info
  business: {
    manager: 'Brian',
    phone: '08123456789',
    email: 'hello@seacatering.id',
    address: 'Indonesia',
    coverage: 'Major Cities in Indonesia',
    workingHours: '7:00 AM - 10:00 PM',
    deliveryHours: '6:00 AM - 11:00 AM'
  },
  
  // Feature flags - LEVEL 3 ENABLED!
  features: {
    enableNotifications: true,
    enableMealPlans: true,
    enableSubscriptions: true, 
    enableTestimonials: true,
    enableDeliveryTracking: false, 
    enablePaymentGateway: false, 
    enableAdminDashboard: true, 
    enableUserDashboard: true, 
  },
  
  // Token configuration
  tokenKey: 'accessToken',
  tokenExpiry: 3600, // 1 hour in seconds
  refreshTokenExpiry: 604800, // 7 days in seconds
  
  // Default values
  defaults: {
    currency: 'IDR',
    language: 'id',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    pagination: {
      limit: 20,
      maxLimit: 100
    }
  },
  
  // Meal plan types (matching backend seeder data)
  mealPlans: {
    diet: {
      name: 'Diet Plan',
      icon: '🥗',
      basePrice: 30000,
      calories: '1200-1500',
      description: 'Perfect for weight management'
    },
    protein: {
      name: 'Protein Plan', 
      icon: '💪',
      basePrice: 40000,
      calories: '1800-2200',
      description: 'High-protein for active individuals'
    },
    royal: {
      name: 'Royal Plan',
      icon: '👑', 
      basePrice: 60000,
      calories: '2000-2500',
      description: 'Premium gourmet experience'
    }
  },

  // Subscription settings - LEVEL 3
  subscription: {
    maxActiveSubscriptions: 3,
    mealTypes: ['Breakfast', 'Lunch', 'Dinner'],
    deliveryDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    statuses: ['active', 'paused', 'cancelled'],
    weeksPerMonth: 4.3, // For pricing calculation
    minPauseDuration: 1, // days
    maxPauseDuration: 30, // days
  },

  // Validation rules
  validation: {
    name: {
      minLength: 2,
      maxLength: 100
    },
    phoneNumber: {
      pattern: /^(\+62|62|0)8[1-9][0-9]{6,9}$/,
      message: 'Please enter a valid Indonesian phone number'
    },
    password: {
      minLength: 6,
      requireSpecialChar: false
    },
    allergies: {
      maxLength: 500
    }
  },

  // User roles
  roles: {
    user: {
      name: 'Customer',
      permissions: ['view_meal_plans', 'create_subscription', 'manage_own_subscription']
    },
    admin: {
      name: 'Admin',
      permissions: ['manage_meal_plans', 'manage_subscriptions', 'manage_testimonials', 'view_analytics']
    },
    super_admin: {
      name: 'Super Admin', 
      permissions: ['manage_users', 'manage_meal_plans', 'manage_subscriptions', 'manage_testimonials', 'view_analytics', 'system_settings']
    }
  },

  // UI Configuration
  ui: {
    theme: {
      primary: '#3B82F6', // Blue
      secondary: '#10B981', // Green
      accent: '#F59E0B', // Yellow
      danger: '#EF4444', // Red
      success: '#10B981', // Green
      warning: '#F59E0B', // Yellow
    },
    animations: {
      enableLoadingScreen: true,
      loadingDuration: 2000,
      transitionDuration: 300
    }
  },

  // API endpoints - LEVEL 3 COMPLETE
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      refresh: '/auth/refresh',
      logout: '/auth/logout'
    },
    mealPlans: {
      list: '/meal-plans',
      detail: '/meal-plans/:id',
      create: '/meal-plans',
      update: '/meal-plans/:id',
      delete: '/meal-plans/:id'
    },
    subscriptions: {
      create: '/subscriptions',
      list: '/my-subscriptions',
      detail: '/subscriptions/:id',
      updateStatus: '/subscriptions/:id/status',
      adminList: '/admin/subscriptions',
      adminStats: '/admin/subscriptions/stats'
    },
    testimonials: {
      list: '/testimonials',
      create: '/testimonials',
      approve: '/testimonials/:id/approval',
      delete: '/testimonials/:id'
    },
    users: {
      list: '/users'
    },
    admin: {
      dashboardStats: '/admin/dashboard/stats'
    },
    health: '/health'
  },

  // Error messages
  errors: {
    network: 'Network error. Please check your connection.',
    unauthorized: 'Please login to continue.',
    forbidden: 'You do not have permission to perform this action.',
    notFound: 'The requested resource was not found.',
    validation: 'Please check your input and try again.',
    server: 'Server error. Please try again later.'
  },

  // Success messages
  messages: {
    subscriptionCreated: 'Subscription created successfully!',
    subscriptionUpdated: 'Subscription updated successfully!',
    loginSuccess: 'Welcome back!',
    registerSuccess: 'Account created successfully!',
    logoutSuccess: 'Logged out successfully!'
  }
};

export default AppSettings;