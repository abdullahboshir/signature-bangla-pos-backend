// Example for src\app\routes\v1\public\search.routes.ts
import { Router } from "express";

const router = Router();

// Search routes will be added here
router.get("/", (_req, res) => {
  res.json({ message: "Search endpoint" });
});

export default router;