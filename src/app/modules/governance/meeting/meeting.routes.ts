import { Router } from "express";
import { MeetingController } from "./meeting.controller.ts";
import auth from "@core/middleware/auth.ts";

const router = Router();

router.post("/", auth(), MeetingController.createMeeting);
router.get("/", auth(), MeetingController.getAllMeetings);
router.patch("/:id", auth(), MeetingController.updateMeeting);

export const MeetingRoutes = router;
