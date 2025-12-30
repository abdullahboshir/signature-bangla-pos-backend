import { Router } from 'express';
import {
    createProductController,
    getAllProductsController,
    getProductByIdController,
    updateProductController,
    deleteProductController
} from '@app/modules/commerce/catalog/product/product-core/product-core-controller.ts';

const router = Router();

router.post('/', createProductController);
router.get('/', getAllProductsController);
router.get('/:id', getProductByIdController);
router.patch('/:id', updateProductController);
router.delete('/:id', deleteProductController);

export default router;
