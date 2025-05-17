const prisma = require('../config/database');
const { NotFoundError } = require('../utils/errorClasses');
const authService = require('./authService');

/**
 * Get all users (paginated)
 * @param {number} page - Page number
 * @param {number} limit - Number of users per page
 * @param {string} searchTerm - Optional search term for filtering
 * @returns {Promise<Object>} - Paginated users
 */
const getAllUsers = async (page = 1, limit = 10, searchTerm = '') => {
    const skip = (page - 1) * limit;

    //Build the where clause for search
    const whereClause = searchTerm
        ? {
            OR: [
                { owner_name: { contains: searchTerm, mode: 'insensitive' } },
                { email: { contains: searchTerm, mode: 'insensitive' } },
                { phone: { contains: searchTerm, mode: 'insensitive' } },
            ],
        }
        : {};

    //Get total count of pagination
    const totalCount = await prisma.user.count({
        where: whereClause,
    });

    //Get users
    const users = await prisma.user.findMany({
        where: whereClause,
        select: {
            id: true,
            owner_name: true,
            national_id: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true,
            _count: {
                select: { vehicles: true }
            }
        },
        skip,
        take: limit,
        orderBy: {
            createdAt: 'desc',
        },
    });

    //Total pages calculation
    const totalPages = Math.ceil(totalCount / limit);

    return {
        users,
        pagination: {
            total: totalCount,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        },
    };
};

/**
 * Get a user by ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} - User data
 */
const getUserById = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            owner_name: true,
            national_id: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true,
            vehicles: {
                select: {
                    id: true,
                    plate_number: true,
                    category: true,
                    isPublic: true,
                    isActive: true,
                    debt: true,
                    createdAt: true,
                    updatedAt: true
                }
            }
        }
    });

    if (!user) {
        throw new NotFoundError('User not found');
    }

    return user;
};


/**
 * Update a user
 * @param {number} userId - User ID
 * @param {Object} updateData - User data to update
 * @returns {Promise<Object>} - Updated user data
 */
const updateUser = async (userId, updateData) => {
    const existingUser = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!existingUser) {
        throw new NotFoundError('User not found');
    }

    if (updateData.password) {
        const hashedPassword = await authService.hashPassword(updateData.password);
        updateData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
            id: true,
            owner_name: true,
            national_id: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return updatedUser;
}

/**
 * Delete a user
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
const deleteUser = async (userId) => {
    const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            vehicles: true,
        },
    });

    if (!existingUser) {
        throw new NotFoundError('User not found');
    }

    // Delete the user's vehicles and associated sessions
    if (existingUser.vehicles.length > 0) {
        const vehicleIds = existingUser.vehicles.map(vehicle => vehicle.id);

        // Delete all parking sessions for user's vehicles
        await prisma.parkingSession.deleteMany({
            where: {
                vehicleId: {
                    in: vehicleIds,
                },
            },
        });

        await prisma.report.deleteMany({
            where: {
                vehicleId: {
                    in: vehicleIds,
                },
            },
        });

        // Delete the user's vehicles
        await prisma.vehicle.deleteMany({
            where: {
                ownerId: userId,
            },
        });
    }

    // Delete the user
    await prisma.user.delete({
        where: { id: userId },
    });
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
}