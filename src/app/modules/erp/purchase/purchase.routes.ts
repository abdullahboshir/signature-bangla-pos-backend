import express from 'express';
import { PurchaseController } from './purchase.controller.ts';

import { createPurchaseZodSchema, updatePurchaseZodSchema } from './purchase.validation.ts';
import moduleGuard from '@app/middlewares/moduleGuard.ts';
import { validateRequest } from '../../../../core/middleware/validateRequest.js';


const router = express.Router();

router.use(moduleGuard('erp'));

router.post('/create', validateRequest(createPurchaseZodSchema as any), PurchaseController.create);
router.get('/', PurchaseController.getAll);
router.get('/:id', PurchaseController.getById);
router.patch('/:id', validateRequest(updatePurchaseZodSchema as any), PurchaseController.update);
router.delete('/:id', PurchaseController.delete);

export const PurchaseRoutes = router;
