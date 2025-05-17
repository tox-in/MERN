const { PrismaClient } = require('../../prisma/client');
const { logger } = require('./logger');

const prisma = new PrismaClient({
    log: [
        {
            emit: 'event',
            level: 'query',
        },
        {
            emit: 'event',
            level: 'info',
        },
        {
            emit: 'event',
            level: 'warn',
        },
        {
            emit: 'event',
            level: 'error',
        },
    ],
});

// Log query events in development
if (process.env.NODE_ENV === 'development') {
    prisma.$on('query', (e) => {
        logger.debug(`Query: ${e.query}`);
        logger.debug(`Duration: ${e.duration}ms`);
    });
}


// Log all errors
prisma.$on('error', (e) => {
    logger.error(`Database error: ${e.message}`);
});

process.on('beforeExit', async () => {
    await prisma.$disconnect();
});

module.exports = prisma;