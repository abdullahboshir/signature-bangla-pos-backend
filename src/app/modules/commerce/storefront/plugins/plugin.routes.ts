
import { Router } from "express";
import { PluginController } from "./plugin.controller.js";

const router = Router();

router.post("/", PluginController.createPlugin);
router.get("/", PluginController.getAllPlugin);
router.get("/:id", PluginController.getPluginById);
router.patch("/:id", PluginController.updatePlugin);
router.delete("/:id", PluginController.deletePlugin);

export const PluginRoutes = router;
