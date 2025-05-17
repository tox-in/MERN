const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { ValidationError } = require('../utils/errorClasses');

// Constants
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

/**
 * Hash a password
 * @param {string} password - The password to hash
 * @returns {Promise<string>} - The hashed password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare a password with a hashed password
 * @param {string} password - The password to compare
 * @param {string} hashedPassword - The hashed password
 * @returns {Promise<boolean>} - True if the passwords match, false otherwise
 */
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Generate a JWT access token
 * @param {Object} payload - The payload to sign
 * @returns {string} - The JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: 'HS256',
  });
};

/**
 * Generate a JWT refresh token
 * @param {string} userId - The user ID to sign
 * @returns {string} - The refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: '7d',
    algorithm: 'HS256',
  });
};

/**
 * Verify refresh token
 * @param {string} refreshToken - Refresh token
 * @returns {string|null} - User ID if valid, null otherwise
 */
const verifyRefreshToken = (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    return decoded.id;
  } catch (err) {
    return null;
  }
};

/**
 * Register a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} - The created user
 * @throws {ValidationError} - If email, phone, or national ID already exists
 */
const registerUser = async (userData) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: userData.email },
        { phone: userData.phone },
        { national_id: userData.national_id },
      ],
    },
  });

  if (existingUser) {
    if (existingUser.email === userData.email) {
      throw new ValidationError('Email already in use');
    } else if (existingUser.phone === userData.phone) {
      throw new ValidationError('Phone number already in use');
    } else if (existingUser.national_id === userData.national_id) {
      throw new ValidationError('National ID already in use');
    }
  }

  const hashedPassword = await hashPassword(userData.password);

  const user = await prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
    },
    select: {
      id: true,
      owner_name: true,
      national_id: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
};

/**
 * Login a user
 * @param {Object} credentials - User login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} - The logged-in user, token, and refresh token
 * @throws {ValidationError} - If email or password is invalid
 */
const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ValidationError('Invalid email or password');
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new ValidationError('Invalid email or password');
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken(user.id);

  return {
    user: {
      id: user.id,
      owner_name: user.owner_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    token,
    refreshToken,
  };
};

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - The refresh token
 * @returns {Promise<Object>} - The new token and new refresh token
 * @throws {ValidationError} - If refresh token is invalid or user not found
 */
const refreshAccessToken = async (refreshToken) => {
  const userId = verifyRefreshToken(refreshToken);

  if (!userId) {
    throw new ValidationError('Invalid refresh token');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ValidationError('User not found');
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const newRefreshToken = generateRefreshToken(user.id);

  return {
    token,
    refreshToken: newRefreshToken,
  };
};

/**
 * Logout user by invalidating refresh token
 * @param {string} refreshToken - Refresh token (optional implementation)
 * @returns {Promise<boolean>} - Always returns true (stub for token revocation)
 */
const logoutUser = async (refreshToken) => {
  // Ideally: Delete token from DB or Redis blacklist
  return true;
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
};
