const Product = require('../models/product');
const { err500 } = require('../utils/catchErrors');

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'My Cart',
        products: products,
      });
    })
    .catch(err => {
      return err500(err, next);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      res.redirect('/cart');
    });
};

exports.postCartDeleteItem = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .deleteCartItem(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      return err500(err, next);
    });
};
