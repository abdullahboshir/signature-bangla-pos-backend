import express from 'express';
import { SupplierController } from './supplier.controller.ts';
import moduleGuard from '@app/middlewares/moduleGuard.ts';


const router = express.Router();

router.use(moduleGuard('erp'));

router.post('/create', SupplierController.create);
router.get('/', SupplierController.getAll);
router.get('/:id', SupplierController.getById);
router.patch('/:id', SupplierController.update);
router.delete('/:id', SupplierController.delete);

export const SupplierRoutes = router;
