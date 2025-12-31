
import { Router } from "express";
import { SEOController } from "./seo.controller.js";

const router = Router();

router.post("/", SEOController.createSEO);
router.get("/", SEOController.getAllSEO);
router.get("/:id", SEOController.getSEOById);
router.patch("/:id", SEOController.updateSEO);
router.delete("/:id", SEOController.deleteSEO);

export const SEORoutes = router;
