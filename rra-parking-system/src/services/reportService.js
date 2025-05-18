const prisma = require('../config/database');
const { NotFoundError, ValidationError } = require('../utils/errorClasses');
const ExcelJS = require('exceljs');
const { Parser } = require('json2csv');

/**
 * Get all reports (paginated)
 * @param {number} page - Page number
 * @param {number} limit - Number of reports per page
 * @param {string} search - Search term
 * @param {string} startDate - Start date filter (ISO string)
 * @param {string} endDate - End date filter (ISO string)
 * @returns {Promise<Object>} - Paginated reports
 */
const getAllReports = async (page = 1, limit = 10, search = '', startDate = null, endDate = null) => {
  const skip = (page - 1) * limit;

  const whereClause = {};

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
        reportType: { contains: search, mode: 'insensitive' }
      }
    ];
  }

  if (startDate || endDate) {
    whereClause.createdAt = {};
    
    if (startDate) {
      whereClause.createdAt.gte = new Date(startDate);
    }
    
    if (endDate) {
      whereClause.createdAt.lte = new Date(endDate);
    }
  }

  const totalCount = await prisma.report.count({
    where: whereClause
  });

  const reports = await prisma.report.findMany({
    where: whereClause,
    select: {
      id: true,
      reportType: true,
      description: true,
      amount: true,
      isPaid: true,
      createdAt: true,
      updatedAt: true,
      vehicle: {
        select: {
          id: true,
          plate_number: true,
          owner_name: true,
          company: true,
          category: true
        }
      },
      session: {
        select: {
          id: true,
          entry_time: true,
          exit_time: true,
          duration: true,
          price: true
        }
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
    reports,
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
 * Get report by ID
 * @param {string} reportId - Report ID
 * @returns {Promise<Object>} - Report data
 */
const getReportById = async (reportId) => {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: {
      id: true,
      reportType: true,
      description: true,
      amount: true,
      isPaid: true,
      createdAt: true,
      updatedAt: true,
      vehicle: {
        select: {
          id: true,
          plate_number: true,
          owner_name: true,
          company: true,
          category: true,
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
      session: {
        select: {
          id: true,
          entry_time: true,
          exit_time: true,
          duration: true,
          price: true,
          hasLeft: true
        }
      }
    }
  });

  if (!report) {
    throw new NotFoundError('Report not found');
  }

  return report;
};

/**
 * Get reports by vehicle ID
 * @param {string} vehicleId - Vehicle ID
 * @param {number} page - Page number
 * @param {number} limit - Number of reports per page
 * @returns {Promise<Object>} - Paginated reports for the vehicle
 */
const getReportsByVehicleId = async (vehicleId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId }
  });

  if (!vehicle) {
    throw new NotFoundError('Vehicle not found');
  }

  const totalCount = await prisma.report.count({
    where: { vehicleId }
  });

  const reports = await prisma.report.findMany({
    where: { vehicleId },
    select: {
      id: true,
      reportType: true,
      description: true,
      amount: true,
      isPaid: true,
      createdAt: true,
      updatedAt: true,
      session: {
        select: {
          id: true,
          entry_time: true,
          exit_time: true,
          duration: true,
          price: true
        }
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
    reports,
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
 * Export reports based on date range
 * @param {string} format - Export format ('csv' or 'excel')
 * @param {string} startDate - Start date (ISO string)
 * @param {string} endDate - End date (ISO string)
 * @returns {Promise<Buffer|string>} - File content as Buffer or string
 */
const exportReports = async (format = 'csv', startDate = null, endDate = null) => {
  const whereClause = {};
  
  if (startDate || endDate) {
    whereClause.createdAt = {};
    
    if (startDate) {
      whereClause.createdAt.gte = new Date(startDate);
    }
    
    if (endDate) {
      whereClause.createdAt.lte = new Date(endDate);
    }
  }

  const reports = await prisma.report.findMany({
    where: whereClause,
    select: {
      id: true,
      reportType: true,
      description: true,
      amount: true,
      isPaid: true,
      createdAt: true,
      updatedAt: true,
      vehicle: {
        select: {
          plate_number: true,
          owner_name: true,
          company: true,
          category: true
        }
      },
      session: {
        select: {
          entry_time: true,
          exit_time: true,
          duration: true,
          price: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedReports = reports.map(report => ({
    ReportID: report.id,
    ReportType: report.reportType,
    Description: report.description,
    Amount: report.amount,
    IsPaid: report.isPaid ? 'Yes' : 'No',
    PlateNumber: report.vehicle?.plate_number || 'N/A',
    VehicleOwner: report.vehicle?.owner_name || 'N/A',
    Company: report.vehicle?.company || 'N/A',
    Category: report.vehicle?.category || 'N/A',
    EntryTime: report.session?.entry_time ? new Date(report.session.entry_time).toLocaleString() : 'N/A',
    ExitTime: report.session?.exit_time ? new Date(report.session.exit_time).toLocaleString() : 'N/A',
    Duration: report.session?.duration || 'N/A',
    SessionPrice: report.session?.price || 'N/A',
    CreatedAt: new Date(report.createdAt).toLocaleString(),
    UpdatedAt: new Date(report.updatedAt).toLocaleString()
  }));

  if (format === 'csv') {
    const fields = [
      'ReportID', 'ReportType', 'Description', 'Amount', 'IsPaid',
      'PlateNumber', 'VehicleOwner', 'Company', 'Category',
      'EntryTime', 'ExitTime', 'Duration', 'SessionPrice',
      'CreatedAt', 'UpdatedAt'
    ];
    
    const parser = new Parser({ fields });
    return parser.parse(formattedReports);
  } else {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reports');
    
    worksheet.columns = [
      { header: 'Report ID', key: 'ReportID', width: 36 },
      { header: 'Report Type', key: 'ReportType', width: 15 },
      { header: 'Description', key: 'Description', width: 30 },
      { header: 'Amount', key: 'Amount', width: 10 },
      { header: 'Is Paid', key: 'IsPaid', width: 8 },
      { header: 'Plate Number', key: 'PlateNumber', width: 15 },
      { header: 'Vehicle Owner', key: 'VehicleOwner', width: 20 },
      { header: 'Company', key: 'Company', width: 20 },
      { header: 'Category', key: 'Category', width: 15 },
      { header: 'Entry Time', key: 'EntryTime', width: 20 },
      { header: 'Exit Time', key: 'ExitTime', width: 20 },
      { header: 'Duration', key: 'Duration', width: 12 },
      { header: 'Session Price', key: 'SessionPrice', width: 12 },
      { header: 'Created At', key: 'CreatedAt', width: 20 },
      { header: 'Updated At', key: 'UpdatedAt', width: 20 }
    ];

    worksheet.getRow(1).font = { bold: true };
    
    worksheet.addRows(formattedReports);
    
    return await workbook.xlsx.writeBuffer();
  }
};

module.exports = {
  getAllReports,
  getReportById,
  getReportsByVehicleId,
  exportReports
};