
import { Router } from "express";
import { EventController } from "./event.controller.js";

const router = Router();

router.post("/", EventController.createEvent);
router.get("/", EventController.getAllEvent);
router.get("/:id", EventController.getEventById);
router.patch("/:id", EventController.updateEvent);
router.delete("/:id", EventController.deleteEvent);

export const EventRoutes = router;
