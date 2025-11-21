import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;
  
  // Check if request is authenticated
  const authReq = req as AuthenticatedRequest;
  const userRole = authReq.user?.role || 'UNAUTHENTICATED';
  
  // Log unauthorized access attempts for protected routes (exclude auth endpoints)
  if (!authReq.user && url.startsWith('/api/') && !url.startsWith('/api/auth/')) {
    }
  
  next();
};

// Error logging middleware
export const errorLogger = (err: any, req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;
  
  next(err);
};
