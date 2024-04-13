const nodemailer = require('nodemailer');

const { senderMail, applicationPassword } = require('../constants');

transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user: senderMail, pass: applicationPassword },
});

// async
delieverMail = emailOptions => {
  // try {
  //   await transporter.sendMail(emailOptions);
  // } catch (err) {
  //   console.error('Error sending mail', err);
  //   throw err;
  // }

  return transporter.sendMail(emailOptions);
};

module.exports = delieverMail;
