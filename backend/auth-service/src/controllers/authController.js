// backend/auth-service/src/controllers/authController.js

const { User } = require('../models');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Utility to generate and send token
const signToken = (user) => {
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
    secure: isProduction, // true in production, false in development
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    // Don't set domain in development to allow localhost to work
    ...(isProduction && { domain: 'your-production-domain.com' }) // Replace with your domain
  };

  // Set the cookie
  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user,
  });
};

exports.register = async (req, res) => {
  try {
    console.log('Registration request body:', req.body);
    const { email, password, first_name, last_name, phone = '', address = '' } = req.body;

    // Basic validation
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['email', 'password', 'first_name', 'last_name'],
        received: Object.keys(req.body).filter(key => req.body[key])
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use',
        field: 'email'
      });
    }

    const newUser = await User.create({
      uuid: uuidv4(),
      email: email.trim().toLowerCase(),
      password,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      phone: phone ? phone.trim() : null,
      address: address ? address.trim() : null,
      role: 'customer'
    });

    console.log('User created successfully:', newUser.uuid);
    createSendToken(newUser, 201, res);
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle Sequelize validation errors
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

    // Handle other errors
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('Login request body:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    console.log('Looking up user with email:', email);
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Incorrect email or password',
      });
    }

    console.log('Validating password for user:', email);
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({
        success: false,
        message: 'Incorrect email or password',
      });
    }

    console.log('Login successful for user:', email);
    createSendToken(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // expires in 10 seconds
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
    return res.status(401).json({ 
        success: false, 
        message: 'You are not logged in! Please log in to get access.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    // Find user by ID from the token
    const currentUser = await User.findByPk(decoded.id);
    
    if (!currentUser) {
      return res.status(401).json({ 
          success: false, 
          message: 'The user belonging to this token does no longer exist.' 
      });
    }

    // Attach the user to the request
    req.user = currentUser;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

exports.getMe = (req, res) => {
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