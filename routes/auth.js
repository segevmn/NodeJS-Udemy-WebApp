const express = require('express');

const authController = require('../controllers/auth');
const { loginErrosArray, signupErrorsArray } = require('../utils/errArrays');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login', loginErrosArray, authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignup);

router.post('/signup', signupErrorsArray, authController.postSignup);

router.get('/reset-password', authController.getReset);

router.post('/reset-password', authController.postReset);

router.get('/reset-password/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
