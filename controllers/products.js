const Product = require('../models/product');
const { err500 } = require('../utils/catchErrors');
const { pagination } = require('../utils/managePagination');

exports.getProducts = (req, res, next) => {
  const query = Product.find();

  pagination(
    req,
    res,
    next,
    query,
    'shop/product-list',
    'All Products',
    '/products'
  );
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(prod => {
      res.render('shop/product-detail', {
        product: prod,
        pageTitle: prod.title,
        path: '/products',
      });
    })
    .catch(err => {
      return err500(err, next);
    });
};
