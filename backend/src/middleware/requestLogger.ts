import { Request, Response, NextFunction } from 'express';
import { createLogger } from '@ai-news-aggregator/shared';

const logger = createLogger('backend');

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
    // Unified logging format
    const level = res.statusCode >= 500 ? 'ERROR' : res.statusCode >= 400 ? 'WARN' : 'INFO';
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
    if (level === 'ERROR') logger.error(message, logData);
    else if (level === 'WARN') logger.warn(message, logData);
    else logger.info(message, logData);
  });

  next();
}