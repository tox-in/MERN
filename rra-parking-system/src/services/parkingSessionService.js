const prisma = require('../config/database');
const { NotFoundError, ValidationError } = require('../utils/errorClasses');
const reportService = require('./reportService');
const emailService = require('./emailService');

/**
 * Create a new parking session (entry)
 * @param {Object} entryData - Entry data
 * @returns {Promise<Object>} - Created session
 */
const createEntry = async (entryData) => {
  const { vehicleId, plate_number } = entryData;
  let vehicle;

  if (vehicleId) {
    vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
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
  } else if (plate_number) {
    vehicle = await prisma.vehicle.findUnique({
      where: { plate_number },
      include: {
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
  } else {
    throw new ValidationError('Vehicle ID or plate number is required');
  }

  if (!vehicle) {
    throw new NotFoundError('Vehicle not found');
  }

  if (!vehicle.isActive) {
    throw new ValidationError('Vehicle is currently suspended');
  }

  const activeSession = await prisma.parkingSession.findFirst({
    where: {
      vehicleId: vehicle.id,
      hasLeft: false
    }
  });

  if (activeSession) {
    throw new ValidationError('Vehicle already has an active parking session');
  }

  const session = await prisma.parkingSession.create({
    data: {
      vehicle: {
        connect: { id: vehicle.id }
      },
      entry_time: new Date(),
      hasLeft: false
    },
    select: {
      id: true,
      entry_time: true,
      exit_time: true,
      hasLeft: true,
      duration: true,
      price: true,
      createdAt: true,
      updatedAt: true,
      vehicle: {
        select: {
          id: true,
          plate_number: true,
          category: true,
          owner_name: true,
          company: true
        }
      }
    }
  });

  if (vehicle.owner && vehicle.owner.email) {
    try {
      await emailService.sendEntryNotification(
        vehicle.owner.email,
        vehicle.owner.owner_name,
        session
      );
    } catch (error) {
      console.error('Failed to send entry notification email:', error);
    }
  }

  return session;
};

/**
 * Record exit for a parking session
 * @param {string} sessionId - Session ID
 * @param {Date} exitTime - Exit time
 * @returns {Promise<Object>} - Updated session
 */
const recordExit = async (sessionId, exitTime = new Date()) => {
  const session = await prisma.parkingSession.findUnique({
    where: { id: sessionId },
    include: {
      vehicle: {
        include: {
          owner: {
            select: {
              id: true,
              owner_name: true,
              email: true,
              phone: true
            }
          }
        }
      }
    }
  });

  if (!session) {
    throw new NotFoundError('Parking session not found');
  }

  if (session.hasLeft) {
    throw new ValidationError('This parking session has already ended');
  }

  const entryTime = new Date(session.entry_time);
  const duration = Math.ceil((exitTime - entryTime) / (1000 * 60));
  const price = calculateParkingPrice(session.vehicle.category, duration);

  const updatedSession = await prisma.parkingSession.update({
    where: { id: sessionId },
    data: {
      exit_time: exitTime,
      hasLeft: true,
      duration,
      price
    },
    select: {
      id: true,
      entry_time: true,
      exit_time: true,
      hasLeft: true,
      duration: true,
      price: true,
      createdAt: true,
      updatedAt: true,
      vehicle: {
        select: {
          id: true,
          plate_number: true,
          category: true,
          owner_name: true,
          company: true,
          debt: true
        }
      }
    }
  });

  await prisma.vehicle.update({
    where: { id: session.vehicle.id },
    data: {
      debt: {
        increment: price
      }
    }
  });

  const report = await reportService.createReport(updatedSession);

  if (session.vehicle.owner && session.vehicle.owner.email) {
    try {
      await emailService.sendExitNotification(
        session.vehicle.owner.email,
        session.vehicle.owner.owner_name,
        updatedSession,
        report
      );
    } catch (error) {
      console.error('Failed to send exit notification email:', error);
    }
  }

  return {
    ...updatedSession,
    report
  };
};

/**
 * Get all parking sessions (paginated)
 * @param {number} page - Page number
 * @param {number} limit - Number of sessions per page
 * @param {string} search - Search term
 * @param {string} status - Session status (all, active, completed)
 * @param {Date} startDate - Filter by start date
 * @param {Date} endDate - Filter by end date
 * @returns {Promise<Object>} - Paginated sessions
 */
const getAllSessions = async (
  page = 1,
  limit = 10,
  search = '',
  status = 'all',
  startDate,
  endDate
) => {
  const skip = (page - 1) * limit;
  let whereClause = {};

  if (search) {
    whereClause.OR = [
      {
        vehicle: {
          plate_number: { contains: search, mode: 'insensitive' }
        }
      },
      {
        vehicle: {
          owner_name: { contains: search, mode: 'insensitive' }
        }
      },
      {
        vehicle: {
          company: { contains: search, mode: 'insensitive' }
        }
      }
    ];
  }

  if (status === 'active') {
    whereClause.hasLeft = false;
  } else if (status === 'completed') {
    whereClause.hasLeft = true;
  }

  if (startDate) {
    whereClause.entry_time = {
      ...whereClause.entry_time,
      gte: new Date(startDate)
    };
  }

  if (endDate) {
    whereClause.entry_time = {
      ...whereClause.entry_time,
      lte: new Date(endDate)
    };
  }

  const totalCount = await prisma.parkingSession.count({
    where: whereClause
  });

  const sessions = await prisma.parkingSession.findMany({
    where: whereClause,
    include: {
      vehicle: {
        select: {
          id: true,
          plate_number: true,
          owner_name: true,
          category: true,
          company: true
        }
      }
    },
    skip,
    take: limit,
    orderBy: {
      entry_time: 'desc'
    }
  });

  const totalPages = Math.ceil(totalCount / limit);

  return {
    sessions,
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
 * Get session by ID
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} - Session data
 */
const getSessionById = async (sessionId) => {
  const session = await prisma.parkingSession.findUnique({
    where: { id: sessionId },
    include: {
      vehicle: {
        select: {
          id: true,
          plate_number: true,
          owner_name: true,
          category: true,
          company: true,
          owner: {
            select: {
              id: true,
              owner_name: true,
              email: true,
              phone: true
            }
          }
        }
      },
      report: true
    }
  });

  if (!session) {
    throw new NotFoundError('Parking session not found');
  }

  return session;
};

/**
 * Get sessions by vehicle ID
 * @param {string} vehicleId - Vehicle ID
 * @param {number} page - Page number
 * @param {number} limit - Number of sessions per page
 * @returns {Promise<Object>} - Paginated sessions
 */
const getSessionsByVehicleId = async (vehicleId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId }
  });

  if (!vehicle) {
    throw new NotFoundError('Vehicle not found');
  }

  const totalCount = await prisma.parkingSession.count({
    where: { vehicleId }
  });

  const sessions = await prisma.parkingSession.findMany({
    where: { vehicleId },
    include: {
      vehicle: {
        select: {
          id: true,
          plate_number: true,
          owner_name: true,
          category: true,
          company: true
        }
      },
      report: true
    },
    skip,
    take: limit,
    orderBy: {
      entry_time: 'desc'
    }
  });

  const totalPages = Math.ceil(totalCount / limit);

  return {
    sessions,
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
 * Calculate parking price based on vehicle category and duration
 * @param {string} category - Vehicle category
 * @param {number} durationInMinutes - Duration in minutes
 * @returns {number} - Price in RWF
 */
const calculateParkingPrice = (category, durationInMinutes) => {
  const hourlyRates = {
    SMALL: 300,
    MINIBUS: 500,
    BUS: 1000
  };

  const hours = Math.ceil(durationInMinutes / 60);
  return hourlyRates[category] * hours || 0;
};

module.exports = {
  createEntry,
  recordExit,
  getAllSessions,
  getSessionById,
  getSessionsByVehicleId,
  calculateParkingPrice
};
