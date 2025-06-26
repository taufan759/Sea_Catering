import express from 'express';
import { body } from 'express-validator';
import { authenticate, getUsers, register, refreshToken, logout } from '../controllers/UserController.js';
import { 
  getMealPlans, 
  getMealPlanById, 
  createMealPlan, 
  updateMealPlan, 
  deleteMealPlan 
} from '../controllers/MealPlanController.js';

// LEVEL 3: SUBSCRIPTION ROUTES - NOW ENABLED!
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

const router = express.Router();

// =================== AUTH ROUTES ===================
router.post('/auth/login', 
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
  ],
  authenticate
);

router.post('/auth/register', 
  [
    body('name').isLength({ min: 2, max: 100 }).trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
  ],
  register
);

router.post('/auth/refresh', refreshToken);
router.post('/auth/logout', logout);

// =================== USER ROUTES ===================
router.get('/users', verifyToken, authorize('admin', 'super_admin'), getUsers);

// =================== MEAL PLAN ROUTES ===================
// Public routes
router.get('/meal-plans', getMealPlans);
router.get('/meal-plans/:id', getMealPlanById);

// Admin only routes
router.post('/meal-plans', 
  verifyToken, 
  authorize('admin', 'super_admin'),
  [
    body('name').isLength({ min: 2, max: 100 }).trim().escape(),
    body('price').isNumeric().isFloat({ min: 0 }),
    body('description').isLength({ min: 10, max: 1000 }).trim().escape(),
    body('features').isLength({ min: 10 }).trim().escape(),
    body('icon').optional().isLength({ max: 10 })
  ],
  createMealPlan
);

router.put('/meal-plans/:id', 
  verifyToken, 
  authorize('admin', 'super_admin'),
  [
    body('name').optional().isLength({ min: 2, max: 100 }).trim().escape(),
    body('price').optional().isNumeric().isFloat({ min: 0 }),
    body('description').optional().isLength({ min: 10, max: 1000 }).trim().escape(),
    body('features').optional().isLength({ min: 10 }).trim().escape(),
    body('icon').optional().isLength({ max: 10 })
  ],
  updateMealPlan
);

router.delete('/meal-plans/:id', 
  verifyToken, 
  authorize('admin', 'super_admin'),
  deleteMealPlan
);

// =================== SUBSCRIPTION ROUTES - LEVEL 3 ENABLED! ===================

// User routes (authenticated users can create and manage their subscriptions)
router.post('/subscriptions', 
  verifyToken,
  [
    body('name').isLength({ min: 2, max: 100 }).trim().escape(),
    body('phoneNumber')
      .matches(/^(\+62|62|0)8[1-9][0-9]{6,9}$/)
      .withMessage('Please enter a valid Indonesian phone number'),
    body('planId').isInt({ min: 1 }).withMessage('Valid plan ID is required'),
    body('mealTypes')
      .isArray({ min: 1 })
      .withMessage('At least one meal type is required'),
    body('mealTypes.*')
      .isIn(['Breakfast', 'Lunch', 'Dinner'])
      .withMessage('Invalid meal type'),
    body('deliveryDays')
      .isArray({ min: 1 })
      .withMessage('At least one delivery day is required'),
    body('deliveryDays.*')
      .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
      .withMessage('Invalid delivery day'),
    body('allergies')
      .optional()
      .isLength({ max: 500 })
      .trim()
      .escape()
      .withMessage('Allergies description too long')
  ],
  createSubscription
);

// Get user's own subscriptions
router.get('/my-subscriptions', verifyToken, getUserSubscriptions);

// Get specific subscription (user can only see their own)
router.get('/subscriptions/:id', verifyToken, getSubscriptionById);

// Update subscription status (pause, resume, cancel)
router.put('/subscriptions/:id/status', 
  verifyToken,
  [
    body('status')
      .isIn(['active', 'paused', 'cancelled'])
      .withMessage('Status must be active, paused, or cancelled'),
    body('pausedStart')
      .optional()
      .isISO8601()
      .withMessage('Invalid pause start date'),
    body('pausedEnd')
      .optional()
      .isISO8601()
      .withMessage('Invalid pause end date')
  ],
  updateSubscriptionStatus
);

// =================== ADMIN SUBSCRIPTION ROUTES ===================
// Admin can see all subscriptions with filters and pagination
router.get('/admin/subscriptions', 
  verifyToken, 
  authorize('admin', 'super_admin'), 
  getAllSubscriptions
);

// Admin can see subscription statistics
router.get('/admin/subscriptions/stats', 
  verifyToken, 
  authorize('admin', 'super_admin'), 
  getSubscriptionStats
);

// =================== TESTIMONIAL ROUTES ===================
// Public routes
router.get('/testimonials', getTestimonials);

router.post('/testimonials', 
  [
    body('customerName').isLength({ min: 2, max: 100 }).trim().escape(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('reviewMessage').isLength({ min: 10, max: 1000 }).trim().escape()
  ],
  createTestimonial
);

// Admin routes
router.put('/testimonials/:id/approval', 
  verifyToken, 
  authorize('admin', 'super_admin'),
  [
    body('isApproved').isBoolean()
  ],
  updateTestimonialApproval
);

router.delete('/testimonials/:id', 
  verifyToken, 
  authorize('admin', 'super_admin'),
  deleteTestimonial
);

// =================== ADDITIONAL ADMIN ROUTES ===================
// Get dashboard statistics
router.get('/admin/dashboard/stats', 
  verifyToken, 
  authorize('admin', 'super_admin'),
  async (req, res) => {
    try {
      // Import models here to avoid circular dependency
      const { User, MealPlan, Subscription, Testimonial } = await import('../models/index.js');
      
      const stats = await Promise.all([
        User.count(),
        MealPlan.count({ where: { isActive: true } }),
        Subscription.count({ where: { status: 'active' } }),
        Testimonial.count({ where: { isApproved: true } })
      ]);

      res.json({
        totalUsers: stats[0],
        activeMealPlans: stats[1],
        activeSubscriptions: stats[2],
        approvedTestimonials: stats[3]
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
    }
  }
);

// =================== HEALTH CHECK ===================
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SEA Catering API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: {
      authentication: true,
      mealPlans: true,
      subscriptions: true, // NOW ENABLED!
      testimonials: true,
      adminPanel: true
    }
  });
});

// =================== 404 HANDLER ===================
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableEndpoints: [
      'GET /health',
      'POST /auth/login',
      'POST /auth/register',
      'GET /meal-plans',
      'GET /my-subscriptions',
      'POST /subscriptions',
      'GET /testimonials'
    ]
  });
});

export default router;