const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const prisma = require('../config/database');
const { AuthenticationError, AuthorizationError } = require('../utils/errorClasses');


/**
 * Middleware to protect routes that require authentication
 */
exports.protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if (!token) {
            return next(new AuthenticationError('You are not logged in! Please log in to get access.'));
        }

        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        const currentUser = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                password: false,
            },
        });

        if (!currentUser) {
            return next(new AuthenticationError('The user belonging to this token does no longer exist.'));
        }

        req.user = currentUser;
        next();
    } catch (error) {
        return next(new AuthenticationError('Invalid token'));
    }
}


/**
 * Middleware to restrict access based on user roles
 * @param  {...string} roles - Allowed roles
 */
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AuthenticationError('You are not logged in! Please log in to get access.'));
        }

        if (!roles.includes(req.user.role)) {
            return next(new AuthorizationError('You do not have permission to perform this action.'));
        }
        next();
    };
};

/**
 * Middleware to check if the user is the owner of the resource or has higher privileges
 * @param {string} model - The model name
 * @param {string} paramIdField - The request parameter containing the resource ID
 */
exports.isOwnerOrAdmin = async (model, paramIdField) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return next(new AuthenticationError('You are not logged in! Please log in to get access.'));
            }

            //MMANAGER role can access all resources
            if (req.user.role === 'MANAGER') {
                return next();
            }

            const resourceId = req.params[paramIdField];
            const userId = req.user.id;

            if (!resourceId) {
                return next(new AuthorizationError('Resource ID not provided'));
            }

            let resource;
            if (model === 'vehicle') {
                resource = await prisma.vehicle.findUnique({
                    where: { id: resourceId },
                    select: { id: true },
                });
            } else if (model === 'user') {
                //only the user can access their own data
                if (req.user.id !== resourceId) {
                    return next(new AuthorizationError('You do not have permission to access this resource'));
                }

                return next();
            } else if (model === 'parkingSession') {
                resource = await prisma.parkingSession.findUnique({
                    where: { id: resourceId },
                    select: { userId: true },
                    include: { vehicle: true },
                });

                //gatesman can access all parking sessions
                if (req.user.role === 'GATESMAN') {
                    return next();
                }

                if (resource && resource.vehicle && resource.vehicle.ownerId === userId) {
                    return next();
                }
            }

            //check ownership for vehicle
            if (model === 'vehicle' && resource && resource.ownerId === userId) {
                return next();
            }

            return next(new AuthorizationError('You do not have permission to access this resource'));
        } catch (error) {
            return next(error);
        }
    };
};

exports.authenticate = exports.protect;
exports.authorize = exports.restrictTo;