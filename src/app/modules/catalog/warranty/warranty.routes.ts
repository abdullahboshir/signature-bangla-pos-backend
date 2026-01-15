import express from "express";

import { authorize } from "@core/middleware/authorize.ts";
import { PermissionSourceObj, PermissionActionObj } from "@app/modules/iam/index.js";
import { WarrantyController } from "./warranty.controller.ts";
import { WarrantyValidation } from "./warranty.validation.ts";
import { validateRequest } from "@core/middleware/validateRequest.ts";

const router = express.Router();

router.post(
  "/",
  authorize(PermissionSourceObj.warranty, PermissionActionObj.create),
  validateRequest(WarrantyValidation.createWarranty),
  WarrantyController.createWarranty
);

router.get(
  "/",
  authorize(PermissionSourceObj.warranty, PermissionActionObj.view),
  WarrantyController.getAllWarranties
);

router.get(
  "/:id",
  authorize(PermissionSourceObj.warranty, PermissionActionObj.view),
  WarrantyController.getSingleWarranty
);

router.patch(
  "/:id",
  authorize(PermissionSourceObj.warranty, PermissionActionObj.update),
  validateRequest(WarrantyValidation.updateWarranty),
  WarrantyController.updateWarranty
);

router.delete(
  "/:id",
  authorize(PermissionSourceObj.warranty, PermissionActionObj.delete),
  WarrantyController.deleteWarranty
);

export const WarrantyRoutes = router;
