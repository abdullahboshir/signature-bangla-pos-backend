import { Router } from "express";
import { ShareholderController } from "./shareholder.controller.ts";
import auth from "@core/middleware/auth.ts";

const router = Router();

router.post(
    "/",
    auth(), // Should add strict permission: GOVERNANCE_SHAREHOLDER.MANAGE
    ShareholderController.createShareholder
);

router.get(
    "/",
    auth(),
    ShareholderController.getAllShareholders
);

router.patch(
    "/:id",
    auth(),
    ShareholderController.updateShareholder
);

router.delete(
    "/:id",
    auth(),
    ShareholderController.deleteShareholder
);

export const ShareholderRoutes = router;
