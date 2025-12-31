
import { Router } from "express";
import { LandingPageController } from "./landing-page.controller.js";

const router = Router();

router.post("/", LandingPageController.createLandingPage);
router.get("/", LandingPageController.getAllLandingPage);
router.get("/:id", LandingPageController.getLandingPageById);
router.patch("/:id", LandingPageController.updateLandingPage);
router.delete("/:id", LandingPageController.deleteLandingPage);

export const LandingPageRoutes = router;
