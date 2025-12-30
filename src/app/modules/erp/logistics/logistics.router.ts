import express from "express";
import { courierController, LogisticsActionController } from "./logistics.controller.ts";
import moduleGuard from '@app/middlewares/moduleGuard.ts';

const router = express.Router();

router.use(moduleGuard('logistics'));

// Courier CRUD
router.post('/couriers', courierController.create.bind(courierController));
router.get('/couriers', courierController.getAll.bind(courierController));
router.get('/couriers/:id', courierController.getById.bind(courierController));
router.patch('/couriers/:id', courierController.update.bind(courierController));
router.delete('/couriers/:id', courierController.delete.bind(courierController));

// Shipment Actions
router.post('/shipments', LogisticsActionController.createShipment);

export const logisticsRoutes = router;
