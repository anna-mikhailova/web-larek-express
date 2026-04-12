import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import path from 'path';
import fs from 'fs';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';
import { UPLOAD_PATH, UPLOAD_PATH_TEMP } from '../config';

const moveFromTemp = (fileName: string) => {
  const filename = path.basename(fileName);
  const tempPath = path.join(__dirname, '../public', UPLOAD_PATH_TEMP, filename);
  const finalPath = path.join(__dirname, '../public', UPLOAD_PATH, filename);
  if (fs.existsSync(tempPath)) {
    fs.renameSync(tempPath, finalPath);
  }
};

export const getProducts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find({});
    return res.send({ items: products, total: products.length });
  } catch (error) {
    return next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      title, image, category, description, price,
    } = req.body;
    moveFromTemp(image.fileName);
    const product = await Product.create({
      title, image, category, description, price,
    });
    return res.status(201).send(product);
  } catch (error) {
    if (error instanceof MongooseError.ValidationError) {
      return next(new BadRequestError(error.message));
    }
    if (error instanceof Error && error.message.includes('E11000')) {
      return next(new ConflictError('Товар с таким названием уже существует'));
    }
    return next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const {
      title, image, category, description, price,
    } = req.body;
    if (image?.fileName) {
      moveFromTemp(image.fileName);
    }
    const updates = Object.fromEntries(
      Object.entries({
        title, image, category, description, price,
      }).filter(([, v]) => v !== undefined),
    );
    const product = await Product.findByIdAndUpdate(
      productId,
      updates,
      { new: true, runValidators: true },
    );
    if (!product) {
      return next(new NotFoundError('Товар не найден'));
    }
    return res.send(product);
  } catch (error) {
    if (error instanceof MongooseError.ValidationError) {
      return next(new BadRequestError(error.message));
    }
    if (error instanceof Error && error.message.includes('E11000')) {
      return next(new ConflictError('Товар с таким названием уже существует'));
    }
    return next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      return next(new NotFoundError('Товар не найден'));
    }
    return res.send(product);
  } catch (error) {
    return next(error);
  }
};
