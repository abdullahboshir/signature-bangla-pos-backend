import { Router } from 'express';
import { createAdjustmentController, getAdjustmentsController, getLedgerController } from './adjustment/adjustment.controller.js';
import { getAllStockLevelsController, getProductStockLevelController } from './stock/stock.controller.ts';
// import { protect, restrictTo } from '../../auth/auth.middleware'; // Assuming auth middlewares exist

const router = Router();

// Adjustments
router.post('/adjustments', createAdjustmentController); // Add protect/restrictTo later
router.get('/adjustments', getAdjustmentsController);

// Ledger
router.get('/ledger', getLedgerController);

// Stock Levels
router.get('/stock-levels', getAllStockLevelsController);
router.get('/product/:productId', getProductStockLevelController);

export const InventoryRoutes = router;
