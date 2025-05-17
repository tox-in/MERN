const express = require('express');
const router = express.Router();
const parkingSessionController = require('../controllers/parkingSessionController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @route   POST /api/sessions/entry
 * @desc    Create parking session (entry)
 * @access  Private (DRIVER, GATESMAN)
 */
router.post(
  '/entry',
  authenticate,
  authorize(['DRIVER', 'GATESMAN']),
  parkingSessionController.createEntry
);

/**
 * @route   PATCH /api/sessions/:id/exit
 * @desc    Update parking session (exit)
 * @access  Private (GATESMAN)
 */
router.patch(
  '/:id/exit',
  authenticate,
  authorize(['GATESMAN']),
  parkingSessionController.recordExit
);

/**
 * @route   GET /api/sessions
 * @desc    Get all sessions (paginated)
 * @access  Private (MANAGER)
 */
router.get(
  '/',
  authenticate,
  authorize(['MANAGER']),
  parkingSessionController.getAllSessions
);

/**
 * @route   GET /api/sessions/:id
 * @desc    Get session by ID
 * @access  Private (Owner, MANAGER, GATESMAN)
 */
router.get(
  '/:id',
  authenticate,
  parkingSessionController.getSessionById
);

/**
 * @route   GET /api/sessions/car/:carId
 * @desc    Get sessions by vehicle ID
 * @access  Private (Owner, MANAGER)
 */
router.get(
  '/vehicle/:vehicleId',
  authenticate,
  parkingSessionController.getSessionsByVehicleId
);

module.exports = router;