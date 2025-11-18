import mongoose from "mongoose";
import appConfig from "../../../shared/config/app.config.js";


export const connectDB = async () => {
  if (!appConfig.db_url) {
    throw new Error("Database URL missing");
  }

  return mongoose.connect(appConfig.db_url);
};

export const disconnectDB = async () => {
  return mongoose.disconnect();
};