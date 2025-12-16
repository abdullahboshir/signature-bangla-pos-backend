import { Router } from "express";
import { createOrderController, getAllOrdersController, getOrderByIdController, updateOrderStatusController } from "./order.controller.js";

const orderRoutes = Router();

orderRoutes.post("/create", createOrderController);
orderRoutes.get("/", getAllOrdersController);
orderRoutes.get("/:id", getOrderByIdController);
orderRoutes.patch("/:id/status", updateOrderStatusController);

export default orderRoutes;
