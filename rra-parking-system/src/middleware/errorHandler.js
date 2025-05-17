const logger = require('../config/logger');

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (err.statusCode >= 500) {
        logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        logger.error(err.stack);
    } else {
        logger.warn(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    }

    if (process.env.NODE_ENV === 'development') {
        return sendErrorDev(req, res);
    };

    return sendErrorProd(req, res);
};

const sendErrorDev = (req, res) => {
    return res.status(err.statusCode).json({
        success: false,
        error: {
            message: err.message,
            code: err.statusCode,
            stack: err.stack,
            details: err.details || undefined
        }
    });
};

const sendErrorProd = (req, res) => {
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            error: {
                message: err.message,
                code: err.statusCode,
                details: err.details || undefined
            }
        });
    }

    logger.error('ERROR💥:', err);
    return res.status(500).json({
        success: false,
        error: {
            message: 'Something went very wrong!',
            code: 500
        }
    });
};