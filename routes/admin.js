const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const errorsArray = require('../utils/errArrays').adminErrorsArray;

const router = express.Router();

// /admin/add-product => GET

router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/add-product => POST

router.post(
  '/add-product',
  errorsArray,
  isAuth,
  adminController.postAddProduct
);

router.get('/products', isAuth, adminController.getProducts);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post(
  '/edit-product',
  errorsArray,
  isAuth,
  adminController.postEditProduct
);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;
