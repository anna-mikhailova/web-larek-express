import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UnauthorizedError from '../errors/unauthorized-error';

declare global {
  namespace Express {
    interface Request {
      user?: { _id: string };
    }
  }
}

const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }
  const token = authorization.slice(7);
  try {
    const payload = jwt.verify(token, process.env.AUTH_ACCESS_TOKEN_SECRET || '') as { _id: string };
    req.user = { _id: payload._id };
    return next();
  } catch {
    return next(new UnauthorizedError('Необходима авторизация'));
  }
};

export default authMiddleware;
