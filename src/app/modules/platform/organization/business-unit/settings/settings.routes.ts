import express from "express";
import { BusinessUnitSettingsController } from "./settings.controller.js";
import { authorize } from "../../../../../../core/middleware/authorize.js";
import { PermissionSourceObj, PermissionActionObj } from "@app/modules/iam/permission/permission.constant.js";

const router = express.Router();

router.get(
    "/:businessUnitId",
    authorize(PermissionSourceObj.businessSetting, PermissionActionObj.view),
    BusinessUnitSettingsController.getSettings
);

router.patch(
    "/:businessUnitId",
    authorize(PermissionSourceObj.businessSetting, PermissionActionObj.update),
    BusinessUnitSettingsController.updateSettings
);

export const BusinessUnitSettingsRoutes = router;
