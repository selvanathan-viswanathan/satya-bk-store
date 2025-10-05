const logger = require('../logger');

module.exports = (err, req, res, next) => {
  logger.error(err.message || 'Server error', { stack: err.stack });
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal Server Error' });
};
