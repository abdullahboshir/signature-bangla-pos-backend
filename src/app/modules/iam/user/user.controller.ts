import catchAsync from '../../utils/catchAsync.js';
import { createCustomerService, createVendorService, getUsersService } from './user.service.js';
import sendResponse from '../../utils/sendResponse.js';
import status from 'http-status';


export const createCustomerController = catchAsync(async (req: any, res) => {
  const {customerData, password} = req.body;
  const data = await createCustomerService(customerData, password, req?.file)

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: 'Account has been Created Successfully',
    data,
  })
})


export const createVendorController = catchAsync(async (req: any, res) => {
  const {vendorData, password} = req.body;
  const data = await createVendorService(vendorData, password, req?.file)

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: 'Account has been Created Successfully',
    data,
  })
})


export const getUsersController = catchAsync(async (req: any, res) => {
  const data = await getUsersService()

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: 'Users has been retrieved Successfully',
    data,
  })
})
