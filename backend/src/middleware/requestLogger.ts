import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      timestamp,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
    };

    // Use structured logging in production
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(logData));
    } else {
      const colorCode = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
      const resetCode = '\x1b[0m';
      console.log(
        `${colorCode}${req.method} ${req.originalUrl} ${res.statusCode}${resetCode} - ${duration}ms`
      );
    }
  });

  next();
}