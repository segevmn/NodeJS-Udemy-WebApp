exports.validateAuthGet = (
  res,
  filePath,
  routePath,
  title,
  errMsg,
  input,
  errors = []
) => {
  return res.render(filePath, {
    path: routePath,
    pageTitle: title,
    errMessage: errMsg,
    oldInput: input,
    validationErrors: errors,
  });
};

exports.validateAuthPost = (
  res,
  filePath,
  routePath,
  title,
  errMsg,
  input,
  errors,
  statusCode = 422
) => {
  return res.status(statusCode).render(filePath, {
    path: routePath,
    pageTitle: title,
    errMessage: errMsg,
    oldInput: input,
    validationErrors: errors,
  });
};

exports.validateProdGet = (
  res,
  routePath,
  title,
  editStatus = false,
  product = {},
  errMsg = null,
  errStatus = false,
  errors = [],
  filePath = 'admin/edit-product'
) => {
  return res.render(filePath, {
    pageTitle: title,
    path: routePath,
    editing: editStatus,
    product: product,
    hasError: errStatus,
    errMessage: errMsg,
    validationErrors: errors,
  });
};

exports.validateProdPost = (
  res,
  routePath,
  title,
  product,
  errMsg,
  errors = [],
  editStatus = false,
  filePath = 'admin/edit-product',
  errStatus = true,
  statusCode = 422
) => {
  return res.status(statusCode).render(filePath, {
    pageTitle: title,
    path: routePath,
    editing: editStatus,
    hasError: errStatus,
    product: product,
    errMessage: errMsg,
    validationErrors: errors,
  });
};
