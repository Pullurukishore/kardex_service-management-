import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  // Log incoming request
  // Override res.json to log response time
  const originalJson = res.json;
  res.json = function(body: any) {
    const duration = Date.now() - startTime;
    const statusEmoji = res.statusCode >= 400 ? '❌' : '✅';
    
    return originalJson.call(this, body);
  };
  
  // Override res.status to catch errors
  const originalStatus = res.status;
  res.status = function(code: number) {
    if (code >= 400) {
      const duration = Date.now() - startTime;
      }
    return originalStatus.call(this, code);
  };
  
  next();
};
