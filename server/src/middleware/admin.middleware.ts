import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { UserRole } from '../entities/User';

export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized - Please login' });
    return;
  }

  if (req.user.role !== UserRole.ADMIN) {
    res.status(403).json({ message: 'Forbidden - Admin access required' });
    return;
  }

  next();
};
