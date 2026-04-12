import { Request, Response, NextFunction } from 'express';
import { faker } from '@faker-js/faker';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { total, items } = req.body;

    const products = await Product.find({ _id: { $in: items } });

    if (products.length !== items.length) {
      return next(new BadRequestError('Один или несколько товаров не найдены'));
    }

    const unpricedProduct = products.find((p) => p.price === null || p.price === undefined);
    if (unpricedProduct) {
      return next(new BadRequestError('Один или несколько товаров не продаются (цена не указана)'));
    }

    const calculatedTotal = products.reduce((sum, p) => sum + (p.price as number), 0);
    if (calculatedTotal !== total) {
      return next(new BadRequestError(`Сумма заказа не совпадает: ожидается ${calculatedTotal}`));
    }

    const id = faker.string.uuid();

    return res.status(200).json({ id, total });
  } catch (error) {
    return next(error);
  }
};

export default createOrder;
