export function logger(req, res, next) {
  const startTime = Date.now();
  const { method, url, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;
    
    console.log('[REQUEST]', {
      timestamp: new Date().toISOString(),
      method,
      url,
      status: statusCode,
      duration: `${duration}ms`,
      ip,
      user: req.user?.id || 'anonymous',
    });
  });

  next();
}