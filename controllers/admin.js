const { validationResult } = require('express-validator');

const Product = require('../models/product');
const User = require('../models/user');
const { validateProdGet, validateProdPost } = require('../utils/validations');
const { productsPerPage } = require('../constants');
const { err500 } = require('../utils/catchErrors');
const fileHelper = require('../utils/fileDelete');
const { pagination } = require('../utils/managePagination');

exports.getAddProduct = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect('/login');
  }
  validateProdGet(res, '/admin/add-product', 'Add Product');
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const productData = { title: title, price: price, description: description };
  const errors = validationResult(req);

  if (!image) {
    return validateProdPost(
      res,
      '/admin/add-product',
      'Add Product',
      productData,
      'Attached file is not an image.'
    );
  }

  if (!errors.isEmpty()) {
    return validateProdPost(
      res,
      '/admin/add-product',
      'Add Product',
      productData,
      errors.array()[0].msg,
      errors.array()
    );
  }

  const imageUrl = image.path;
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user,
  });

  product
    .save()
    .then(result => {
      res.redirect('/admin/products');
    })
    .catch(err => {
      return err500(err, next);
    });
};

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalProducts;
  Product.find({ userId: req.user._id })
    .then(products => {
      res.render('admin/product-list-admin', {
        pageTitle: 'Admin Products',
        path: '/admin/products',
        prods: products,
      });
    })
    .catch(err => {
      return err500(err, next);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) return res.redirect('/');

  const prodId = req.params.productId;

  Product.findById(prodId)
    .then(product => {
      if (!product) res.redirect('/');
      validateProdGet(
        res,
        '/admin/edit-product',
        'Edit Product',
        editMode,
        product
      );
    })
    .catch(err => {
      return err500(err, next);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;
  const productData = {
    title: updatedTitle,
    price: updatedPrice,
    description: updatedDesc,
    _id: prodId,
  };
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return validateProdPost(
      res,
      '/admin/edit-product',
      'Edit Product',
      productData,
      errors.array()[0].msg,
      errors.array(),
      true
    );
  }

  Product.findById(prodId)
    .then(product => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      if (image) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      return product.save().then(result => {
        res.redirect('/admin/products');
      });
    })
    .catch(err => {
      return err500(err, next);
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  let productUserId, deletedProduct;

  Product.findById(prodId)
    .then(product => {
      if (!product) return next(new Error('Product not found!'));
      deletedProduct = product;
      productUserId = product.userId.toString();
      return User.find({ 'cart.items.productId': prodId });
    })
    .then(users => {
      if (req.user._id.toString() !== productUserId) {
        return res.redirect('/');
      }
      users.forEach(user => {
        user.deleteCartItem(prodId);
      });
      fileHelper.deleteFile(deletedProduct.imageUrl);
      return Product.deleteOne({ _id: prodId, userId: req.user._id }).then(
        () => {
          res.status(200).json({ message: 'Success!' });
        }
      );
    })
    .catch(err => {
      res.status(500).json({ message: 'Failed to delete the product' });
    });
};
