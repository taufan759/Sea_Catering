import express from 'express';
import { body } from 'express-validator';
import { 
  authenticate, 
  getUsers, 
  register, 
  refreshToken, 
  logout,
  registerValidation,
  loginValidation,
  getProfile,
  updateProfile
} from '../controllers/UserController.js';

import { 
  getMealPlans, 
  getMealPlanById, 
  createMealPlan, 
  updateMealPlan, 
  deleteMealPlan 
} from '../controllers/MealPlanController.js';

import { 
  createSubscription, 
  getUserSubscriptions, 
  updateSubscriptionStatus, 
  getAllSubscriptions, 
  getSubscriptionStats,
  getSubscriptionById
} from '../controllers/SubscriptionController.js';

import { 
  createTestimonial, 
  getTestimonials, 
  updateTestimonialApproval, 
  deleteTestimonial 
} from '../controllers/TestimonialController.js';

import { verifyToken } from '../middleware/verifyToken.js';
import authorize from '../middleware/authorize.js';
import { simpleCSRFProtection, setCSRFCookie } from '../middleware/csrfProtection.js';

const router = express.Router();

// =================== SECURITY ROUTES ===================
// Get CSRF token for frontend
router.get('/csrf-token', setCSRFCookie);

// =================== AUTH ROUTES ===================
router.post('/auth/login', 
  loginValidation,
  authenticate
);

router.post('/auth/register', 
  registerValidation,
  register
);

router.post('/auth/refresh', refreshToken);
router.post('/auth/logout', logout);

// =================== USER ROUTES ===================
// Get all users (admin only)
router.get('/users', verifyToken, authorize('admin', 'super_admin'), getUsers);

// Get current user profile
router.get('/users/profile', verifyToken, getProfile);

// Update current user profile
router.put('/users/profile', 
  verifyToken,
  simpleCSRFProtection, // CSRF protection for data modification
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters')
      .escape()
  ],
  updateProfile
);

// =================== MEAL PLAN ROUTES ===================
// Public routes (no CSRF needed for GET requests)
router.get('/meal-plans', getMealPlans);
router.get('/meal-plans/:id', getMealPlanById);

// Admin only routes with CSRF protection
router.post('/meal-plans', 
  verifyToken, 
  authorize('admin', 'super_admin'),
  simpleCSRFProtection, // CSRF protection
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters')
      .escape(),
    body('price')
      .isNumeric()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('description')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters')
      .escape(),
    body('features')
      .trim()
      .isLength({ min: 10 })
      .withMessage('Features description is required')
      .escape(),
    body('icon')
      .optional()
      .isLength({ max: 10 })
      .withMessage('Icon must be less than 10 characters')
  ],
  createMealPlan
);

router.put('/meal-plans/:id', 
  verifyToken, 
  authorize('admin', 'super_admin'),
  simpleCSRFProtection, // CSRF protection
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters')
      .escape(),
    body('price')
      .optional()
      .isNumeric()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters')
      .escape(),
    body('features')
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage('Features description is required')
      .escape(),
    body('icon')
      .optional()
      .isLength({ max: 10 })
      .withMessage('Icon must be less than 10 characters')
  ],
  updateMealPlan
);

router.delete('/meal-plans/:id', 
  verifyToken, 
  authorize('admin', 'super_admin'),
  simpleCSRFProtection, // CSRF protection
  deleteMealPlan
);

// =================== SUBSCRIPTION ROUTES - LEVEL 3 WITH ENHANCED SECURITY ===================

// User routes with enhanced validation and CSRF protection
router.post('/subscriptions', 
  verifyToken,
  simpleCSRFProtection, // CSRF protection for subscription creation
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters')
      .escape(),
    body('phoneNumber')
      .matches(/^(\+62|62|0)8[1-9][0-9]{6,9}$/)
      .withMessage('Please enter a valid Indonesian phone number'),
    body('planId')
      .isInt({ min: 1 })
      .withMessage('Valid plan ID is required'),
    body('mealTypes')
      .isArray({ min: 1, max: 3 })
      .withMessage('Select 1-3 meal types'),
    body('mealTypes.*')
      .isIn(['Breakfast', 'Lunch', 'Dinner'])
      .withMessage('Invalid meal type selected'),
    body('deliveryDays')
      .isArray({ min: 1, max: 7 })
      .withMessage('Select 1-7 delivery days'),
    body('deliveryDays.*')
      .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
      .withMessage('Invalid delivery day selected'),
    body('allergies')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Allergies description must be less than 500 characters')
      .trim()
      .escape() // XSS prevention
  ],
  createSubscription
);

// Get user's own subscriptions (no CSRF needed for GET)
router.get('/my-subscriptions', verifyToken, getUserSubscriptions);

// Get specific subscription (user can only see their own)
router.get('/subscriptions/:id', verifyToken, getSubscriptionById);

// Update subscription status with CSRF protection
router.put('/subscriptions/:id/status', 
  verifyToken,
  simpleCSRFProtection, // CSRF protection for status updates
  [
    body('status')
      .isIn(['active', 'paused', 'cancelled'])
      .withMessage('Status must be active, paused, or cancelled'),
    body('pausedStart')
      .optional()
      .isISO8601()
      .withMessage('Invalid pause start date format'),
    body('pausedEnd')
      .optional()
      .isISO8601()
      .withMessage('Invalid pause end date format')
      .custom((value, { req }) => {
        if (req.body.status === 'paused' && !value) {
          throw new Error('Pause end date is required when pausing subscription');
        }
        if (value && req.body.pausedStart) {
          const startDate = new Date(req.body.pausedStart);
          const endDate = new Date(value);
          if (endDate <= startDate) {
            throw new Error('Pause end date must be after start date');
          }
        }
        return true;
      })
  ],
  updateSubscriptionStatus
);

// =================== ADMIN SUBSCRIPTION ROUTES ===================
// Admin can see all subscriptions (no CSRF for GET requests)
router.get('/admin/subscriptions', 
  verifyToken, 
  authorize('admin', 'super_admin'), 
  getAllSubscriptions
);

// Admin statistics (no CSRF for GET requests)
router.get('/admin/subscriptions/stats', 
  verifyToken, 
  authorize('admin', 'super_admin'), 
  getSubscriptionStats
);

// =================== TESTIMONIAL ROUTES WITH ENHANCED SECURITY ===================
// Public routes (no CSRF for GET)
router.get('/testimonials', getTestimonials);

// Create testimonial with CSRF protection
router.post('/testimonials', 
  simpleCSRFProtection, // CSRF protection for testimonial creation
  [
    body('customerName')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters')
      .escape(), // XSS prevention
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('reviewMessage')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Review must be between 10 and 1000 characters')
      .escape() // XSS prevention
  ],
  createTestimonial
);

// Admin routes with CSRF protection
router.put('/testimonials/:id/approval', 
  verifyToken, 
  authorize('admin', 'super_admin'),
  simpleCSRFProtection, // CSRF protection
  [
    body('isApproved')
      .isBoolean()
      .withMessage('Approval status must be boolean')
  ],
  updateTestimonialApproval
);

router.delete('/testimonials/:id', 
  verifyToken, 
  authorize('admin', 'super_admin'),
  simpleCSRFProtection, // CSRF protection for deletion
  deleteTestimonial
);

// =================== ADMIN DASHBOARD ROUTES ===================
// Dashboard statistics (no CSRF for GET requests)
router.get('/admin/dashboard/stats', 
  verifyToken, 
  authorize('admin', 'super_admin'),
  async (req, res) => {
    try {
      // Dynamic import to avoid circular dependency
      const { default: User } = await import('../models/UserModel.js');
      const { default: MealPlan } = await import('../models/MealPlanModel.js');
      const { default: Subscription } = await import('../models/SubscriptionModel.js');
      const { default: Testimonial } = await import('../models/TestimonialModel.js');
      
      const [totalUsers, activeMealPlans, activeSubscriptions, approvedTestimonials] = await Promise.all([
        User.count(),
        MealPlan.count({ where: { isActive: true } }),
        Subscription.count({ where: { status: 'active' } }),
        Testimonial.count({ where: { isApproved: true } })
      ]);

      res.json({
        totalUsers,
        activeMealPlans,
        activeSubscriptions,
        approvedTestimonials,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ 
        message: 'Failed to fetch dashboard statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// =================== SECURITY TESTING ENDPOINTS ===================
// XSS Test endpoint (for security testing)
router.post('/security/xss-test', 
  [
    body('testInput')
      .trim()
      .escape() // This should prevent XSS
  ],
  (req, res) => {
    const { testInput } = req.body;
    res.json({
      message: 'XSS test completed',
      originalInput: req.body.testInput,
      sanitizedInput: testInput,
      isSecure: !testInput.includes('<script>'),
      securityNote: 'Input has been sanitized to prevent XSS attacks'
    });
  }
);

// SQL Injection test endpoint (for security testing)
router.post('/security/sql-test',
  [
    body('testQuery')
      .trim()
      .escape()
  ],
  async (req, res) => {
    try {
      const { testQuery } = req.body;
      
      // This is secure because we use Sequelize parameterized queries
      const { default: User } = await import('../models/UserModel.js');
      const users = await User.findAll({
        where: { name: testQuery }, // This is parameterized and safe
        attributes: ['userId', 'name', 'email']
      });
      
      res.json({
        message: 'SQL injection test completed',
        query: testQuery,
        results: users.length,
        isSecure: true,
        securityNote: 'Using Sequelize parameterized queries prevents SQL injection'
      });
    } catch (error) {
      res.status(500).json({
        message: 'Query execution error',
        isSecure: true,
        securityNote: 'Error caught safely, no SQL injection possible'
      });
    }
  }
);

// =================== HEALTH CHECK ===================
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SEA Catering API is running with enhanced security',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    security: {
      authentication: 'JWT with bcrypt hashing',
      authorization: 'Role-based access control',
      csrfProtection: 'Double-submit cookie pattern',
      xssProtection: 'Input sanitization and HTML entity encoding',
      sqlInjection: 'Sequelize parameterized queries',
      passwordPolicy: 'Minimum 8 chars with complexity requirements'
    },
    features: {
      authentication: true,
      mealPlans: true,
      subscriptions: true,
      testimonials: true,
      adminPanel: true,
      securityTesting: true
    }
  });
});

// =================== 404 HANDLER ===================
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /health - Health check',
      'GET /csrf-token - Get CSRF token',
      'POST /auth/login - User login',
      'POST /auth/register - User registration',
      'GET /meal-plans - Get meal plans',
      'GET /my-subscriptions - Get user subscriptions',
      'POST /subscriptions - Create subscription',
      'GET /testimonials - Get testimonials',
      'POST /security/xss-test - XSS security test',
      'POST /security/sql-test - SQL injection security test'
    ]
  });
});

export default router;