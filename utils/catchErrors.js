exports.err500 = (err, next, statusCode = 500) => {
  const error = err;
  error.httpStatusCode = statusCode;
  return next(error);
};
