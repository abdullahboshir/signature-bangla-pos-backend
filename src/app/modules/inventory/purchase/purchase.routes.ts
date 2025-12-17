import express from 'express';
import { PurchaseController } from './purchase.controller.ts';


const router = express.Router();

router.post('/create', PurchaseController.create);
router.get('/', PurchaseController.getAll);
router.get('/:id', PurchaseController.getById);
router.patch('/:id', PurchaseController.update);
router.delete('/:id', PurchaseController.delete);

export const PurchaseRoutes = router;
