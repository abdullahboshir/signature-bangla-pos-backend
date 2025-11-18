import status from "http-status";
import AppError from "../../errors/AppError.js";
import { USER_STATUS } from "../user/user.constant.js";
import config from "../../config/app.config.js";
import { createToken } from "./auth.utils.js";
import { User } from "../user/user.model.js";

export const loginService = async (email: string, pass: string) => {
  const isUserExists = await User.isUserExists(email);

  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User is not found");
  }

  const isDeleted = isUserExists.isDeleted;

  if (isDeleted) {
    throw new AppError(status.FORBIDDEN, "this User is deleted");
  }

  const userStatus = isUserExists.status;

  if (userStatus === USER_STATUS.BLOCKED) {
    throw new AppError(status.FORBIDDEN, "this User is blocked");
  }

  if (!(await User.isPasswordMatched(pass, isUserExists.password as unknown as string))) {
    throw new AppError(status.FORBIDDEN, "password deos not matched");
  }

  const jwtPayload: any = {
    userId: isUserExists?._id,
    email: isUserExists?.email,
    role: isUserExists?.roles?.[0]?.toString?.() || undefined,
    id: isUserExists?.id,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expired_in as string
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expired_in as string
  );

  return {
    accessToken,
    refreshToken,
    needsPasswordChange: isUserExists?.needsPasswordChange,
    user: isUserExists,
  };
};
