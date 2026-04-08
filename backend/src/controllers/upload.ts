import { Request, Response, NextFunction } from 'express';
import BadRequestError from '../errors/bad-request-error';

const UPLOAD_PATH = process.env.UPLOAD_PATH || 'images';

const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new BadRequestError('Файл не загружен'));
  }
  return res.send({
    fileName: `/${UPLOAD_PATH}/${req.file.filename}`,
    originalName: req.file.originalname,
  });
};

export default uploadFile;
