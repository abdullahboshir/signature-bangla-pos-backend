import { createToken, verifyToken } from "./auth.utils.ts";
import { USER_STATUS } from "../iam/user/user.constant.ts";
import { User } from "../iam/user/user.model.ts";
import appConfig from "@shared/config/app.config.ts";
import AppError from "@shared/errors/app-error.ts";
import status from "http-status";

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

  
 const allRoles = isUserExists.roles?.map(r => r.name) ?? [];

  
  console.log("isUserExists:", allRoles);
  
  const jwtPayload: any = {
    userId: isUserExists?._id,
    email: isUserExists?.email,
    role: allRoles,
    permissions: isUserExists?.directPermissions || [],
    businessUnit: isUserExists.businessUnitId || ['telemedicine', 'clothing', 'all-business-units'],
    id: isUserExists?.id,
  };
  // console.log("User logged in:", isUserExists, jwtPayload);
  
  const accessToken = createToken(
    jwtPayload,
    appConfig.jwt_access_secret as string,
    appConfig.jwt_access_expired_in as string
  );

  const refreshToken = createToken(
    jwtPayload,
    appConfig.jwt_refresh_secret as string,
    appConfig.jwt_refresh_expired_in as string
  );



  return {
    accessToken,
    refreshToken,
    needsPasswordChange: isUserExists?.needsPasswordChange,
    user: jwtPayload,
  };
};









export const refreshTokenAuthService = async (token: string) => {
  if (!token) {
    throw new AppError(status.UNAUTHORIZED, 'You are not authorized!')
  }

  const decoded = verifyToken(token, appConfig.jwt_refresh_secret as string)

  const { userId, iat } = decoded

  const isUserExists = await User.findOne(userId)

  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, 'User is not found')
  }

  const isDeleted = isUserExists.isDeleted
  if (isDeleted) {
    throw new AppError(status.FORBIDDEN, 'this User is deleted')
  }

  const userStatus = isUserExists.status
  if (userStatus === 'blocked') {
    throw new AppError(status.FORBIDDEN, 'this User is blocked')
  }

  if (userStatus === 'inactive') {
    throw new AppError(status.FORBIDDEN, 'this User is inactive')
  }

  if (
    isUserExists?.passwordChangedAt &&
    User.isJWTIssuedBeforePasswordChanged(
      isUserExists.passwordChangedAt,
      iat as number,
    )
  ) {
    throw new AppError(status.UNAUTHORIZED, 'You are not authorized')
  }


   const allRoles = isUserExists.roles?.map(r => r.name) ?? [];

  const jwtPayload: any = {
    userId: isUserExists?._id,
    email: isUserExists?.email,
    role: allRoles,
    permissions: isUserExists?.directPermissions || [],
    businessUnit: isUserExists.businessUnitId || ['telemedicine', 'clothing', 'all-business-units'],
    id: isUserExists?.id,
  };

  const accessToken = createToken(
    jwtPayload,
    appConfig.jwt_access_secret as string,
    appConfig.jwt_access_expired_in as string,
  )

  return {
    accessToken,
  }
}
