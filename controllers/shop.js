const stripe = require('stripe')(process.env.STRIPE_KEY);

const Product = require('../models/product');
const Order = require('../models/order');
const { pagination } = require('../utils/managePagination');
const { err500 } = require('../utils/catchErrors');

exports.getIndex = (req, res, next) => {
  const query = Product.find();

  pagination(req, res, next, query, 'shop/index', 'Shop', '/shop');
};

// 356. adding a checkout page
exports.getCheckout = (req, res, next) => {
  let products;
  let sum = 0;

  req.user
    .populate('cart.items.productId')
    .then(user => {
      products = user.cart.items;
      products.forEach(prod => {
        sum += +prod.quantity * prod.productId.price;
      });

      return stripe.checkout.sessions.create({
        // payment_method_types: ['card'],
        line_items: products.map(prod => {
          return {
            price_data: {
              currency: 'usd',
              unit_amount: parseInt(Math.ceil(prod.productId.price * 100)),
              product_data: {
                name: prod.productId.title,
                description: prod.productId.description,
              },
            },
            quantity: prod.quantity,
          };
        }),
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/checkout/success`,
        cancel_url: `${req.protocol}://${req.get('host')}/checkout/cancel`,
      });
    })
    .then(session => {
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products: products,
        productsSum: sum.toFixed(2),
        sessionId: session.id,
      });
    })
    .catch(err => {
      return err500(err, next);
    });
};

// 357. using stripe in your app

exports.getCheckoutSuccess = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items.map(item => {
        return { quantity: item.quantity, product: { ...item.productId._doc } };
      });

      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user._id,
        },
        products: products,
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      console.error(err);
      return err500(err, next);
    });
};
