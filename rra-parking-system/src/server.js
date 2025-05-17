require('dotenv').config();
const app = require('./app');
const logger = require('./config/logger');

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});

process.on('unhandledRejection', (error) => {
    logger.error('Unhandled Rejection! Shutting down...', error);
    server.close(() => {
        logger.info('Server closed due to unhandled rejection');
        process.exit(1);
    });
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception! Shutting down...', error);
    server.close(() => {
        logger.info('Server closed due to uncaught exception');
        process.exit(1);
    });
});