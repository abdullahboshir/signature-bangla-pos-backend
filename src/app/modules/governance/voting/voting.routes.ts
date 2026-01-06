import { Router } from "express";
import { VotingController } from "./voting.controller.ts";
import auth from "@core/middleware/auth.ts";

const router = Router();

router.post("/", auth(), VotingController.createProposal);
router.get("/", auth(), VotingController.getAllProposals);
router.post("/:id/vote", auth(), VotingController.castVote);
router.patch("/:id/status", auth(), VotingController.updateStatus);

export const VotingRoutes = router;
