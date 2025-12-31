
import { Router } from "express";
import { AffiliateController } from "./affiliate.controller.js";

const router = Router();

router.post("/", AffiliateController.createAffiliate);
router.get("/", AffiliateController.getAllAffiliate);
router.get("/:id", AffiliateController.getAffiliateById);
router.patch("/:id", AffiliateController.updateAffiliate);
router.delete("/:id", AffiliateController.deleteAffiliate);

export const AffiliateRoutes = router;
