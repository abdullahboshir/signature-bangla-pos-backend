import express from "express";
const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import globalErrorHandler from "./src/core/middleware/global-error-handler.js";
import notFound from "./src/core/middleware/not-found.js";
import router from "./src/app/routes/index.js";
import status from "http-status";

// parsers
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

const allowedOrigins = ["http://localhost:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error(`❌ CORS Blocked: Origin ${origin} not allowed`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use("/api", router);

app.get("/", (_req, res) => {
  res.status(status.OK).json({
    message: "Welcome to Banijjik API 🚀",
    status: "Running",
    version: "v1",
  });
});

app.use(globalErrorHandler);
app.use(notFound as any);

export default app;
