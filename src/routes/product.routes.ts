import { Router } from 'express';
import {
    getProductsByCompanyId,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/product.controller';

const router = Router({ mergeParams: true });

// Nested routes under company
router.get('/', getProductsByCompanyId);
router.get('/:productId', getProductById);
router.post('/', createProduct);
router.put('/:productId', updateProduct);
router.delete('/:productId', deleteProduct);

export default router;
