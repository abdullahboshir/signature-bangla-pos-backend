
import { Router } from "express";
import { SMSTemplateController } from "./sms-template.controller.js";

const router = Router();

router.post("/", SMSTemplateController.createSMSTemplate);
router.get("/", SMSTemplateController.getAllSMSTemplate);
router.get("/:id", SMSTemplateController.getSMSTemplateById);
router.patch("/:id", SMSTemplateController.updateSMSTemplate);
router.delete("/:id", SMSTemplateController.deleteSMSTemplate);

export const SMSTemplateRoutes = router;
