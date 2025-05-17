const { sessionSchemas } = require('../utils/validators');
const parkingSessionService = require('../services/parkingSessionService');
const { ValidationError } = require('../utils/errorClasses');

/**
 * Create parking session (entry)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createEntry = async (req, res, next) => {
    try {
        const { error, value } = sessionSchemas.entry.validate(req.body);
        if (error) {
            throw new ValidationError(error.message);
        }

        const session = await parkingSessionService.createEntry(value);

        res.status(201).json({
            success: true,
            message: 'Parking entry recorded successfully',
            data: session
        });
    } catch (error) {
        next(error);
    }
};


/**
 * Update parking session (exit)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const recordExit = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { error, value } = sessionSchemas.exit.validate(req.body);
        if (error) {
            throw new ValidationError(error.message);
        }

        const sessionResult = await parkingSessionService.recordExit(id, value.exit_time);

        res.status(200).json({
            success: true,
            message: 'Parking exit recorded successfully',
            data: sessionResult
        });
    } catch (error) {
        next(error);
    }
};


/**
 * Get all parking sessions (paginated)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllSessions = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            status = 'all', // all, active, completed
            startDate,
            endDate
        } = req.query;

        const result = await parkingSessionService.getAllSessions(
            parseInt(page, 10),
            parseInt(limit, 10),
            search,
            status,
            startDate,
            endDate
        );

        res.status(200).json({
            success: true,
            message: 'Parking sessions retrieved successfully',
            data: result.sessions,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};


/**
* Get parking session by ID
* @param {Object} req - Express request object
* @param {Object} res - Express response object
* @param {Function} next - Express next middleware function
*/
const getSessionById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const session = await parkingSessionService.getSessionById(id);

        res.status(200).json({
            success: true,
            message: 'Parking session retrieved successfully',
            data: session
        });
    } catch (error) {
        next(error);
    }
};


/**
 * Get sessions by vehicle ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getSessionsByVehicleId = async (req, res, next) => {
    try {
        const { vehicleId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const result = await parkingSessionService.getSessionsByVehicleId(
            vehicleId,
            parseInt(page, 10),
            parseInt(limit, 10)
        );

        res.status(200).json({
            success: true,
            message: 'Parking sessions retrieved successfully',
            data: result.sessions,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    createEntry,
    recordExit,
    getAllSessions,
    getSessionById,
    getSessionsByVehicleId
};