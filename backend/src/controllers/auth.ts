import {
  Request, Response, NextFunction, CookieOptions,
} from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import { Error as MongooseError } from 'mongoose';
import User from '../models/user';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';
import UnauthorizedError from '../errors/unauthorized-error';
import {
  AUTH_ACCESS_TOKEN_SECRET,
  AUTH_REFRESH_TOKEN_SECRET,
  AUTH_ACCESS_TOKEN_EXPIRY,
  AUTH_REFRESH_TOKEN_EXPIRY,
} from '../config';

const ACCESS_SECRET = AUTH_ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = AUTH_REFRESH_TOKEN_SECRET;
const ACCESS_EXPIRY = AUTH_ACCESS_TOKEN_EXPIRY as ms.StringValue;
const REFRESH_EXPIRY = AUTH_REFRESH_TOKEN_EXPIRY as ms.StringValue;

const REFRESH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false,
  maxAge: ms(REFRESH_EXPIRY),
  path: '/',
};

const generateTokens = (_id: string) => ({
  accessToken: jwt.sign({ _id }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY }),
  refreshToken: jwt.sign({ _id }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY }),
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    const { accessToken, refreshToken } = generateTokens(String(user._id));
    user.tokens.push({ token: refreshToken });
    await user.save();
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
    return res.status(201).send({
      user: { email: user.email, name: user.name },
      success: true,
      accessToken,
    });
  } catch (error) {
    if (error instanceof MongooseError.ValidationError) {
      return next(new BadRequestError(error.message));
    }
    if (error instanceof Error && error.message.includes('E11000')) {
      return next(new ConflictError('Пользователь с таким email уже существует'));
    }
    return next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password +tokens');
    if (!user) {
      return next(new UnauthorizedError('Неверный email или пароль'));
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new UnauthorizedError('Неверный email или пароль'));
    }
    const { accessToken, refreshToken } = generateTokens(String(user._id));
    user.tokens.push({ token: refreshToken });
    await user.save();
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
    return res.send({
      user: { email: user.email, name: user.name },
      success: true,
      accessToken,
    });
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return next(new UnauthorizedError('Токен не передан'));
    }
    let payload: { _id: string };
    try {
      payload = jwt.verify(refreshToken, REFRESH_SECRET) as { _id: string };
    } catch {
      return next(new UnauthorizedError('Невалидный токен'));
    }
    const user = await User.findById(payload._id).select('+tokens');
    if (!user) {
      return next(new NotFoundError('Пользователь не найден'));
    }
    user.tokens = user.tokens.filter((t) => t.token !== refreshToken);
    await user.save();
    res.clearCookie('refreshToken', { path: '/' });
    return res.send({ success: true });
  } catch (error) {
    return next(error);
  }
};

export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return next(new UnauthorizedError('Токен не передан'));
    }
    let payload: { _id: string };
    try {
      payload = jwt.verify(refreshToken, REFRESH_SECRET) as { _id: string };
    } catch {
      return next(new UnauthorizedError('Токен недействителен или истёк'));
    }
    const user = await User.findById(payload._id).select('+tokens');
    if (!user) {
      return next(new NotFoundError('Пользователь не найден'));
    }
    const tokenExists = user.tokens.some((t) => t.token === refreshToken);
    if (!tokenExists) {
      return next(new UnauthorizedError('Токен недействителен или истёк'));
    }
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(String(user._id));
    user.tokens = user.tokens.filter((t) => t.token !== refreshToken);
    user.tokens.push({ token: newRefreshToken });
    await user.save();
    res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);
    return res.send({
      user: { email: user.email, name: user.name },
      success: true,
      accessToken,
    });
  } catch (error) {
    return next(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    const user = await User.findById(userId);
    if (!user) {
      return next(new NotFoundError('Пользователь не найден'));
    }
    return res.send({
      user: { email: user.email, name: user.name },
      success: true,
    });
  } catch (error) {
    return next(error);
  }
};
