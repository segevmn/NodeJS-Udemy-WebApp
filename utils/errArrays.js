const { body } = require('express-validator');

const User = require('../models/user');

exports.adminErrorsArray = [
  body('title', 'The title must be at least 5 characters long!')
    .isString()
    .isLength({ min: 5 })
    .trim(),
  body('price', 'Please enter a price').isFloat(),
  body('description', 'Description is too short')
    .isLength({ min: 10, max: 150 })
    .trim(),
];

exports.loginErrosArray = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail({ gmail_remove_dots: false }),
  body('password', 'Invalid password')
    .isLength({ min: 6 })
    .isAlphanumeric()
    .trim(),
];

exports.signupErrorsArray = [
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject('email already exists');
          }
        });
      })
      .normalizeEmail({ gmail_remove_dots: false }),
    body(
      'password',
      'Password must include only numbers and letters and at least 5 characters'
    )
      .isLength({ min: 6 })
      .isAlphanumeric()
      .trim(),
    body('confirmPassword')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match!');
        }
        return true;
      }),
  ],
];
