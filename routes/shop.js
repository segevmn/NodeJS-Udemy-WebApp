const express = require('express');

const productsController = require('../controllers/products');
const cartController = require('../controllers/cart');
const ordersController = require('../controllers/orders');
const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', productsController.getProducts);

router.get('/cart', isAuth, cartController.getCart);

router.post('/cart', isAuth, cartController.postCart);

router.post('/cart-delete-item', isAuth, cartController.postCartDeleteItem);

router.get('/orders', isAuth, ordersController.getOrders);

// router.post('/create-order', isAuth, ordersController.postOrder);

router.get('/product-details/:productId', productsController.getProduct);

router.get('/orders/:orderId', isAuth, ordersController.getInvoice);

router.get('/checkout', isAuth, shopController.getCheckout);

router.get('/checkout/success', isAuth, ordersController.postOrder);

router.get('/checkout/cancel', shopController.getCheckout);

module.exports = router;
