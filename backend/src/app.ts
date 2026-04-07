import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { errors } from 'celebrate';
import productRouter from './routes/product';
import orderRouter from './routes/order';
import path from 'path';
import NotFoundError from './errors/not-found-error';
import errorHandler from './middlewares/error-handler';
import { requestLogger, errorLogger } from './middlewares/logger';


mongoose.connect('mongodb://127.0.0.1:27017/weblarek');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(requestLogger);

app.use('/product', productRouter);
app.use('/order', orderRouter);
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError('Маршрут не найден'));
});

app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

app.listen(3000, () => { console.log('listening on port 3000'); });
