const Product = require('../models/product');
const { productsPerPage } = require('../constants');
const { err500 } = require('../utils/catchErrors');

exports.pagination = (
  req,
  res,
  next,
  initQuery,
  fileRoute,
  title,
  pathRoute
) => {
  const page = +req.query.page || 1;
  let totalProducts;

  return initQuery
    .countDocuments()
    .then(numOfProducts => {
      totalProducts = numOfProducts;
      return Product.find()
        .skip((page - 1) * productsPerPage)
        .limit(productsPerPage);
    })
    .then(products => {
      res.render(fileRoute, {
        pageTitle: title,
        path: pathRoute,
        prods: products,
        hasPreviousPage: page > 1,
        hasNextPage: productsPerPage * page < totalProducts,
        previousPage: page - 1,
        curerentPage: page,
        nextPage: page + 1,
        lastPage: Math.ceil(totalProducts / productsPerPage),
      });
    })
    .catch(err => {
      return err500(err, next);
    });
};
