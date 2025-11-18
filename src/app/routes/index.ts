import { Router } from "express";
import v1Routes from "./v1/index.js";
import status from "http-status";


const router = Router();



router.use("/v1", v1Routes);

router.get("health", (_req, res) => {
  res.status(status.OK).json({
    status: "Success",
    message: "Server is running",
    timestamp: Date.now().toLocaleString(),
  });
});


export default router;
