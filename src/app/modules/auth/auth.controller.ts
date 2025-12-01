import status from 'http-status'

import { authMeService, loginService, refreshTokenAuthService } from './auth.service.js'
import catchAsync from '@core/utils/catchAsync.ts'
import { ApiResponse } from '@core/utils/api-response.ts'
import appConfig from '@shared/config/app.config.ts'
import log from '@core/utils/logger.ts'



export const loginController = catchAsync(async (req, res) => {
  const { email, password } = req.body
  const data = await loginService(email, password)

     const { accessToken, refreshToken, needsPasswordChange, user } = data

      res.cookie("refreshToken", refreshToken, {
  httpOnly: true,         
  secure: appConfig.NODE_ENV === 'production',           
  sameSite: "strict",     
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000 
});


  ApiResponse.success(res, {
    success: true,
    statusCode: status.OK,
    message: 'User Login has been Successfully',
    data: { accessToken, needsPasswordChange, user},
  })
})






export const refreshTokenController = catchAsync(
  async (req, res) => {
    const { refreshToken } = req.cookies

    const result = await refreshTokenAuthService(refreshToken)

      res.cookie("refreshToken", refreshToken, {
  httpOnly: true,         
  secure: appConfig.NODE_ENV === 'production',           
  sameSite: "strict",     
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000 
});


      ApiResponse.success(res, {
    success: true,
    statusCode: status.OK,
   message: 'Access Token has been retrieved successfully',
    data: result,
  })
  },
)


export const authMeController = catchAsync(
  async (req, res) => {

 const userInfo = req.user;

    const result = await authMeService(userInfo)

      ApiResponse.success(res, {
    success: true,
    statusCode: status.OK,
   message: 'Access Token has been retrieved successfully',
    data: result,
  })
  },
)