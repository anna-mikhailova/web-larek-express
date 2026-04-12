import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
}

const errorHandler = (err: AppError, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode ?? 500;
  const message = statusCode === 500 ? 'На сервере произошла ошибка' : err.message;

  res.status(statusCode).json({ message });
};

export default errorHandler;
