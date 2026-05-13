import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.session || !req.session.user) {
    res.status(401).json({ message: 'Unauthorized - Please login' });
    return;
  }

  req.user = req.session.user;
  next();
};
