import User from '../models/UserModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['userId', 'name', 'email', 'role'],
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ message: error.message });
  }
}

export const authenticate = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ where: { email } });
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

    // Prepare user data
    const userData = {
      userId: user.userId,
      name: user.name,
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

    // Set refresh token as httpOnly cookie
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

  try {
    // Validate input
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        message: "All fields are required",
        msg: "Semua field harus diisi" 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        message: "Passwords do not match",
        msg: "Password dan konfirmasi password tidak sama" 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters",
        msg: "Password minimal 6 karakter" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        message: "User already exists",
        msg: "Email sudah terdaftar" 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'user', // Default role
    });

    // Return success (don't include password)
    const { password: userPassword, ...userWithoutPassword } = newUser.toJSON();
    
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
    
    res.status(500).json({ 
      message: 'Server error during registration',
      msg: 'Terjadi kesalahan server',
      error: error.message 
    });
  }
}

// Refresh token endpoint
export const refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;
  
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token not found' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    // Generate new access token
    const accessToken = jwt.sign({
      userId: decoded.userId,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role
    }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '24h'
    });

    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(403).json({ message: 'Invalid refresh token' });
  }
}

// Logout endpoint
export const logout = async (req, res) => {
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logout successful' });
}