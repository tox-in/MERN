const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');


/**
 * @route   POST /api/vehicles
 * @desc    Register a new vehicle
 * @access  Private (DRIVER)
 */
router.post(
    '/',
    authenticate,
    authorize(['DRIVER', 'MANAGER']),
    vehicleController.registerVehicle
);

/**
 * @route   GET /api/vehicles
 * @desc    Get all vehicles (paginated)
 * @access  Private (MANAGER)
 */
router.get(
    '/',
    authenticate,
    authorize(['MANAGER']),
    vehicleController.getAllVehicles
);


/**
* @route   GET /api/vehicles/:id
* @desc    Get vehicle by ID
* @access  Private (Owner, MANAGER, GATESMAN)
*/
router.get(
    '/:id',
    authenticate,
    vehicleController.getVehicleById
);

/**
 * @route   PATCH /api/vehicles/:id
 * @desc    Update vehicle
 * @access  Private (Owner, MANAGER)
 */
router.patch(
    '/:id',
    authenticate,
    vehicleController.updateVehicle
);

/**
 * @route   PATCH /api/vehicles/:id/suspend
 * @desc    Suspend/activate vehicle
 * @access  Private (MANAGER, GATESMAN)
 */
router.patch(
    '/:id/suspend',
    authenticate,
    authorize(['MANAGER', 'GATESMAN']),
    vehicleController.updateVehicleStatus
);

/**
 * @route   DELETE /api/vehicles/:id
 * @desc    Delete vehicle
 * @access  Private (MANAGER)
 */
router.delete(
    '/:id',
    authenticate,
    authorize(['MANAGER']),
    vehicleController.deleteVehicle
);

module.exports = router;
