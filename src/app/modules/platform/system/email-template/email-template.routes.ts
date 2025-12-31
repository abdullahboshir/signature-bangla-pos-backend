
import { Router } from "express";
import { EmailTemplateController } from "./email-template.controller.js";

const router = Router();

router.post("/", EmailTemplateController.createEmailTemplate);
router.get("/", EmailTemplateController.getAllEmailTemplate);
router.get("/:id", EmailTemplateController.getEmailTemplateById);
router.patch("/:id", EmailTemplateController.updateEmailTemplate);
router.delete("/:id", EmailTemplateController.deleteEmailTemplate);

export const EmailTemplateRoutes = router;
