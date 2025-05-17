const rateLimit = require('express-rate-limit');
const { RateLimitError } = require('../utils/errorClasses');

/**
 * Create a rate limiter middleware with custom configuration
 * @param {number} maxRequests - Maximum number of requests allowed in the time window
 * @param {number} windowMinutes - Time window in minutes
 * @param {string} message - Error message to display when limit is reached
 */
const createRateLimiter = (maxRequests = 100, windowMinutes = 15, message = 'Too many requests, please try again later') => {
    return rateLimit({
        max: maxRequests, // Limit each IP to maxRequests per windowMinutes
        windowMs: windowMinutes * 60 * 1000, // Time window in milliseconds
        message: {
            success: false,
            error: {
                message,
                code: 429
            }
        },
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        handler: (req, res, next) => {
            next(new RateLimitError(message));
        }
    });
};

//Default rate limiter for general API routes
exports.defaultLimiter = createRateLimiter(100, 15);

//Stricter rate limiter for authentication routes
exports.authLimiter = createRateLimiter(10, 15, 'Too many authentication attempts, please try again later');

