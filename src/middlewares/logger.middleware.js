import logger from '../utils/logger.js';

const loggerMiddleware = (req, res, next) => {
  logger.http(`${req.method} ${req.url} - IP: ${req.ip}`);

  if (req.body && Object.keys(req.body).length > 0) {
    const safeBody = { ...req.body };
    if (safeBody.password) safeBody.password = '***';
    if (safeBody.confirmPassword) safeBody.confirmPassword = '***';

    logger.debug(`Body: ${JSON.stringify(safeBody)}`);
  }

  if (req.query && Object.keys(req.query).length > 0) {
    logger.debug(`Query: ${JSON.stringify(req.query)}`);
  }

  const start = Date.now();

  const originalSend = res.send;
  res.send = function (body) {
    const responseTime = Date.now() - start;

    logger.http(`${req.method} ${req.url} - ${res.statusCode} - ${responseTime}ms`);

    if (res.statusCode >= 400) {
      logger.warn(`Error ${res.statusCode}: ${JSON.stringify(body)}`);
    }

    if (res.statusCode >= 500) {
      logger.error(`Server Error ${res.statusCode}: ${JSON.stringify(body)}`);
    }

    originalSend.call(this, body);
  };

  next();
};

const errorLogger = (err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    user: req.user ? req.user.email : 'anonymous'
  });

  next(err);
};

export { errorLogger, loggerMiddleware };

