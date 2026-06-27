export function errorHandler(err, req, res, next) {
  console.error('[ERROR]', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    status: err.statusCode || 500,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  const errorResponse = {
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: err.stack }),
    timestamp: new Date().toISOString(),
  };

  res.status(err.statusCode || 500).json(errorResponse);
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Not found',
    message: `The requested resource ${req.method} ${req.url} was not found`,
    timestamp: new Date().toISOString(),
  });
}