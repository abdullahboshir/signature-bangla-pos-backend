import express from 'express';
import { PurchaseController } from './purchase.controller.ts';
import { validateRequest } from '../../../core/middleware/validateRequest.ts';
import { createPurchaseZodSchema, updatePurchaseZodSchema } from './purchase.validation.ts';



const router = express.Router();

router.post('/create', validateRequest(createPurchaseZodSchema as any), PurchaseController.create);
router.get('/', PurchaseController.getAll);
router.get('/:id', PurchaseController.getById);
router.patch('/:id', validateRequest(updatePurchaseZodSchema as any), PurchaseController.update);
router.delete('/:id', PurchaseController.delete);

export const PurchaseRoutes = router;
