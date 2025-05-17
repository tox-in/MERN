const { userSchemas } = require('../utils/validators');
const authService = require('../services/authService');
const { ValidationError } = require('../utils/errorClasses');

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const register = async (req, res, next) => {
    try {
        const { error, value } = userSchemas.register.validate(req.body);
        if (error) {
            throw new ValidationError(error.message);
        }

        const user = await authService.registerUser(value);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * User login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const login = async (req, res, next) => {
    try {
        const { error, value } = userSchemas.login.validate(req.body);
        if (error) {
            throw new ValidationError(error.message);
        }

        const { user, token, refreshToken } = await authService.loginUser(value);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user,
                token,
                refreshToken
            }
        });
    } catch (error) {
        next(error);
    }
};


/**
 * Refresh access token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw new ValidationError('Refresh token is required');
        }

        const { token, newRefreshToken } = await authService.refreshAccessToken(refreshToken);

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                token,
                refreshToken: newRefreshToken
            }
        });
    } catch (error) {
        next(error);
    }
};


/**
 * User logout
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw new ValidationError('Refresh token is required');
        }

        await authService.logoutUser(refreshToken);

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    refreshToken,
    logout
};