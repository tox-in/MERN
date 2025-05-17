const { vehicleSchemas } = require('../utils/validators');
const vehicleService = require('../services/vehicleService');
const { ValidationError } = require('../utils/errorClasses');


/**
 * Register a new vehicle
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const registerVehicle = async (req, res, next) => {
    try {
        const { error, value } = vehicleSchemas.create.validate(req.body);
        if (error) {
            throw new ValidationError(error.message);
        }

        const userId = req.user.id;

        const vehicle = await vehicleService.createVehicle(value, userId);

        res.status(201).json({
            success: true,
            message: 'Vehicle registered successfully',
            data: car
        });
    } catch (error) {
        next(error);
    }
};


/**
* Get all vehicles (paginated)
* @param {Object} req - Express request object
* @param {Object} res - Express response object
* @param {Function} next - Express next middleware function
*/
const getAllVehicles = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;

        const result = await vehicleService.getAllVehicles(
            parseInt(page, 10),
            parseInt(limit, 10),
            search
        );

        res.status(200).json({
            success: true,
            message: 'Vehicles retrieved successfully',
            data: result.cars,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};


/**
 * Get vehicle by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getVehicleById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const vehicle = await vehicleService.getVehicleById(id);

        res.status(200).json({
            success: true,
            message: 'Vehicle retrieved successfully',
            data: car
        });
    } catch (error) {
        next(error);
    }
};


/**
 * Update vehicle information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateVehicle = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { error, value } = vehicleSchemas.update.validate(req.body);
        if (error) {
            throw new ValidationError(error.message);
        }

        const userId = req.user.id;
        const role = req.user.role;

        const updatedVehicle = await vehicleService.updateVehicle(id, value, userId, role);

        res.status(200).json({
            success: true,
            message: 'Vehicle updated successfully',
            data: updatedCar
        });
    } catch (error) {
        next(error);
    }
};


/**
 * Update car status (suspend/activate)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateVehicleStatus = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { error, value } = vehicleSchemas.statusUpdate.validate(req.body);
        if (error) {
            throw new ValidationError(error.message);
        }

        const updatedVehicle = await vehicleService.updateVehicleStatus(id, value.isActive);

        const statusMessage = value.isActive ? 'activated' : 'suspended';

        res.status(200).json({
            success: true,
            message: `Vehicle ${statusMessage} successfully`,
            data: updatedCar
        });
    } catch (error) {
        next(error);
    }
};


/**
 * Delete vehicle
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteVehicle = async (req, res, next) => {
    try {
        const { id } = req.params;
        await vehicleService.deleteVehicle(id);

        res.status(200).json({
            success: true,
            message: 'Vehicle deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    registerCar,
    getAllCars,
    getCarById,
    updateCar,
    updateCarStatus,
    deleteCar
};