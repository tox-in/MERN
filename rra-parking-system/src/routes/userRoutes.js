const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/users
 * @desc    Get all users (paginated)
 * @access  Private (MANAGER)
 */
router.get(
  '/',
  authenticate,
  authorize(['MANAGER']),
  userController.getAllUsers
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (MANAGER or self)
 */
router.get(
  '/:id',
  authenticate,
  userController.getUserById
);

/**
 * @route   PATCH /api/users/:id
 * @desc    Update user
 * @access  Private (Owner or MANAGER)
 */
router.patch(
  '/:id',
  authenticate,
  userController.updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private (MANAGER)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['MANAGER']),
  userController.deleteUser
);

module.exports = router;