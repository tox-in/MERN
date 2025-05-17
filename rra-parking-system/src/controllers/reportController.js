const reportService = require('../services/reportService');

/**
 * Get all reports (paginated)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllReports = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            startDate,
            endDate
        } = req.query;

        const result = await reportService.getAllReports(
            parseInt(page, 10),
            parseInt(limit, 10),
            search,
            startDate,
            endDate
        );

        res.status(200).json({
            success: true,
            message: 'Reports retrieved successfully',
            data: result.reports,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get report by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getReportById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const report = await reportService.getReportById(id);

        res.status(200).json({
            success: true,
            message: 'Report retrieved successfully',
            data: report
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get reports by vehicle ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getReportsByVehicleId = async (req, res, next) => {
    try {
        const { vehicleId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const result = await reportService.getReportsByVehicleId(
            vehicleId,
            parseInt(page, 10),
            parseInt(limit, 10)
        );

        res.status(200).json({
            success: true,
            message: 'Reports retrieved successfully',
            data: result.reports,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Export reports (for managers)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const exportReports = async (req, res, next) => {
    try {
        const {
            format = 'csv', // csv or excel
            startDate,
            endDate
        } = req.query;

        const result = await reportService.exportReports(format, startDate, endDate);

        // Set appropriate headers based on format
        if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=reports.csv');
        } else {
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=reports.xlsx');
        }

        res.status(200).send(result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllReports,
    getReportById,
    getReportsByVehicleId,
    exportReports
};
