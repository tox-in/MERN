const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { AuthenticationError, ConflictError } = require('../utils/errorClasses');


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
 * Generate a JWT token
 * @param {object} payload - The payload to sign
 * @returns {string} - The JWT token
 */
const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d', algorithm: 'HS256' });
};

/**
 * Register a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} - The created user and token
 */
const register = async (userData) => {
    const existingEmail = await prisma.user.findUnique({
        where: { email: userData.email},
    });

    if (existingEmail) {
        throw new ConflictError('Email already exists');
    }

    const existingNationalId = await prisma.user.findUnique({
        where: { national_id: userData.national_id},
    });

    if (existingNationalId) {
        throw new ConflictError('National ID already exists');
    }

    const existingPhone = await prisma.user.findUnique({
        where: { phone: userData.phone},
    });

    if (existingPhone) {
        throw new ConflictError('Phone number already exists');
    }

    const hashedPassword = await hashPassword(userData.password);

    const user = await prisma.user.create({
        data: {
            ...userData,
            password: hashedPassword,
        },
    });

    const token = generateToken({ id: user.id, role: user.role });

    const { password, ...userWithoutPassword } = user; 

    return {
        user: userWithoutPassword,
        token,
    };
};

/**
 * Login a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - The logged-in user and token
 */
const login = async (email, password) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user || !(await comparePassword(password, user.password))) {
        throw new AuthenticationError('Invalid email or password');
    }

    const token = generateToken({ id: user.id, role: user.role });

    // Exclude password from the response
    const { password: _, ...userWithoutPassword } = user;

    return {
        user: userWithoutPassword,
        token,
    };
};


/**
 * Refresh a token
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - The new token
 */
const refreshToken = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new AuthenticationError('User not found');
    }

    const token = generateToken({ id: user.id, role: user.role });

    return {
        token,
    };
};

module.exports = {
    register,
    login,
    refreshToken,
    hashPassword,
    comparePassword,
    generateToken,
}