// utils/csrfUtils.js - CSRF Protection Utilities

/**
 * Get CSRF token from cookie
 */
export const getCSRFTokenFromCookie = () => {
  const name = 'csrfToken=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');
  
  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return null;
};

/**
 * Fetch CSRF token from server
 */
export const fetchCSRFToken = async (apiUrl) => {
  try {
    const response = await fetch(`${apiUrl}/csrf-token`, {
      method: 'GET',
      credentials: 'include', // Include cookies
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.csrfToken;
    }
    
    throw new Error('Failed to fetch CSRF token');
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    return null;
  }
};

/**
 * Get CSRF token (from cookie or fetch from server)
 */
export const getCSRFToken = async (apiUrl) => {
  // Try to get from cookie first
  let token = getCSRFTokenFromCookie();
  
  // If not in cookie, fetch from server
  if (!token) {
    token = await fetchCSRFToken(apiUrl);
  }
  
  return token;
};

/**
 * Enhanced fetch with CSRF protection
 */
export const fetchWithCSRF = async (url, options = {}) => {
  const apiUrl = url.includes('http') ? url.split('/').slice(0, 3).join('/') : 
    window.location.origin;
  
  // Skip CSRF for GET requests
  if (!options.method || options.method.toUpperCase() === 'GET') {
    return fetch(url, {
      ...options,
      credentials: 'include'
    });
  }
  
  // Get CSRF token for POST, PUT, DELETE requests
  const csrfToken = await getCSRFToken(apiUrl);
  
  if (!csrfToken) {
    throw new Error('CSRF token not available');
  }
  
  // Add CSRF token to headers
  const headers = {
    ...options.headers,
    'X-CSRF-Token': csrfToken
  };
  
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include' // Include cookies
  });
};

/**
 * XSS Prevention: Sanitize user input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Validate form inputs for security
 */
export const validateSecureInput = (input, type = 'text') => {
  const sanitized = sanitizeInput(input);
  
  switch (type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(sanitized);
    
    case 'phone':
      const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
      return phoneRegex.test(sanitized);
    
    case 'name':
      return sanitized.length >= 2 && sanitized.length <= 100;
    
    case 'password':
      // Level 4 requirements: min 8 chars, uppercase, lowercase, number, special char
      return sanitized.length >= 8 &&
             /[A-Z]/.test(sanitized) &&
             /[a-z]/.test(sanitized) &&
             /\d/.test(sanitized) &&
             /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(sanitized);
    
    default:
      return sanitized.length > 0;
  }
};

/**
 * Security test utilities for Level 4 compliance
 */
export const securityTests = {
  // Test XSS protection
  testXSS: async (apiUrl, testInput = '<script>alert("XSS Attack!")</script>') => {
    try {
      const response = await fetchWithCSRF(`${apiUrl}/security/xss-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ testInput })
      });
      
      const result = await response.json();
      console.log('XSS Test Result:', result);
      
      if (result.isSecure) {
        console.log('✅ XSS Protection: PASSED');
      } else {
        console.warn('❌ XSS Protection: FAILED');
      }
      
      return result.isSecure;
    } catch (error) {
      console.error('XSS Test Error:', error);
      return false;
    }
  },
  
  // Test SQL injection protection  
  testSQLInjection: async (apiUrl, testQuery = "'; DROP TABLE users; --") => {
    try {
      const response = await fetchWithCSRF(`${apiUrl}/security/sql-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ testQuery })
      });
      
      const result = await response.json();
      console.log('SQL Injection Test Result:', result);
      
      if (result.isSecure) {
        console.log('✅ SQL Injection Protection: PASSED');
      } else {
        console.warn('❌ SQL Injection Protection: FAILED');
      }
      
      return result.isSecure;
    } catch (error) {
      console.error('SQL Injection Test Error:', error);
      return false;
    }
  },
  
  // Test CSRF protection
  testCSRF: async (apiUrl) => {
    try {
      // Try to make a request without CSRF token
      const response = await fetch(`${apiUrl}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ test: 'csrf' })
      });
      
      if (response.status === 403) {
        console.log('✅ CSRF Protection: PASSED - Request blocked without token');
        return true;
      } else {
        console.warn('❌ CSRF Protection: FAILED - Request allowed without token');
        return false;
      }
    } catch (error) {
      console.error('CSRF Test Error:', error);
      return false;
    }
  },
  
  // Run all security tests
  runAllTests: async (apiUrl) => {
    console.log('🔒 Starting Security Tests for Level 4 Compliance...');
    
    const results = {
      xss: await securityTests.testXSS(apiUrl),
      sqlInjection: await securityTests.testSQLInjection(apiUrl),
      csrf: await securityTests.testCSRF(apiUrl)
    };
    
    const passed = Object.values(results).filter(Boolean).length;
    const total = Object.keys(results).length;
    
    console.log(`🔒 Security Tests Complete: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 All security tests passed! Level 4 compliance achieved.');
    } else {
      console.warn('⚠️ Some security tests failed. Review implementation.');
    }
    
    return results;
  }
};

export default {
  getCSRFToken,
  fetchWithCSRF,
  sanitizeInput,
  validateSecureInput,
  securityTests
};