import { Router } from "express";
import { ComplianceController } from "./compliance.controller.ts";
import auth from "@core/middleware/auth.ts";

const router = Router();

router.post("/", auth(), ComplianceController.uploadDocument);
router.get("/", auth(), ComplianceController.getAllDocuments);
router.delete("/:id", auth(), ComplianceController.deleteDocument);

export const ComplianceRoutes = router;
