function errorHandler(err, req, res, next) {
  const body = { message: err.message || "Internal Server Error" };

  // détails de validation (ex: validateProduct)
  if (Array.isArray(err.details) && err.details.length > 0) {
    body.details = err.details;
  }

  res.status(err.statusCode || 500).json(body);
}

module.exports = errorHandler;