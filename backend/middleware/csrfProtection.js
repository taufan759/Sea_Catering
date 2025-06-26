// middleware/csrfProtection.js
import crypto from 'crypto';

// Generate CSRF token
export const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// CSRF token verification middleware
export const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET requests and certain endpoints
  if (req.method === 'GET' || req.path === '/health' || req.path.startsWith('/auth/')) {
    return next();
  }

  const sessionToken = req.session?.csrfToken;
  const headerToken = req.headers['x-csrf-token'];
  const bodyToken = req.body.csrfToken;

  const providedToken = headerToken || bodyToken;

  if (!sessionToken || !providedToken || sessionToken !== providedToken) {
    return res.status(403).json({
      error: 'CSRF token missing or invalid',
      message: 'Cross-Site Request Forgery protection triggered'
    });
  }

  next();
};

// Endpoint to get CSRF token
export const getCSRFToken = (req, res) => {
  if (!req.session) {
    return res.status(500).json({ 
      error: 'Session not initialized' 
    });
  }

  const token = generateCSRFToken();
  req.session.csrfToken = token;

  res.json({ 
    csrfToken: token,
    message: 'CSRF token generated successfully'
  });
};

// Alternative simpler CSRF protection for APIs without sessions
export const simpleCSRFProtection = (req, res, next) => {
  // For APIs, we can use double-submit cookies pattern
  const headerToken = req.headers['x-csrf-token'];
  const cookieToken = req.cookies.csrfToken;

  // Skip for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip for auth endpoints (they have their own protection)
  if (req.path.startsWith('/auth/') || req.path === '/health') {
    return next();
  }

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return res.status(403).json({
      error: 'CSRF protection failed',
      message: 'Invalid or missing CSRF token'
    });
  }

  next();
};

// Set CSRF cookie endpoint
export const setCSRFCookie = (req, res) => {
  const token = generateCSRFToken();
  
  res.cookie('csrfToken', token, {
    httpOnly: false, // Must be accessible to JavaScript
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });

  res.json({ 
    csrfToken: token,
    message: 'CSRF token set in cookie'
  });
};