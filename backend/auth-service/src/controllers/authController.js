// backend/auth-service/src/controllers/authController.js

const db = require('../models');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// Utility to generate and send token
const signToken = (user) => {
  logger.debug('Generating JWT token for user', { userId: user.id, email: user.email });
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      role: user.role
    }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user);
  const isProduction = process.env.NODE_ENV === 'production';
  
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: isProduction, // Only require secure in production
    sameSite: isProduction ? 'none' : 'lax', // Use 'none' in production, 'lax' in development
    path: '/',
    domain: isProduction ? process.env.COOKIE_DOMAIN : undefined
  };

  logger.debug('Setting authentication cookie', { 
    cookieOptions,
    userId: user.id,
    email: user.email
  });

  // Set the cookie
  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  // Set CORS headers explicitly
  const origin = res.getHeader('Origin') || 'http://localhost:3000';
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', origin);

  logger.info('Authentication successful', {
    userId: user.id,
    email: user.email,
    statusCode,
    origin
  });

  res.status(statusCode).json({
    success: true,
    token,
    user,
  });
};

exports.register = async (req, res) => {
  try {
    logger.info('Registration attempt', { body: req.body });
    const { email, password, first_name, last_name, phone = '', address = '' } = req.body;

    // Basic validation
    if (!email || !password || !first_name || !last_name) {
      logger.warn('Registration failed - missing required fields', { 
        received: Object.keys(req.body).filter(key => req.body[key])
      });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['email', 'password', 'first_name', 'last_name'],
        received: Object.keys(req.body).filter(key => req.body[key])
      });
    }

    // Check if email already exists
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      logger.warn('Registration failed - email already in use', { email });
      return res.status(400).json({
        success: false,
        message: 'Email already in use',
        field: 'email'
      });
    }

    const newUser = await db.User.create({
      uuid: uuidv4(),
      email: email.trim().toLowerCase(),
      password,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      phone: phone ? phone.trim() : null,
      address: address ? address.trim() : null,
      role: 'customer'
    });

    logger.info('User registered successfully', { userId: newUser.id, email: newUser.email });
    createSendToken(newUser, 201, res);
  } catch (error) {
    logger.error('Registration error:', { error });
    
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => ({
        field: err.path,
        message: err.message,
        type: err.type,
        value: err.value
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

exports.login = async (req, res) => {
  try {
    logger.info('Login attempt', { email: req.body.email });
    const { email, password } = req.body;

    if (!email || !password) {
      logger.warn('Login failed - missing credentials');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await db.User.findOne({ where: { email } });

    if (!user) {
      logger.warn('Login failed - user not found', { email });
      return res.status(401).json({
        success: false,
        message: 'Incorrect email or password',
      });
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      logger.warn('Login failed - invalid password', { email });
      return res.status(401).json({
        success: false,
        message: 'Incorrect email or password',
      });
    }

    logger.info('Login successful', { userId: user.id, email: user.email });
    createSendToken(user, 200, res);
  } catch (error) {
    logger.error('Login error:', { error });
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

exports.logout = (req, res) => {
  logger.info('Logout request', { userId: req.user?.id });
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

exports.protect = async (req, res, next) => {
  let token;
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    logger.warn('Authentication failed - no token provided');
    return res.status(401).json({ 
      success: false, 
      message: 'You are not logged in! Please log in to get access.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    logger.debug('Token verified', { decoded });
    
    const currentUser = await db.User.findByPk(decoded.id);
    
    if (!currentUser) {
      logger.warn('Authentication failed - user not found', { userId: decoded.id });
      return res.status(401).json({ 
        success: false, 
        message: 'The user belonging to this token does no longer exist.' 
      });
    }

    req.user = currentUser;
    logger.debug('User authenticated', { userId: currentUser.id, email: currentUser.email });
    next();
  } catch (error) {
    logger.error('Token verification failed:', { error });
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

exports.getMe = (req, res) => {
  logger.debug('Get current user request', { userId: req.user.id });
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

exports.updateProfile = async (req, res) => {
  try {
    const { first_name, last_name, phone, address } = req.body;

    // Basic validation
    if (!first_name || !last_name) {
      return res.status(400).json({
        success: false,
        message: 'First name and last name are required',
      });
    }

    // Update user profile
    const updatedUser = await req.user.update({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      phone: phone ? phone.trim() : null,
      address: address ? address.trim() : null,
    });

    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => ({
        field: err.path,
        message: err.message,
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};