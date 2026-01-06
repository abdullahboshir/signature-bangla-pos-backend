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

  const { accessToken, refreshToken, needsPasswordChange } = data;

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: appConfig.NODE_ENV === "production",
    sameSite: appConfig.NODE_ENV === "production" ? "none" : "strict",
  });



  ApiResponse.success(
    res,
    { accessToken, needsPasswordChange },
    "User Login has been Successfully",
    status.OK
  );
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

  ApiResponse.success(
    res,
    result,
    "Access Token has been retrieved successfully",
    status.OK
  );
});

export const authMeController = catchAsync(async (req, res) => {
  const userInfo = req.user;
  const { businessUnitId } = req.query;

  const scope = businessUnitId ? { businessUnitId: String(businessUnitId) } : undefined;

  // console.log("Auth Me Scope:", scope);
  const result = await authMeService(userInfo, scope);
  // console.log("Auth Me Result:", result);
  ApiResponse.success(
    res,
    result,
    "Access Token has been retrieved successfully",
    status.OK
  );
});

export const logoutController = catchAsync(async (_req, res) => {
  await logoutService();
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false, // Match login/refresh
    sameSite: "lax", // Match login/refresh
    path: "/",
  });
  ApiResponse.success(
    res,
    null,
    "User has been logged out successfully",
    200
  );
});
