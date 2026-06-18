// Centralized error-handling middleware
// Usage: place this after all routes to catch errors and provide a consistent response
const logger = require('./logger');

function errorHandler(err, req, res, next) {
  // Determine appropriate status code (default 500)
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);

  // Log the full error stack for debugging/monitoring
  logger.error(err.stack || err.message || err);

  // Return a JSON response with message and optional stack (hidden in production)
  res.json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
}

module.exports = errorHandler;
