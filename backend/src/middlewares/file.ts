import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

const UPLOAD_PATH_TEMP = process.env.UPLOAD_PATH_TEMP || 'temp';
const tempDir = path.join(__dirname, '../public', UPLOAD_PATH_TEMP);

fs.mkdirSync(tempDir, { recursive: true });

const allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/svg+xml'];
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg'];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, tempDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = crypto.randomBytes(4).toString('hex') + ext;
    cb(null, uniqueName);
  },
});

const fileFilter = (
  _req: Request,
  file: { mimetype: string; originalname: string },
  cb: FileFilterCallback,
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Допускаются только файлы изображений (jpg, png, gif, svg)'));
  }
};

export default multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter,
});
