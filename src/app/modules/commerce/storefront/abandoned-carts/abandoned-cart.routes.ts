
import { Router } from "express";
import { AbandonedCartController } from "./abandoned-cart.controller.js";

const router = Router();

router.post("/", AbandonedCartController.createAbandonedCart);
router.get("/", AbandonedCartController.getAllAbandonedCart);
router.get("/:id", AbandonedCartController.getAbandonedCartById);
router.patch("/:id", AbandonedCartController.updateAbandonedCart);
router.delete("/:id", AbandonedCartController.deleteAbandonedCart);

export const AbandonedCartRoutes = router;
