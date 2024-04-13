const Product = require('../models/product');
const { err500 } = require('../utils/catchErrors');

// async
exports.getCart = (req, res, next) => {
  // try {
  //   const user = await req.user.populate('cart.items.productId');
  //   const products = user.cart.items;
  //   res.render('shop/cart', {
  //     path: '/cart',
  //     pageTitle: 'My Cart',
  //     products: products,
  //   });
  // } catch (err) {
  //   err500(err, next);
  // }

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

// async
exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;

  // try {
  //   const product = await Product.findById(prodId);
  //   await req.user.addToCart(product);
  //   res.redirect('/cart');
  // } catch (err) {
  //   err500(err, next);
  // }

  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      res.redirect('/cart');
    });
};

// async
exports.postCartDeleteItem = (req, res, next) => {
  const prodId = req.body.productId;

  // try {
  //   await req.user.deleteCartItem(prodId);
  //   res.redirect('/cart');
  // } catch (err) {
  //   err500(err, next);
  // }

  req.user
    .deleteCartItem(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      return err500(err, next);
    });
};
