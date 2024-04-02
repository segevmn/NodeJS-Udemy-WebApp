const nodemailer = require('nodemailer');

const { senderMail, applicationPassword } = require('../constants');

transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user: senderMail, pass: applicationPassword },
});

delieverMail = emailOptions => {
  return transporter.sendMail(emailOptions);
};

module.exports = delieverMail;
