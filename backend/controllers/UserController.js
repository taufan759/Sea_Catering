import User from '../models/UserModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

// XSS Prevention: HTML entity encoding
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential script tags
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Enhanced password validation for Level 4 requirements
const validatePasswordStrength = (password) => {
  const errors = [];
  
  // Minimum 8 characters
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // Must include uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must include at least one uppercase letter');
  }
  
  // Must include lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must include at least one lowercase letter');
  }
  
  // Must include number
  if (!/\d/.test(password)) {
    errors.push('Password must include at least one number');
  }
  
  // Must include special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must include at least one special character (!@#$%^&*)');
  }
  
  return errors;
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['userId', 'name', 'email', 'role', 'created_at'],
      order: [['created_at', 'DESC']]
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ message: error.message });
  }
}

export const authenticate = async (req, res) => {
  const { email, password } = req.body;

  // Input validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    // Sanitize email input
    const sanitizedEmail = sanitizeInput(email.toLowerCase());

    // Find user by email (using parameterized query via Sequelize - SQL injection safe)
    const user = await User.findOne({ where: { email: sanitizedEmail } });
    if (!user) {
      return res.status(404).json({ 
        message: "User not found",
        msg: "Email tidak terdaftar" 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        message: "Invalid credentials",
        msg: "Password salah" 
      });
    }

    // Prepare user data (don't include sensitive info)
    const userData = {
      userId: user.userId,
      name: sanitizeInput(user.name), // Sanitize output to prevent XSS
      email: user.email,
      role: user.role
    };

    // Generate tokens
    const accessToken = jwt.sign(userData, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '24h'  // Extended for development
    });
    
    const refreshToken = jwt.sign(userData, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: '7d'
    });

    // Set refresh token as httpOnly cookie (CSRF protection)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    // Return success response with user data
    res.status(200).json({ 
      message: 'Login successful',
      accessToken,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ 
      message: 'Server error during login',
      error: error.message 
    });
  }
}

export const register = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  // Input validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    // Sanitize inputs to prevent XSS
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email.toLowerCase());

    // Validate input completeness
    if (!sanitizedName || !sanitizedEmail || !password || !confirmPassword) {
      return res.status(400).json({ 
        message: "All fields are required",
        msg: "Semua field harus diisi" 
      });
    }

    // Enhanced password validation for Level 4
    const passwordErrors = validatePasswordStrength(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        message: "Password does not meet security requirements",
        msg: "Password tidak memenuhi persyaratan keamanan",
        errors: passwordErrors
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        message: "Passwords do not match",
        msg: "Password dan konfirmasi password tidak sama" 
      });
    }

    // Additional name validation
    if (sanitizedName.length < 2 || sanitizedName.length > 100) {
      return res.status(400).json({
        message: "Name must be between 2 and 100 characters",
        msg: "Nama harus antara 2-100 karakter"
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return res.status(400).json({
        message: "Invalid email format",
        msg: "Format email tidak valid"
      });
    }

    // Check if user already exists (SQL injection safe with Sequelize)
    const existingUser = await User.findOne({ where: { email: sanitizedEmail } });
    if (existingUser) {
      return res.status(400).json({ 
        message: "User already exists",
        msg: "Email sudah terdaftar" 
      });
    }

    // Hash password with higher salt rounds for better security
    const salt = await bcrypt.genSalt(14); // Increased from 12 for better security
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user (SQL injection safe with Sequelize parameterized queries)
    const newUser = await User.create({
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashedPassword,
      role: 'user', // Default role
    });

    // Return success (don't include password)
    const { password: userPassword, ...userWithoutPassword } = newUser.toJSON();
    
    // Sanitize output to prevent XSS
    userWithoutPassword.name = sanitizeInput(userWithoutPassword.name);
    
    res.status(201).json({
      message: 'User created successfully',
      msg: 'Pendaftaran berhasil',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Registration error:', error.message);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        message: "Email already exists",
        msg: "Email sudah terdaftar" 
      });
    }
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: "Validation error",
        msg: "Error validasi data",
        errors: error.errors.map(err => err.message)
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during registration',
      msg: 'Terjadi kesalahan server',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}

// Refresh token endpoint with CSRF protection
export const refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;
  
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token not found' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    // Sanitize user data
    const userData = {
      userId: decoded.userId,
      name: sanitizeInput(decoded.name),
      email: decoded.email,
      role: decoded.role
    };
    
    // Generate new access token
    const accessToken = jwt.sign(userData, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '24h'
    });

    res.status(200).json({ accessToken, user: userData });
  } catch (error) {
    res.status(403).json({ message: 'Invalid refresh token' });
  }
}

// Logout endpoint with proper cleanup
export const logout = async (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.status(200).json({ message: 'Logout successful' });
}

// Get current user profile (authenticated endpoint)
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findByPk(userId, {
      attributes: ['userId', 'name', 'email', 'role', 'created_at']
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Sanitize output
    const sanitizedUser = {
      ...user.toJSON(),
      name: sanitizeInput(user.name)
    };
    
    res.status(200).json(sanitizedUser);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
}

// Update user profile (authenticated endpoint)
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name } = req.body;
    
    // Validate and sanitize input
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    const sanitizedName = sanitizeInput(name);
    
    if (sanitizedName.length < 2 || sanitizedName.length > 100) {
      return res.status(400).json({ 
        message: 'Name must be between 2 and 100 characters' 
      });
    }
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await user.update({ name: sanitizedName });
    
    // Return sanitized user data
    const updatedUser = {
      userId: user.userId,
      name: sanitizeInput(user.name),
      email: user.email,
      role: user.role
    };
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
}

// Validation middleware for registration
export const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .escape(), // HTML entity encoding for XSS prevention
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .custom((password) => {
      const errors = validatePasswordStrength(password);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }
      return true;
    }),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
];

// Validation middleware for login
export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];