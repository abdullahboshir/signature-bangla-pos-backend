
import { Router } from "express";
import { AuditLogController } from "./audit-log.controller.js";

const router = Router();

router.post("/", AuditLogController.createAuditLog);
router.get("/", AuditLogController.getAllAuditLog);
router.get("/:id", AuditLogController.getAuditLogById);
router.delete("/:id", AuditLogController.deleteAuditLog);

export const AuditLogRoutes = router;
