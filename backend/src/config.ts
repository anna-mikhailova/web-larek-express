import * as dotenv from 'dotenv';

dotenv.config();

export const {
  PORT = '3000',
  MONGODB_URI = 'mongodb://127.0.0.1:27017/weblarek',
  ORIGIN_ALLOW = 'http://localhost',
  AUTH_ACCESS_TOKEN_SECRET = 'dev_access_secret',
  AUTH_REFRESH_TOKEN_SECRET = 'dev_refresh_secret',
  AUTH_ACCESS_TOKEN_EXPIRY = '10m',
  AUTH_REFRESH_TOKEN_EXPIRY = '7d',
  UPLOAD_PATH = 'images',
  UPLOAD_PATH_TEMP = 'temp',
} = process.env;
