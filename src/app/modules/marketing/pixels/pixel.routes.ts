
import { Router } from "express";
import { PixelController } from "./pixel.controller.js";

const router = Router();

router.post("/", PixelController.createPixel);
router.get("/", PixelController.getAllPixel);
router.get("/:id", PixelController.getPixelById);
router.patch("/:id", PixelController.updatePixel);
router.delete("/:id", PixelController.deletePixel);

export const PixelRoutes = router;
