import { Router } from "express";
import { createOrderController, getAllOrdersController, getOrderByIdController, updateOrderStatusController } from "./order.controller.js";
import moduleGuard from "@app/middlewares/moduleGuard.ts";

const orderRoutes = Router();

// Apply Module Guard (Sales is part of ERP core)
orderRoutes.use(moduleGuard('erp'));

orderRoutes.post("/create", createOrderController);
orderRoutes.get("/", getAllOrdersController);
orderRoutes.get("/:id", getOrderByIdController);
orderRoutes.patch("/:id/status", updateOrderStatusController);

export default orderRoutes;
