
import { Router } from "express";
import { BackupController } from "./backup.controller.js";

const router = Router();

router.post("/", BackupController.createBackup);
router.get("/", BackupController.getAllBackup);
router.get("/:id", BackupController.getBackupById);
router.patch("/:id/restore", BackupController.restoreBackup);
router.delete("/:id", BackupController.deleteBackup);

export const BackupRoutes = router;
