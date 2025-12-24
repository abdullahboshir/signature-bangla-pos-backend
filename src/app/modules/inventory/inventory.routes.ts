import { Router } from 'express';
import { createAdjustmentController, getAdjustmentsController, getLedgerController } from './adjustment/adjustment.controller.js';
// import { protect, restrictTo } from '../../auth/auth.middleware'; // Assuming auth middlewares exist

const router = Router();

// Adjustments
router.post('/adjustments', createAdjustmentController); // Add protect/restrictTo later
router.get('/adjustments', getAdjustmentsController);

// Ledger
router.get('/ledger', getLedgerController);

// Stock Levels
import { getAllStockLevelsController } from '../catalog/product/product-inventory/product-inventory.controller.js';
router.get('/stock-levels', getAllStockLevelsController);

export const InventoryRoutes = router;
