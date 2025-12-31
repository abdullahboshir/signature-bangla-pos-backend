
import { Router } from "express";
import { AssetController } from "./asset.controller.js";

const router = Router();

router.post("/", AssetController.createAsset);
router.get("/", AssetController.getAllAsset);
router.get("/:id", AssetController.getAssetById);
router.patch("/:id", AssetController.updateAsset);
router.delete("/:id", AssetController.deleteAsset);

export const AssetRoutes = router;
