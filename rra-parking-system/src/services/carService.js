const prisma = require('../config/database');
const { NotFoundError, ValidationError, UnauthorizedError } = require('../utils/errorClasses');

/**
 * Create a new vehicle
 * @param {Object} vehicleData - Vehicle data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Created vehicle
 */
const createVehicle = async (vehicleData, userId) => {
  const existingVehicle = await prisma.vehicle.findUnique({
    where: { plate_number: vehicleData.plate_number }
  });

  if (existingVehicle) {
    throw new ValidationError('Vehicle with this plate number already exists');
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      ...vehicleData,
      owner: {
        connect: { id: userId }
      }
    },
    select: {
      id: true,
      plate_number: true,
      owner_name: true,
      category: true,
      company: true,
      isPublic: true,
      isActive: true,
      debt: true,
      createdAt: true,
      updatedAt: true,
      owner: {
        select: {
          id: true,
          owner_name: true,
          email: true,
          phone: true
        }
      }
    }
  });

  return vehicle;
};

/**
 * Get all vehicles (paginated)
 * @param {number} page - Page number
 * @param {number} limit - Number of vehicles per page
 * @param {string} search - Search term
 * @returns {Promise<Object>} - Paginated vehicles
 */
const getAllVehicles = async (page = 1, limit = 10, search = '') => {
  const skip = (page - 1) * limit;

  const whereClause = search
    ? {
        OR: [
          { plate_number: { contains: search, mode: 'insensitive' } },
          { owner_name: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } }
        ]
      }
    : {};

  const totalCount = await prisma.vehicle.count({
    where: whereClause
  });

  const vehicles = await prisma.vehicle.findMany({
    where: whereClause,
    select: {
      id: true,
      plate_number: true,
      owner_name: true,
      category: true,
      company: true,
      isPublic: true,
      isActive: true,
      debt: true,
      createdAt: true,
      updatedAt: true,
      owner: {
        select: {
          id: true,
          owner_name: true,
          email: true,
          phone: true
        }
      },
      _count: {
        select: { sessions: true }
      }
    },
    skip,
    take: limit,
    orderBy: {
      createdAt: 'desc'
    }
  });

  const totalPages = Math.ceil(totalCount / limit);

  return {
    vehicles,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  };
};

/**
 * Get vehicle by ID
 * @param {string} vehicleId - Vehicle ID
 * @returns {Promise<Object>} - Vehicle data
 */
const getVehicleById = async (vehicleId) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: {
      id: true,
      plate_number: true,
      owner_name: true,
      category: true,
      company: true,
      isPublic: true,
      isActive: true,
      debt: true,
      createdAt: true,
      updatedAt: true,
      owner: {
        select: {
          id: true,
          owner_name: true,
          email: true,
          phone: true
        }
      },
      sessions: {
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          entry_time: true,
          exit_time: true,
          hasLeft: true,
          duration: true,
          price: true
        }
      }
    }
  });

  if (!vehicle) {
    throw new NotFoundError('Vehicle not found');
  }

  return vehicle;
};

/**
 * Update vehicle
 * @param {string} vehicleId - Vehicle ID
 * @param {Object} updateData - Data to update
 * @param {string} userId - User ID (requester)
 * @param {string} role - User role (requester)
 * @returns {Promise<Object>} - Updated vehicle
 */
const updateVehicle = async (vehicleId, updateData, userId, role) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: {
      owner: {
        select: {
          id: true
        }
      }
    }
  });

  if (!vehicle) {
    throw new NotFoundError('Vehicle not found');
  }

  if (vehicle.owner.id !== userId && role !== 'MANAGER') {
    throw new UnauthorizedError('Not authorized to update this vehicle');
  }

  const updatedVehicle = await prisma.vehicle.update({
    where: { id: vehicleId },
    data: updateData,
    select: {
      id: true,
      plate_number: true,
      owner_name: true,
      category: true,
      company: true,
      isPublic: true,
      isActive: true,
      debt: true,
      createdAt: true,
      updatedAt: true,
      owner: {
        select: {
          id: true,
          owner_name: true,
          email: true,
          phone: true
        }
      }
    }
  });

  return updatedVehicle;
};

/**
 * Update vehicle status (suspend/activate)
 * @param {string} vehicleId - Vehicle ID
 * @param {boolean} isActive - Active status
 * @returns {Promise<Object>} - Updated vehicle
 */
const updateVehicleStatus = async (vehicleId, isActive) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId }
  });

  if (!vehicle) {
    throw new NotFoundError('Vehicle not found');
  }

  const updatedVehicle = await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { isActive },
    select: {
      id: true,
      plate_number: true,
      owner_name: true,
      category: true,
      company: true,
      isPublic: true,
      isActive: true,
      debt: true,
      createdAt: true,
      updatedAt: true,
      owner: {
        select: {
          id: true,
          owner_name: true,
          email: true,
          phone: true
        }
      }
    }
  });

  return updatedVehicle;
};

/**
 * Delete vehicle
 * @param {string} vehicleId - Vehicle ID
 * @returns {Promise<void>}
 */
const deleteVehicle = async (vehicleId) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: {
      sessions: true
    }
  });

  if (!vehicle) {
    throw new NotFoundError('Vehicle not found');
  }

  // Start a transaction
  await prisma.$transaction(async (prisma) => {
    // Delete related reports
    await prisma.report.deleteMany({
      where: { vehicleId }
    });

    // Delete related sessions
    await prisma.parkingSession.deleteMany({
      where: { vehicleId }
    });

    // Delete vehicle
    await prisma.vehicle.delete({
      where: { id: vehicleId }
    });
  });
};

module.exports = {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  updateVehicleStatus,
  deleteVehicle
};
