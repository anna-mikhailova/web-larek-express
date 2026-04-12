import { Router } from 'express';
import fileMiddleware from '../middlewares/file';
import uploadFile from '../controllers/upload';
import authMiddleware from '../middlewares/auth';

const router = Router();

router.post('/', authMiddleware, fileMiddleware.single('file'), uploadFile);

export default router;
