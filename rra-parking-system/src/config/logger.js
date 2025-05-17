const winston = require('winston');

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const level = () => {
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : 'warn';
}

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};

winston.addColors(colors);

const format = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss:ms',
    }),
    winston.format.printf((info) =>
        `${timestamp} ${level}: ${message}`
    )
);

const transports = [
    new winston.transports.Console(),

    new winston.transports.File({
        filename: 'logs/all.log',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),

    new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),
];

const logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports,
});

module.exports = logger;