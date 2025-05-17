const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/reports
 * @desc    Get all reports (paginated)
 * @access  Private (MANAGER)
 */
router.get(
  '/',
  authenticate,
  authorize(['MANAGER']),
  reportController.getAllReports
);

/**
 * @route   GET /api/reports/:id
 * @desc    Get report by ID
 * @access  Private (MANAGER)
 */
router.get(
  '/:id',
  authenticate,
  authorize(['MANAGER']),
  reportController.getReportById
);

/**
 * @route   GET /api/reports/vehicle/:vehicleId
 * @desc    Get reports by vehicle
 * @access  Private (Owner, MANAGER)
 */
router.get(
  '/vehicle/:vehicleId',
  authenticate,
  reportController.getReportsByVehicleId
);

/**
 * @route   GET /api/reports/export
 * @desc    Export reports (CSV/Excel)
 * @access  Private (MANAGER)
 */
router.get(
  '/export',
  authenticate,
  authorize(['MANAGER']),
  reportController.exportReports
);

module.exports = router;