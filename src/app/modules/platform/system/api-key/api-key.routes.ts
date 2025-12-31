
import { Router } from "express";
import { APIKeyController } from "./api-key.controller.js";

const router = Router();

router.post("/", APIKeyController.createAPIKey);
router.get("/", APIKeyController.getAllAPIKey);
router.get("/:id", APIKeyController.getAPIKeyById);
router.patch("/:id/revoke", APIKeyController.revokeAPIKey);
router.delete("/:id", APIKeyController.deleteAPIKey);

export const APIKeyRoutes = router;
