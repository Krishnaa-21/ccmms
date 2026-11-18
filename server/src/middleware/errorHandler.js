/**
 * Centralized API Error Handling Middleware
 * Consistent error format: { success: false, message, errors }
 */
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || (err.details ? err.details : null);

  // Log error stack in development
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[API Error] ${req.method} ${req.originalUrl}:`, {
      status: statusCode,
      message,
      errors: errors || undefined,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: errors || undefined,
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
}

export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found`,
    errors: null,
    timestamp: new Date().toISOString()
  });
}
