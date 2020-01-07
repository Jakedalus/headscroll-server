function errorHandler(error, req, res, next) {
  console.log('/handlers/errors, errorHandler:', error, req.body);
  return res.status(error.status || 500).json({
    error: {
      message: error.message || 'Oops! Something went wrong.'
    }
  });
}

module.exports = errorHandler;