import { Router } from 'express';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
} from '../controllers/product';
import { validateProductBody, validateProductId, validateProductUpdateBody } from '../middlewares/validation';
import authMiddleware from '../middlewares/auth';

const router = Router();

router.get('/', getProducts);
router.post('/', authMiddleware, validateProductBody, createProduct);
router.patch('/:productId', authMiddleware, validateProductId, validateProductUpdateBody, updateProduct);
router.delete('/:productId', authMiddleware, validateProductId, deleteProduct);

export default router;
