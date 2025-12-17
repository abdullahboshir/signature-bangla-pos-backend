import status from "http-status";

import {
  authMeService,
  loginService,
  logoutService,
  refreshTokenAuthService,
} from "./auth.service.js";
import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import appConfig from "@shared/config/app.config.ts";


export const loginController = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const data = await loginService(email, password);

  const { accessToken, refreshToken, needsPasswordChange, user } = data;

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, // Explicitly false for debugging
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  ApiResponse.success(res, {
    success: true,
    statusCode: status.OK,
    message: "User Login has been Successfully",
    data: { accessToken, needsPasswordChange, user },
  });
});

export const refreshTokenController = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  console.log("DEBUG: Refresh Token Cookie:", refreshToken ? "Present" : "Missing");

  const result = await refreshTokenAuthService(refreshToken);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, // Explicitly false for debugging
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  ApiResponse.success(res, {
    success: true,
    statusCode: status.OK,
    message: "Access Token has been retrieved successfully",
    data: result,
  });
});

export const authMeController = catchAsync(async (req, res) => {
  const userInfo = req.user;

  const result = await authMeService(userInfo);

  ApiResponse.success(res, {
    success: true,
    statusCode: status.OK,
    message: "Access Token has been retrieved successfully",
    data: result,
  });
});

export const logoutController = catchAsync(async (_req, res) => {
  await logoutService();
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false, // Match login/refresh
    sameSite: "lax", // Match login/refresh
    path: "/",
  });
  ApiResponse.success(res, {
    success: true,
    statusCode: 200,
    message: "User has been logged out successfully",
    data: null,
  });
});
