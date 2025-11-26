import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

type TConfig = {
  NODE_ENV: "development" | "production" | "test";
  port: string;
  db_url: string;
  default_pass: string;
  bcrypt_salt_rounds: string;
  jwt_access_secret: string;
  jwt_refresh_secret: string;
  jwt_access_expired_in: string;
  jwt_refresh_expired_in: string;
  reset_pass_ui_link: string;
  super_admin_pass: string;
  super_admin_email: string;
  cloud_name: string;
  cloud_api_key: string;
  cloud_api_secret: string;
  system_user_id: string;
  redis_url: string;

  // ⭐⭐ Only this line fixes everything
  [key: string]: string;
};

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("5000"),
  DB_URL: z.string(),
  DEFAULT_PASS: z.string().min(6),
  BCRYPT_SALT_ROUNDS: z.string().default("10"),
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_ACCESS_EXPIRED_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRED_IN: z.string().default("7d"),
  RESET_PASS_UI_LINK: z.string().url(),
  SUPER_ADMIN_EMAIL: z.string(),
  SUPER_ADMIN_PASS: z.string(),
  CLOUD_NAME: z.string(),
  CLOUD_API_KEY: z.string(),
  CLOUD_API_SECRET: z.string(),
  SYSTEM_USER_ID: z.string(),
  REDIS_URL: z.string(),
});

dotenv.config({ path: path.join((process.cwd(), ".env")) });

const parsedEnv = envSchema.parse(process.env);

const appConfig: TConfig = {
  NODE_ENV: parsedEnv.NODE_ENV,
  port: parsedEnv.PORT,
  db_url: parsedEnv.DB_URL,
  default_pass: parsedEnv.DEFAULT_PASS,
  bcrypt_salt_rounds: parsedEnv.BCRYPT_SALT_ROUNDS,
  jwt_access_secret: parsedEnv.JWT_ACCESS_SECRET,
  jwt_refresh_secret: parsedEnv.JWT_REFRESH_SECRET,
  jwt_access_expired_in: parsedEnv.JWT_ACCESS_EXPIRED_IN,
  jwt_refresh_expired_in: parsedEnv.JWT_REFRESH_EXPIRED_IN,
  reset_pass_ui_link: parsedEnv.RESET_PASS_UI_LINK,
  super_admin_pass: parsedEnv.SUPER_ADMIN_PASS,
  super_admin_email: parsedEnv.SUPER_ADMIN_EMAIL,
  cloud_name: parsedEnv.CLOUD_NAME,
  cloud_api_key: parsedEnv.CLOUD_API_KEY,
  cloud_api_secret: parsedEnv.CLOUD_API_SECRET,
  system_user_id: parsedEnv.SYSTEM_USER_ID,
  redis_url: parsedEnv.REDIS_URL,
};

export default appConfig;
