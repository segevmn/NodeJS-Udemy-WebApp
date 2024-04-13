const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');

const User = require('../models/user');
const { getMessgae } = require('../utils/messages');
const { validateAuthGet, validateAuthPost } = require('../utils/validations');
const { senderMail } = require('../constants');
const delieverMail = require('../config/mailer');
const { err500 } = require('../utils/catchErrors');

exports.getLogin = (req, res, next) => {
  const msg = getMessgae(req.flash('error'));
  const input = { email: '', password: '' };

  validateAuthGet(res, 'auth/login', '/login', 'Login', msg, input);
};

exports.getSignup = (req, res, next) => {
  const msg = getMessgae(req.flash('error'));
  const input = { email: '', password: '', confirmPassword: '' };

  validateAuthGet(res, 'auth/signup', '/signup', 'Signup', msg, input);
};

// async
exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const input = { email: email, password: password };
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return validateAuthPost(
      res,
      'auth/login',
      '/login',
      'Login',
      errors.array()[0].msg,
      input,
      errors.array()
    );
  }

  // try {
  //   const user = await User.findOne({ email: email });
  //   if (!user) {
  //     return validateAuthPost(
  //       res,
  //       'auth/login',
  //       '/login',
  //       'Login',
  //       'Invalid email or password',
  //       input,
  //       [{ param: 'email', param: 'password' }]
  //     );
  //   }
  //   try {
  //     const matchPasswords = await bcrypt.compare(password, user.password);
  //     if (matchPasswords) {
  //       req.session.isLoggedIn = true;
  //       req.session.user = user;
  //       return await req.session.save(err => {
  //         res.redirect('/');
  //       });
  //     }
  //   } catch (innerErr) {
  //     res.redirect('/login');
  //   }
  // } catch (outerErr) {
  //   return err500(outerErr, next);
  // }

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        return validateAuthPost(
          res,
          'auth/login',
          '/login',
          'Login',
          'Invalid email or password',
          input,
          [{ param: 'email', param: 'password' }]
        );
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              res.redirect('/');
            });
          }
          return validateAuthPost(
            res,
            'auth/login',
            '/login',
            'Login',
            'Invalid email or password',
            input,
            [{ param: 'email', param: 'password' }]
          );
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch(err => {
      return err500(err, next);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    res.redirect('/');
  });
};

// async
exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const input = {
    email: email,
    password: password,
    confirmPassword: req.body.confirmPassword,
  };
  const emailOptions = {
    to: email,
    from: senderMail,
    subject: 'Signup succeeded!',
    html: '<h1>You successfully signed up!</h1>',
  };
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return validateAuthPost(
      res,
      'auth/signup',
      '/signup',
      'Signup',
      errors.array()[0].msg,
      input,
      errors.array()
    );
  }

  // try {
  //   const hashedPassword = await bcrypt.hash(password, 12);
  //   const user = new User({
  //     email: email,
  //     password: hashedPassword,
  //     cart: { items: [] },
  //   });
  //   await user.save();
  //   res.redirect('/login');
  //   await delieverMail(emailOptions);
  // } catch (err) {
  //   err500(err, next);
  // }

  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then(result => {
      res.redirect('/login');
      return delieverMail(emailOptions);
    })
    .catch(err => {
      return err500(err, next);
    });
};

exports.getReset = (req, res, next) => {
  const msg = getMessgae(req.flash('error'));
  res.render('auth/reset-password', {
    path: '/reset-password',
    pageTitle: 'Reset Password',
    errMessage: msg,
  });
};

// async
exports.postReset = (req, res, next) => {
  // try {
  //   crypto.randomBytes(32, async (err, buffer) => {
  //     if (err) {
  //       res.redirect('/reset-password');
  //     }
  //     const token = buffer.toString('hex');
  //     const user = await User.findOne({ email: req.body.email });

  //     if (!user) {
  //       req.flash('error', 'No account with such am email was found');
  //       return res.redirect('/reset-password');
  //     }

  //     user.resetToken = token;
  //     user.resetTokenExpiration = Date.now() + 3600000;
  //     await user.save();

  //     const emailOptions = {
  //       to: req.body.email,
  //       from: senderMail,
  //       subject: 'Password Reset',
  //       html: `<p>You requested a password reset</p>
  //       <p>Click this <a href="http://localhost:3000/reset-password/${token}">link</a> to set a new password</p>`,
  //     };
  //     res.redirect('/');
  //     await delieverMail(emailOptions);
  //   });
  // } catch (err) {
  //   err500(err, next);
  // }

  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      res.redirect('/reset-password');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash('error', 'No account with such am email was found');
          return res.redirect('/reset-password');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(result => {
        const emailOptions = {
          to: req.body.email,
          from: senderMail,
          subject: 'Password Reset',
          html: `<p>You requested a password reset</p>
          <p>Click this <a href="http://localhost:3000/reset-password/${token}">link</a> to set a new password</p>`,
        };
        res.redirect('/');
        return delieverMail(emailOptions);
      })
      .catch(err => {
        return err500(err, next);
      });
  });
};

// async
exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;

  // try {
  //   const user = await User.findOne({
  //     resetToken: token,
  //     resetTokenExpiration: { $gt: Date.now() },
  //   });
  //   const msg = getMessgae(req.flash('error'));
  //   res.render('auth/new-password', {
  //     path: '/new-password',
  //     pageTitle: 'Enter New Password',
  //     errMessage: msg,
  //     userId: user._id.toString(),
  //     passwordToken: token,
  //   });
  // } catch (err) {
  //   err500(err, next);
  // }

  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then(user => {
      const msg = getMessgae(req.flash('error'));
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'Enter New Password',
        errMessage: msg,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch(err => {
      return err500(err, next);
    });
};

// async
exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  // try {
  //   const user = await User.findOne({
  //     resetToken: passwordToken,
  //     resetTokenExpiration: { $gt: Date.now() },
  //     _id: userId,
  //   });
  //   resetUser = user;
  //   const hashedPassword = await bcrypt.hash(newPassword, 12);
  //   resetUser.password = hashedPassword;
  //   resetUser.resetToken = undefined;
  //   resetUser.resetTokenExpiration = undefined;
  //   await resetUser.save();
  //   res.redirect('/login');
  // } catch (err) {
  //   err500(err, next);
  // }

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => {
      return err500(err, next);
    });
};

// const getMsg = msg => {
//   let message = msg;
//   if (message.length > 0) {
//     mag = message[0];
//   } else {
//     message = null;
//   }
//   return message;
// };
