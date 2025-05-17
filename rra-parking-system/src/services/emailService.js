const transporter = require('../config/email');
const logger = require('../config/logger');

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text email content
 * @param {string} options.html - HTML email content (optional)
 * @returns {Promise<Object>} - Email sending result
 */
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `"RRA Parking System" <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || '',
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${options.to}`);
    return result;
  } catch (error) {
    logger.error(`Error sending email: ${error.message}`);
    throw error;
  }
};

/**
 * Send parking entry notification
 * @param {Object} vehicle - Vehicle information
 * @param {Object} session - Parking session information
 * @param {Object} owner - Vehicle owner information
 */
const sendEntryNotification = async (vehicle, session, owner) => {
  const subject = `RRA Parking: Vehicle Entry Notification - ${vehicle.plate_number}`;
  
  const text = `
    Dear ${owner.owner_name},

    Your vehicle with plate number ${vehicle.plate_number} has entered the RRA parking lot.

    Entry Time: ${session.entry_time.toLocaleString()}
    Vehicle Category: ${vehicle.category}

    You will receive another notification when your vehicle exits the parking lot.

    Thank you for using RRA Parking System.

    Best regards,
    RRA Parking Management Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">RRA Parking: Vehicle Entry Notification</h2>
      <p>Dear ${owner.owner_name},</p>
      <p>Your vehicle with plate number <strong>${vehicle.plate_number}</strong> has entered the RRA parking lot.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Entry Time:</strong> ${session.entry_time.toLocaleString()}</p>
        <p><strong>Vehicle Category:</strong> ${vehicle.category}</p>
      </div>
      
      <p>You will receive another notification when your vehicle exits the parking lot.</p>
      
      <p>Thank you for using RRA Parking System.</p>
      
      <p>Best regards,<br>RRA Parking Management Team</p>
    </div>
  `;

  return sendEmail({
    to: owner.email,
    subject,
    text,
    html
  });
};

/**
 * Send parking exit notification
 * @param {Object} vehicle - Vehicle information
 * @param {Object} session - Parking session information
 * @param {Object} owner - Vehicle owner information
 */
const sendExitNotification = async (vehicle, session, owner) => {
  const subject = `RRA Parking: Vehicle Exit Receipt - ${vehicle.plate_number}`;
  
  const text = `
    Dear ${owner.owner_name},

    Your vehicle with plate number ${vehicle.plate_number} has exited the RRA parking lot.

    Entry Time: ${session.entry_time.toLocaleString()}
    Exit Time: ${session.exit_time.toLocaleString()}
    Duration: ${session.duration} minutes
    Parking Fee: ${session.price} RWF
    
    Total Accumulated Debt: ${vehicle.debt} RWF

    Thank you for using RRA Parking System.

    Best regards,
    RRA Parking Management Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">RRA Parking: Vehicle Exit Receipt</h2>
      <p>Dear ${owner.owner_name},</p>
      <p>Your vehicle with plate number <strong>${vehicle.plate_number}</strong> has exited the RRA parking lot.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Entry Time:</strong> ${session.entry_time.toLocaleString()}</p>
        <p><strong>Exit Time:</strong> ${session.exit_time.toLocaleString()}</p>
        <p><strong>Duration:</strong> ${session.duration} minutes</p>
        <p><strong>Parking Fee:</strong> ${session.price} RWF</p>
        <p><strong>Total Accumulated Debt:</strong> ${vehicle.debt} RWF</p>
      </div>
      
      <p>Thank you for using RRA Parking System.</p>
      
      <p>Best regards,<br>RRA Parking Management Team</p>
    </div>
  `;

  return sendEmail({
    to: owner.email,
    subject,
    text,
    html
  });
};

/**
 * Send debt reminder notification
 * @param {Object} vehicle - Vehicle information
 * @param {Object} owner - Vehicle owner information
 */
const sendDebtReminder = async (vehicle, owner) => {
  const subject = `RRA Parking: Outstanding Debt Reminder - ${vehicle.plate_number}`;
  
  const text = `
    Dear ${owner.owner_name},

    This is a friendly reminder that you have an outstanding debt for your vehicle with plate number ${vehicle.plate_number}.

    Vehicle Category: ${vehicle.category}
    Outstanding Debt: ${vehicle.debt} RWF

    Please settle your debt at your earliest convenience to avoid additional charges.

    Thank you for your cooperation.

    Best regards,
    RRA Parking Management Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">RRA Parking: Outstanding Debt Reminder</h2>
      <p>Dear ${owner.owner_name},</p>
      <p>This is a friendly reminder that you have an outstanding debt for your vehicle with plate number <strong>${vehicle.plate_number}</strong>.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Vehicle Category:</strong> ${vehicle.category}</p>
        <p><strong>Outstanding Debt:</strong> ${vehicle.debt} RWF</p>
      </div>
      
      <p>Please settle your debt at your earliest convenience to avoid additional charges.</p>
      
      <p>Thank you for your cooperation.</p>
      
      <p>Best regards,<br>RRA Parking Management Team</p>
    </div>
  `;

  return sendEmail({
    to: owner.email,
    subject,
    text,
    html
  });
};

module.exports = {
  sendEmail,
  sendEntryNotification,
  sendExitNotification,
  sendDebtReminder
};