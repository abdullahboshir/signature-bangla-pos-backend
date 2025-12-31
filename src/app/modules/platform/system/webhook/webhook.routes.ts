
import { Router } from "express";
import { WebhookController } from "./webhook.controller.js";

const router = Router();

router.post("/", WebhookController.createWebhook);
router.get("/", WebhookController.getAllWebhook);
router.get("/:id", WebhookController.getWebhookById);
router.patch("/:id", WebhookController.updateWebhook);
router.delete("/:id", WebhookController.deleteWebhook);

export const WebhookRoutes = router;
