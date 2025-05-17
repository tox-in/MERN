const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

transporter.verify()
    .then(() => logger.info('SMTP server is ready to send emails'))
    .catch((error) => logger.error(`Error connecting to SMTP server: ${error.message}`));

    
module.exports = transporter;