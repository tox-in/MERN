const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const parkingSessionRoutes = require('./routes/parkingSessionRoutes');
const reportRoutes = require('./routes/reportRoutes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./config/logger');

const app = express();

app.use(cors());
app.use(helmet()); //security headers
app.use(express.json()); //parse JSON
app.use(express.urlencoded({ extended: true })); //parse URL-encoded data
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } })); //logging

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); //logging
}

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/sessions', parkingSessionRoutes);
app.use('/api/reports', reportRoutes);

// Swagger setup
// if (process.env.NODE_ENV !== 'production') {
//     const swaggerDocument = require('./swagger.json');
//     app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// };

//health check
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'UP',
        message: 'Server is healthy',
    });
});

app.all('*', (req, res, next) => {
    res.status(404).json({
        success: false,
        error: {
            message: `Cannot find ${req.originalUrl} on this server!`,
            status: 404
        }
    });
});

app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
      console.log(r.route.path);
    }
  });
  

app.use(errorHandler); //error handling

module.exports = app;