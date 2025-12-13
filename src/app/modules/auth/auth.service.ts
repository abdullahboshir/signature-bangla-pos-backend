import { createToken, verifyToken } from "./auth.utils.ts";
import { USER_STATUS } from "../iam/user/user.constant.ts";
import { User } from "../iam/user/user.model.ts";
// Force registration of BusinessUnit model to prevent MissingSchemaError during populate
import "../organization/business-unit/business-unit.model.ts";
import "../iam/role/role.model.ts";
import "../iam/permission/permission.model.ts";
import appConfig from "@shared/config/app.config.ts";
import AppError from "@shared/errors/app-error.ts";
import status from "http-status";

export const loginService = async (email: string, pass: string) => {
  const isUserExists = await User.isUserExists(email);
  console.info("LOGIN DEBUG - Email:", email, "Pass:", pass);
  console.info("I AM FROM AUTH SERVICE:", isUserExists);


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


  const allRoles = isUserExists.roles?.map((r: any) => r.name) ?? [];

  const jwtPayload: any = {
    userId: isUserExists?._id,
    id: isUserExists?.id,
    email: isUserExists?.email,
    role: allRoles
  };

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

  // console.log('userrrrrrrrrrrrrrrrrrrrrrrrr', isUserExists.businessUnits)

  const businessUnits = isUserExists.businessUnits?.map((bu: any) => ({
    _id: bu._id,
    name: bu.name,
    id: bu.id // This is likely the slug/custom ID used in URLs
  })) ?? [];
  const userInfo = {
    userId: isUserExists?._id,
    id: isUserExists?.id,
    email: isUserExists?.email,
    role: allRoles, // Array of strings (legacy/simple)
    roles: isUserExists.roles, // Array of objects (populated)
    permissions: isUserExists?.directPermissions || [],
    businessUnits: businessUnits // sending full object array
  }

  return {
    accessToken,
    refreshToken,
    needsPasswordChange: isUserExists?.needsPasswordChange,
    user: userInfo
  };
};

export const refreshTokenAuthService = async (token: string) => {
  if (!token) {
    throw new AppError(status.UNAUTHORIZED, 'You are not authorized!')
  }

  const decoded = verifyToken(token, appConfig.jwt_refresh_secret as string)
  const { userId, iat } = decoded

  // FIXED: find user by custom userId
  const isUserExists = await User.findOne({ _id: userId }).populate([{ path: 'businessUnits', select: 'name id' }, {
    path: 'roles',
    select: 'name permissions',
    populate: { path: 'permissions' }
  }]).lean()


  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, 'User is not found')
  }

  if (isUserExists.isDeleted) {
    throw new AppError(status.FORBIDDEN, 'This user is deleted')
  }

  if (isUserExists.status === 'blocked') {
    throw new AppError(status.FORBIDDEN, 'This user is blocked')
  }

  if (isUserExists.status === 'inactive') {
    throw new AppError(status.FORBIDDEN, 'This user is inactive')
  }

  if (
    isUserExists.passwordChangedAt &&
    User.isJWTIssuedBeforePasswordChanged(
      isUserExists.passwordChangedAt,
      iat as number
    )
  ) {
    throw new AppError(status.UNAUTHORIZED, 'You are not authorized')
  }


  const allRoles = isUserExists.roles?.map((r: any) => r.name) ?? [];


  const jwtPayload: any = {
    userId: isUserExists?._id,
    id: isUserExists?.id,
    email: isUserExists?.email,
    role: allRoles,
    roleIds: allRoles
  };

  const accessToken = createToken(
    jwtPayload,
    appConfig.jwt_access_secret as string,
    appConfig.jwt_access_expired_in as string
  )

  return { accessToken }
}


export const authMeService = async (userInfo: any) => {

  const res = await User.findOne({ _id: userInfo.userId }).populate([{ path: 'businessUnits', select: 'name id slug' }, {
    path: 'roles',
    select: 'name permissions',
    populate: { path: 'permissions' }
  }]).lean();

  if (res) {
    // Standardize response: Add 'role' (string array) to match loginService
    (res as any).role = res.roles?.map((r: any) => r.name) || [];
  }

  return res;
}



export const logoutService = async () => {
  return true;
};
