const userService = require('../services/userService');
const { userSchemas } = require('../utils/validators');
const { ValidationError } = require('../utils/errorClasses');

/**
 * Get all users (paginated)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const result = await userService.getAllUsers(
      parseInt(page, 10),
      parseInt(limit, 10),
      search
    );
    
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: result.users,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Get user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    
    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Update user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { error, value } = userSchemas.update.validate(req.body);
    if (error) {
      throw new ValidationError(error.message);
    }
    
    const requesterId = req.user.id;
    const requesterRole = req.user.role;
    
    if (id !== requesterId && requesterRole !== 'MANAGER') {
      throw new Error('Unauthorized to update this user');
    }
    
    const updatedUser = await userService.updateUser(id, value);
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Delete user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};