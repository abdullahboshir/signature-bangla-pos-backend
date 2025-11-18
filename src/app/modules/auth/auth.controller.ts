import status from 'http-status'
import catchAsync from '../../utils/catchAsync.js'
import { loginService } from './auth.service.js'
import sendResponse from '../../utils/sendResponse.js'


export const loginController = catchAsync(async (req, res) => {
  const { email, password } = req.body
  const data = await loginService(email, password)

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: 'User Login has been Successfully',
    data,
  })
})
